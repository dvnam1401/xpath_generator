
import { PriorityLevel, GeneratedLocator, Language, TestTool, ProgrammingLanguage } from '../types';
import { translations } from './translations';

// Mapping of Tools to their supported Languages based on the request
export const TOOL_LANGUAGES: Record<TestTool, ProgrammingLanguage[]> = {
  'selenium': ['java', 'python', 'csharp', 'javascript', 'ruby'],
  'playwright': ['javascript', 'typescript', 'python', 'java', 'csharp'],
  'cypress': ['javascript', 'typescript'],
  'appium': ['java', 'python', 'javascript', 'csharp', 'ruby'],
  'katalon': ['groovy'],
  'robot': ['robot']
};

/**
 * Parses raw HTML string into a DOM element.
 */
const parseHTML = (html: string): { target: HTMLElement | null, container: HTMLElement } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return {
    target: doc.body.firstElementChild as HTMLElement,
    container: doc.body
  };
};

/**
 * Checks if an ID or Class looks dynamic.
 */
const isDynamicValue = (val: string): boolean => {
  if (!val) return false;
  if (val.startsWith('data-v-') || val.startsWith('css-') || val.startsWith('ng-') || val.startsWith('sc-')) return true;
  if (/^[0-9]/.test(val)) return true;
  if (/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(val)) return true;
  if (/[a-zA-Z]-?[\d]{3,}/.test(val)) return true;
  if (/[a-zA-Z0-9]{15,}/.test(val)) return true;
  return false;
};

/**
 * Generates code snippet based on the selected Tool and Language.
 */
const formatCode = (method: string, value: string, tool: TestTool, lang: ProgrammingLanguage): string => {
  const safeVal = value.replace(/"/g, '\\"');
  const safeValSingle = value.replace(/'/g, "\\'");

  // --- ROBOT FRAMEWORK (Keyword Driven) ---
  if (tool === 'robot') {
    switch (method) {
      case 'id': return `id=${value}`;
      case 'name': return `name=${value}`;
      case 'linkText': return `link=${value}`;
      case 'css': return `css=${value}`;
      case 'xpath': return `xpath=${value}`;
      default: return value;
    }
  }

  // --- CYPRESS (JS/TS only) ---
  if (tool === 'cypress') {
    switch (method) {
      case 'id': return `cy.get('#${safeValSingle}')`;
      case 'name': return `cy.get('[name="${safeValSingle}"]')`;
      case 'linkText': return `cy.contains('${safeValSingle}')`;
      case 'css': return `cy.get('${safeValSingle}')`;
      case 'xpath': return `cy.xpath('${safeValSingle}')`;
      default: return value;
    }
  }

  // --- KATALON (Groovy) ---
  if (tool === 'katalon') {
    // Generates code to create a TestObject programmatically or find one
    // Assuming raw script usage
    const byType = method === 'xpath' ? 'XPATH' : 'CSS';
    const selector = method === 'xpath' ? value : (method === 'id' ? `#${value}` : value);
    if (method === 'xpath' || method === 'css') {
       return `new TestObject().addProperty("${method}", ConditionType.EQUALS, "${safeVal}")`;
    }
    // Fallback for basic WebUI
    return `WebUI.click(findTestObject('${safeVal}')) // Placeholder`;
  }

  // --- PLAYWRIGHT ---
  if (tool === 'playwright') {
    const locator = method === 'xpath' ? `xpath=${safeValSingle}` : 
                    method === 'id' ? `#${safeValSingle}` :
                    method === 'css' ? safeValSingle :
                    method === 'name' ? `[name="${safeValSingle}"]` : null;

    if (method === 'linkText') {
      return `page.getByText('${safeValSingle}', { exact: true })`;
    }

    if (locator) {
      return `page.locator('${locator}')`;
    }
  }

  // --- SELENIUM & APPIUM (Shared Logic by Language) ---
  if (tool === 'selenium' || tool === 'appium') {
    if (lang === 'java') {
      switch (method) {
        case 'id': return `driver.findElement(By.id("${safeVal}"));`;
        case 'name': return `driver.findElement(By.name("${safeVal}"));`;
        case 'linkText': return `driver.findElement(By.linkText("${safeVal}"));`;
        case 'css': return `driver.findElement(By.cssSelector("${safeVal}"));`;
        case 'xpath': return `driver.findElement(By.xpath("${safeVal}"));`;
      }
    }
    
    if (lang === 'python') {
      switch (method) {
        case 'id': return `driver.find_element(By.ID, "${safeVal}")`;
        case 'name': return `driver.find_element(By.NAME, "${safeVal}")`;
        case 'linkText': return `driver.find_element(By.LINK_TEXT, "${safeVal}")`;
        case 'css': return `driver.find_element(By.CSS_SELECTOR, "${safeVal}")`;
        case 'xpath': return `driver.find_element(By.XPATH, "${safeVal}")`;
      }
    }

    if (lang === 'csharp') {
      switch (method) {
        case 'id': return `driver.FindElement(By.Id("${safeVal}"));`;
        case 'name': return `driver.FindElement(By.Name("${safeVal}"));`;
        case 'linkText': return `driver.FindElement(By.LinkText("${safeVal}"));`;
        case 'css': return `driver.FindElement(By.CssSelector("${safeVal}"));`;
        case 'xpath': return `driver.FindElement(By.XPath("${safeVal}"));`;
      }
    }

    if (lang === 'javascript' || lang === 'typescript') {
      switch (method) {
        case 'id': return `await driver.findElement(By.id("${safeVal}"));`;
        case 'name': return `await driver.findElement(By.name("${safeVal}"));`;
        case 'linkText': return `await driver.findElement(By.linkText("${safeVal}"));`;
        case 'css': return `await driver.findElement(By.css("${safeVal}"));`;
        case 'xpath': return `await driver.findElement(By.xpath("${safeVal}"));`;
      }
    }

    if (lang === 'ruby') {
      switch (method) {
        case 'id': return `driver.find_element(id: '${safeValSingle}')`;
        case 'name': return `driver.find_element(name: '${safeValSingle}')`;
        case 'linkText': return `driver.find_element(link_text: '${safeValSingle}')`;
        case 'css': return `driver.find_element(css: '${safeValSingle}')`;
        case 'xpath': return `driver.find_element(xpath: '${safeValSingle}')`;
      }
    }
  }

  return value;
};

export const generateXPaths = (rawHtml: string, lang: Language = 'en', tool: TestTool = 'selenium', progLang: ProgrammingLanguage = 'java'): GeneratedLocator[] => {
  const results: GeneratedLocator[] = [];
  const { target: element, container } = parseHTML(rawHtml);
  const t = translations[lang].generator;

  if (!element) return [];

  const tagName = element.tagName.toLowerCase();
  const rawId = element.id;
  const rawName = element.getAttribute('name');
  
  const rawTextContent = element.textContent || '';
  const trimmedText = rawTextContent.trim();
  const hasNewLines = /[\n\r]/.test(rawTextContent);
  
  const rawClass = element.getAttribute('class') || '';

  // --- 1. ID STRATEGY ---
  if (rawId) {
    const isDynamic = isDynamicValue(rawId);
    if (!isDynamic) {
      results.push({
        id: 'strat-id-robust',
        method: 'id',
        value: rawId,
        codeSnippet: formatCode('id', rawId, tool, progLang),
        priority: PriorityLevel.ROBUST_ID,
        description: t.id_robust,
        stability: 'High'
      });
      
      results.push({
        id: 'strat-css-id',
        method: 'css',
        value: `${tagName}#${rawId}`,
        codeSnippet: formatCode('css', `${tagName}#${rawId}`, tool, progLang),
        priority: PriorityLevel.CSS_ID,
        description: t.css_id,
        stability: 'High'
      });
    } else {
      results.push({
        id: 'strat-id-dynamic',
        method: 'id',
        value: rawId,
        codeSnippet: formatCode('id', rawId, tool, progLang),
        priority: PriorityLevel.DYNAMIC_ID,
        description: t.id_dynamic,
        stability: 'Low'
      });
    }
  }

  // --- 2. NAME STRATEGY ---
  if (rawName) {
    results.push({
      id: 'strat-name',
      method: 'name',
      value: rawName,
      codeSnippet: formatCode('name', rawName, tool, progLang),
      priority: PriorityLevel.NAME,
      description: t.name,
      stability: 'High' 
    });
  }

  // --- 3. LINK TEXT STRATEGY ---
  if (tagName === 'a' && trimmedText) {
    if (trimmedText.length < 50) {
      results.push({
        id: 'strat-link-text',
        method: 'linkText',
        value: trimmedText,
        codeSnippet: formatCode('linkText', trimmedText, tool, progLang),
        priority: PriorityLevel.LINK_TEXT,
        description: t.link_text,
        stability: 'Medium' 
      });
    }
  }

  // --- 4. CSS SELECTORS ---
  if (rawClass) {
    const classes = rawClass.split(/\s+/).filter(c => c.length > 0);
    let validClasses = classes.filter(c => !isDynamicValue(c));

    validClasses.sort((a, b) => {
      const aIsBEM = a.includes('--') || a.includes('__');
      const bIsBEM = b.includes('--') || b.includes('__');
      if (aIsBEM && !bIsBEM) return -1;
      if (!aIsBEM && bIsBEM) return 1;
      
      const generics = ['text', 'span', 'label', 'wrapper', 'container', 'active', 'layout', 'flex', 'box', 'inner', 'outer', 'content'];
      const aGen = generics.some(g => a.toLowerCase().includes(g));
      const bGen = generics.some(g => b.toLowerCase().includes(g));
      if (!aGen && bGen) return -1;
      if (aGen && !bGen) return 1;
      
      return b.length - a.length;
    });

    if (validClasses.length > 0) {
      const bestClass = validClasses[0];
      const isBEM = bestClass.includes('--') || bestClass.includes('__');
      
      results.push({
        id: 'strat-css-class',
        method: 'css',
        value: `${tagName}.${bestClass}`,
        codeSnippet: formatCode('css', `${tagName}.${bestClass}`, tool, progLang),
        priority: PriorityLevel.CSS_CLASS,
        description: t.css_class,
        stability: isBEM ? 'High' : 'Medium'
      });

      if (validClasses.length > 1) {
         const combined = validClasses.slice(0, 2).map(c => `.${c}`).join('');
         results.push({
            id: 'strat-css-multi-class',
            method: 'css',
            value: `${tagName}${combined}`,
            codeSnippet: formatCode('css', `${tagName}${combined}`, tool, progLang),
            priority: PriorityLevel.CSS_CLASS, 
            description: t.css_class_multi,
            stability: 'Medium'
         });
      }
    }
  }

  // Attributes
  Array.from(element.attributes).forEach(attr => {
    const name = attr.name;
    const val = attr.value;
    if (name === 'id' || name === 'class' || name === 'style' || name.startsWith('data-v-') || name.startsWith('ng-')) return;
    
    const isImportant = ['placeholder', 'name', 'type', 'data-testid', 'data-cy', 'role', 'title', 'alt', 'for'].includes(name);
    if (isImportant || (val && val.length < 30)) {
        const isTestId = name.startsWith('data-test') || name.startsWith('data-cy');
        results.push({
          id: `strat-css-attr-${name}`,
          method: 'css',
          value: `${tagName}[${name}='${val}']`,
          codeSnippet: formatCode('css', `${tagName}[${name}='${val}']`, tool, progLang),
          priority: isTestId ? PriorityLevel.CSS_ID : PriorityLevel.CSS_ATTR,
          description: t.css_attr(name),
          stability: isTestId ? 'High' : 'Medium'
        });
    }
  });

  // --- 5. XPATH STRATEGY ---
  if (rawId) {
    const label = container.querySelector(`label[for="${rawId}"]`);
    if (label && label.textContent) {
       const labelText = label.textContent.trim();
       if (labelText) {
         const safeLabel = labelText.includes("'") ? `"${labelText}"` : `'${labelText}'`;
         const xpath = `//label[normalize-space()=${safeLabel}]/following-sibling::${tagName}`;
         results.push({
           id: 'strat-xpath-label',
           method: 'xpath',
           value: xpath,
           codeSnippet: formatCode('xpath', xpath, tool, progLang),
           priority: PriorityLevel.XPATH_LABEL,
           description: t.xpath_label,
           stability: 'High'
         });
       }
    }
  }

  if (trimmedText.length > 0) {
    const safeText = trimmedText.includes("'") ? `"${trimmedText}"` : `'${trimmedText}'`;
    if (trimmedText.length < 50) {
      results.push({
        id: 'strat-xpath-normalize',
        method: 'xpath',
        value: `//${tagName}[normalize-space()=${safeText}]`,
        codeSnippet: formatCode('xpath', `//${tagName}[normalize-space()=${safeText}]`, tool, progLang),
        priority: PriorityLevel.XPATH_TEXT,
        description: t.xpath_text,
        stability: 'Medium'
      });
    }

    if (!hasNewLines && rawTextContent === trimmedText && trimmedText.length < 50) {
      results.push({
        id: 'strat-xpath-exact',
        method: 'xpath',
        value: `//${tagName}[text()=${safeText}]`,
        codeSnippet: formatCode('xpath', `//${tagName}[text()=${safeText}]`, tool, progLang),
        priority: PriorityLevel.XPATH_TEXT, 
        description: t.xpath_text_exact,
        stability: 'High'
      });
    }

    const shortText = trimmedText.substring(0, 20);
    const safeShort = shortText.includes("'") ? `"${shortText}"` : `'${shortText}'`;
    results.push({
        id: 'strat-xpath-contains',
        method: 'xpath',
        value: `//${tagName}[contains(text(), ${safeShort})]`,
        codeSnippet: formatCode('xpath', `//${tagName}[contains(text(), ${safeShort})]`, tool, progLang),
        priority: PriorityLevel.XPATH_TEXT + 1,
        description: t.xpath_contains,
        stability: 'Medium'
    });
  }

  if (!rawId && !rawName) {
     const type = element.getAttribute('type');
     if (type) {
        results.push({
            id: 'strat-xpath-attr',
            method: 'xpath',
            value: `//${tagName}[@type='${type}']`,
            codeSnippet: formatCode('xpath', `//${tagName}[@type='${type}']`, tool, progLang),
            priority: PriorityLevel.XPATH_COMPLEX,
            description: t.xpath_attr,
            stability: 'Medium'
        });
     }
  }

  return results.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const stabilityWeight: Record<string, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };
    const sA = stabilityWeight[a.stability] || 2;
    const sB = stabilityWeight[b.stability] || 2;
    if (sA !== sB) return sA - sB;
    return a.value.length - b.value.length;
  });
};
