
import { GeneratedLocator, TestTool, ProgrammingLanguage } from '../types';

// --- Naming Utils ---

const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
};

const toPascalCase = (str: string): string => {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const toSnakeCase = (str: string): string => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    .join('_') || str.toLowerCase().replace(/\s+/g, '_');
};

const cleanVarName = (name: string, lang: ProgrammingLanguage): string => {
  let clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  if (!clean) clean = 'element_' + Math.floor(Math.random() * 1000);
  
  if (lang === 'python' || lang === 'ruby' || lang === 'robot') {
    return toSnakeCase(clean);
  } else if (lang === 'csharp') {
    return toPascalCase(clean);
  } else {
    // Java, JS, TS
    return toCamelCase(clean);
  }
};

// --- Templates ---

export const generatePOM = (
  locators: GeneratedLocator[], 
  tool: TestTool, 
  lang: ProgrammingLanguage
): string => {
  const lines: string[] = [];
  const className = "MyPage";
  
  // Track used variable names to ensure uniqueness
  const usedNames = new Set<string>();

  const getUniqueName = (baseName: string): string => {
    let candidate = baseName;
    let counter = 2;
    while (usedNames.has(candidate)) {
      candidate = `${baseName}${counter}`;
      counter++;
    }
    usedNames.add(candidate);
    return candidate;
  };

  // Header
  if (lang === 'java') {
    lines.push(`public class ${className} {`);
    lines.push(`    WebDriver driver;`);
    lines.push('');
    lines.push(`    public ${className}(WebDriver driver) {`);
    lines.push(`        this.driver = driver;`);
    lines.push(`    }`);
    lines.push('');
  } else if (lang === 'csharp') {
    lines.push(`public class ${className}`);
    lines.push(`{`);
    lines.push(`    private IWebDriver driver;`);
    lines.push('');
    lines.push(`    public ${className}(IWebDriver driver)`);
    lines.push(`    {`);
    lines.push(`        this.driver = driver;`);
    lines.push(`    }`);
    lines.push('');
  } else if (tool === 'playwright' && (lang === 'typescript' || lang === 'javascript')) {
    lines.push(`import { Page, Locator } from '@playwright/test';`);
    lines.push('');
    lines.push(`export class ${className} {`);
    lines.push(`    readonly page: Page;`);
  } else if (lang === 'python') {
    lines.push(`class ${className}:`);
    lines.push(`    def __init__(self, driver):`);
    lines.push(`        self.driver = driver`);
    lines.push('');
  }

  // Variables
  locators.forEach(loc => {
    const rawName = cleanVarName(loc.elementName || 'element', lang);
    const varName = getUniqueName(rawName);
    
    if (lang === 'java') {
      // Selenium Java (By)
      let locatorCode = loc.codeSnippet.replace('driver.findElement(', '').replace(');', ''); // Extract "By.id(...)"
      if (!locatorCode.startsWith('By.')) locatorCode = `By.xpath("${loc.value.replace(/"/g, '\\"')}")`; // Fallback
      lines.push(`    By ${varName} = ${locatorCode};`);
    } 
    else if (lang === 'csharp') {
      // Selenium C#
      let locatorCode = loc.codeSnippet.replace('driver.FindElement(', '').replace(');', '');
      if (!locatorCode.startsWith('By.')) locatorCode = `By.XPath("${loc.value.replace(/"/g, '\\"')}")`;
      lines.push(`    private readonly By ${varName} = ${locatorCode};`);
    }
    else if (tool === 'playwright') {
      // Playwright TS/JS
      if (lang === 'typescript') {
        lines.push(`    readonly ${varName}: Locator;`);
      }
      // Constructor initialization for Playwright is handled below
    }
    else if (lang === 'python') {
        // Python usually defines locators as tuples: (By.ID, "foo")
        let strategy = "By.XPATH";
        let value = loc.value;
        
        if (loc.method === 'id') strategy = "By.ID";
        else if (loc.method === 'name') strategy = "By.NAME";
        else if (loc.method === 'css') strategy = "By.CSS_SELECTOR";
        else if (loc.method === 'linkText') strategy = "By.LINK_TEXT";
        
        lines.push(`    ${varName.toUpperCase()} = (${strategy}, "${value}")`);
    }
  });

  // Constructor Body (Playwright)
  if (tool === 'playwright') {
    lines.push('');
    lines.push(`    constructor(page: Page) {`);
    lines.push(`        this.page = page;`);
    
    // Reset used names for the constructor loop since we need to match the variables defined above
    // Actually, we can iterate locators again and regenerate names in the same deterministic way
    const constructorUsedNames = new Set<string>();
    const getConstructorUniqueName = (baseName: string): string => {
        let candidate = baseName;
        let counter = 2;
        while (constructorUsedNames.has(candidate)) {
          candidate = `${baseName}${counter}`;
          counter++;
        }
        constructorUsedNames.add(candidate);
        return candidate;
    };

    locators.forEach(loc => {
        const rawName = cleanVarName(loc.elementName || 'element', lang);
        const varName = getConstructorUniqueName(rawName);
        
        // Try to extract proper Playwright locator syntax
        let code = loc.codeSnippet;
        if (code.startsWith('page.')) {
            code = code.replace(/^page\./, 'this.page.');
        } else {
            code = `this.page.locator('${loc.value.replace(/'/g, "\\'")}')`;
        }
        lines.push(`        this.${varName} = ${code};`);
    });
    lines.push(`    }`);
  }

  // Footer
  if (lang === 'java' || lang === 'csharp' || tool === 'playwright') {
    lines.push(`}`);
  }

  return lines.join('\n');
};
