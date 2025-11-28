
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
 * Checks if an ID or Class looks dynamic using advanced heuristics.
 */
const isDynamicValue = (val: string): boolean => {
  if (!val) return false;
  
  // Framework specific prefixes
  if (val.startsWith('data-v-') || val.startsWith('css-') || val.startsWith('ng-') || val.startsWith('sc-')) return true;
  
  // UUID pattern
  if (/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(val)) return true;

  // Long hex strings (often random hash)
  if (/[0-9a-fA-F]{10,}/.test(val)) return true;

  // Ends with long number series (e.g., input-12345)
  if (/-?\d{5,}$/.test(val)) return true;

  // Starts with number (often generated)
  if (/^\d/.test(val)) return true;

  // Combo of letters and long numbers (e.g. j_id123)
  if (/[a-zA-Z]+[-_]?\d{4,}/.test(val)) return true;

  return false;
};

/**
 * Generates code snippet based on the selected Tool and Language.
 */
const formatCode = (method: string, value: string, tool: TestTool, lang: ProgrammingLanguage, extra?: { role?: string, name?: string }): string => {
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
      case 'label': return `cy.contains('label', '${safeValSingle}').next()`; // Approximation
      default: return value;
    }
  }

  // --- KATALON (Groovy) ---
  if (tool === 'katalon') {
    if (method === 'xpath' || method === 'css') {
       return `new TestObject().addProperty("${method}", ConditionType.EQUALS, "${safeVal}")`;
    }
    return `WebUI.click(findTestObject('${safeVal}')) // Placeholder`;
  }

  // --- PLAYWRIGHT (Semantic Locators) ---
  if (tool === 'playwright') {
    if (method === 'role' && extra?.role) {
      const opts = extra.name ? `, { name: '${extra.name.replace(/'/g, "\\'")}' }` : '';
      return `page.getByRole('${extra.role}',${opts})`;
    }
    if (method === 'label') return `page.getByLabel('${safeValSingle}')`;
    if (method === 'placeholder') return `page.getByPlaceholder('${safeValSingle}')`;
    if (method === 'text' || method === 'linkText') return `page.getByText('${safeValSingle}', { exact: true })`;

    const locator = method === 'xpath' ? `xpath=${safeValSingle}` : 
                    method === 'id' ? `#${safeValSingle}` :
                    method === 'css' ? safeValSingle :
                    method === 'name' ? `[name="${safeValSingle}"]` : null;

    if (locator) return `page.locator('${locator}')`;
  }

  // --- SELENIUM & APPIUM ---
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

/**
 * Heuristic to guess a human-readable name for an element.
 */
const generateElementName = (el: Element): string => {
  const tag = el.tagName.toLowerCase();
  const type = el.getAttribute('type');
  const id = el.id;
  const name = el.getAttribute('name');
  const placeholder = el.getAttribute('placeholder');
  const text = el.textContent?.trim().substring(0, 20);
  const ariaLabel = el.getAttribute('aria-label');
  const role = el.getAttribute('role');

  let prefix = tag.toUpperCase();
  if (tag === 'input' && type) prefix = `${type.toUpperCase()} Input`;
  if (role === 'button' || tag === 'button') prefix = 'Button';
  if (tag === 'a') prefix = 'Link';
  if (tag === 'span' || tag === 'div') prefix = 'Element';
  if (tag === 'label') prefix = 'Label';
  if (tag === 'p') prefix = 'Text';
  if (tag.startsWith('h') && tag.length === 2) prefix = 'Heading';
  if (tag === 'img') prefix = 'Image';
  if (tag === 'svg') prefix = 'Icon';

  let suffix = '';
  if (placeholder) suffix = `"${placeholder}"`;
  else if (text && text.length > 0) suffix = `"${text}"`;
  else if (ariaLabel) suffix = `"${ariaLabel}"`;
  else if (name) suffix = `(name=${name})`;
  else if (id && !isDynamicValue(id)) suffix = `(#${id})`;

  return suffix ? `${prefix} ${suffix}` : `${prefix}`;
};

/**
 * Context-Aware Sorting based on Tool.
 */
const sortLocators = (locators: GeneratedLocator[], tool: TestTool): GeneratedLocator[] => {
  return locators.sort((a, b) => {
    let weightA: number = a.priority;
    let weightB: number = b.priority;

    // Adjust weights based on Tool
    if (tool === 'playwright') {
      // Playwright prefers Role, TestId, and Text
      if (a.priority === PriorityLevel.PLAYWRIGHT_ROLE) weightA = -10;
      if (b.priority === PriorityLevel.PLAYWRIGHT_ROLE) weightB = -10;
      if (a.priority === PriorityLevel.PLAYWRIGHT_TEXT) weightA = -5;
      if (b.priority === PriorityLevel.PLAYWRIGHT_TEXT) weightB = -5;
      // Deprioritize CSS/XPath in Playwright unless simple
      if (a.method === 'xpath') weightA += 5;
      if (b.method === 'xpath') weightB += 5;
    } else if (tool === 'cypress') {
      // Cypress prefers attributes like data-cy, data-test
      if (a.value.includes('data-cy') || a.value.includes('data-test')) weightA = -10;
      if (b.value.includes('data-cy') || b.value.includes('data-test')) weightB = -10;
    } else {
      // Selenium (Standard)
      // ID > Name > CSS > XPath
      if (a.priority === PriorityLevel.ROBUST_ID) weightA = -10;
      if (b.priority === PriorityLevel.ROBUST_ID) weightB = -10;
    }

    // Fallback to stability
    if (weightA === weightB) {
      if (a.stability === 'High' && b.stability !== 'High') return -1;
      if (b.stability === 'High' && a.stability !== 'High') return 1;
    }

    return weightA - weightB;
  });
};

/**
 * Internal function to generate locators for a single DOM element.
 */
const generateLocatorsForNode = (
  element: Element,
  container: HTMLElement,
  lang: Language,
  tool: TestTool,
  progLang: ProgrammingLanguage,
  elementName: string
): GeneratedLocator[] => {
  const results: GeneratedLocator[] = [];
  const t = translations[lang].generator;

  const tagName = element.tagName.toLowerCase();
  const rawId = element.id;
  const rawName = element.getAttribute('name');
  const rawTextContent = element.textContent || '';
  const trimmedText = rawTextContent.trim();
  const hasNewLines = /[\n\r]/.test(rawTextContent);
  const typeAttr = element.getAttribute('type');
  const placeholder = element.getAttribute('placeholder');
  const role = element.getAttribute('role') || tagName;
  const rawClass = element.getAttribute('class') || '';
  
  const hasElementChildren = element.firstElementChild !== null;
  const isLeafNode = !hasElementChildren;

  // --- PLAYWRIGHT SEMANTIC STRATEGIES ---
  if (tool === 'playwright') {
    const validRoles = ['button', 'checkbox', 'heading', 'img', 'link', 'radio', 'textbox', 'combobox', 'option', 'menuitem', 'tab'];
    let inferredRole = role;
    
    // Heuristic to detect roles for non-semantic tags
    if (tagName === 'button' || (tagName === 'input' && (typeAttr === 'submit' || typeAttr === 'button'))) inferredRole = 'button';
    if (tagName === 'a' && element.hasAttribute('href')) inferredRole = 'link';
    if (tagName === 'input' && (!typeAttr || typeAttr === 'text')) inferredRole = 'textbox';
    if (element.getAttribute('onclick') || element.hasAttribute('ng-click') || element.hasAttribute('@click')) inferredRole = 'button';

    if (validRoles.includes(inferredRole)) {
      let roleName = '';
      if (trimmedText && trimmedText.length < 30 && !hasElementChildren) roleName = trimmedText;
      if (!roleName && placeholder) roleName = placeholder;
      if (!roleName && element.getAttribute('alt')) roleName = element.getAttribute('alt') || '';
      if (!roleName && element.getAttribute('aria-label')) roleName = element.getAttribute('aria-label') || '';

      // Only generate if we have a name, or if it's a distinct role
      if (roleName || inferredRole === 'textbox' || inferredRole === 'checkbox') {
        results.push({
          id: `pw-role-${Math.random()}`,
          elementName,
          tagName, // Added tagName
          method: 'role',
          value: roleName ? `Role: ${inferredRole}, Name: "${roleName}"` : `Role: ${inferredRole}`,
          codeSnippet: formatCode('role', '', tool, progLang, { role: inferredRole, name: roleName }),
          priority: PriorityLevel.PLAYWRIGHT_ROLE,
          description: t.id_robust,
          stability: 'High'
        });
      }
    }

    if (placeholder) {
      results.push({
        id: `pw-placeholder-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'placeholder',
        value: placeholder,
        codeSnippet: formatCode('placeholder', placeholder, tool, progLang),
        priority: PriorityLevel.PLAYWRIGHT_ROLE,
        description: t.xpath_attr,
        stability: 'High'
      });
    }
  }

  // --- 1. ID STRATEGY ---
  if (rawId) {
    const isDynamic = isDynamicValue(rawId);
    const devToolsId = `#${rawId}`;
    
    if (!isDynamic) {
      results.push({
        id: `strat-id-robust-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'id',
        value: devToolsId,
        codeSnippet: formatCode('id', rawId, tool, progLang),
        priority: PriorityLevel.ROBUST_ID,
        description: t.id_robust,
        stability: 'High'
      });
      
      results.push({
        id: `strat-css-id-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'css',
        value: `${tagName}#${rawId}`,
        codeSnippet: formatCode('css', `${tagName}#${rawId}`, tool, progLang),
        priority: PriorityLevel.CSS_ID,
        description: t.css_id,
        stability: 'High'
      });
    } else {
      results.push({
        id: `strat-id-dynamic-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'id',
        value: devToolsId,
        codeSnippet: formatCode('id', rawId, tool, progLang),
        priority: PriorityLevel.DYNAMIC_ID,
        description: t.id_dynamic,
        stability: 'Low'
      });
    }
  }

  // --- 2. NAME STRATEGY ---
  if (rawName && !isDynamicValue(rawName)) {
    const devToolsName = `[name='${rawName}']`;
    results.push({
      id: `strat-name-${Math.random()}`,
      elementName,
      tagName, // Added tagName
      method: 'name',
      value: devToolsName,
      codeSnippet: formatCode('name', rawName, tool, progLang),
      priority: PriorityLevel.NAME,
      description: t.name,
      stability: 'High' 
    });
  }

  // --- 3. LABEL STRATEGY ---
  if (rawId) {
    const label = container.querySelector(`label[for="${rawId}"]`);
    if (label && label.textContent) {
       const labelText = label.textContent.trim();
       if (labelText) {
         if (tool === 'playwright') {
            results.push({
              id: `pw-label-${Math.random()}`,
              elementName,
              tagName, // Added tagName
              method: 'label',
              value: labelText,
              codeSnippet: formatCode('label', labelText, tool, progLang),
              priority: PriorityLevel.LABEL_FOR,
              description: t.xpath_label,
              stability: 'High'
            });
         } else {
             const safeLabel = labelText.includes("'") ? `"${labelText}"` : `'${labelText}'`;
             const xpath = `//label[normalize-space()=${safeLabel}]/following::${tagName}[1]`; 
             results.push({
               id: `strat-xpath-label-${Math.random()}`,
               elementName,
               tagName, // Added tagName
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
  }

  // --- 4. LINK TEXT STRATEGY ---
  if (tagName === 'a' && trimmedText) {
    if (trimmedText.length < 50) {
      const safeText = trimmedText.includes("'") ? `"${trimmedText}"` : `'${trimmedText}'`;
      const devToolsXPath = isLeafNode ? `//a[text()=${safeText}]` : `//a[normalize-space()=${safeText}]`;

      results.push({
        id: `strat-link-text-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'linkText',
        value: devToolsXPath, 
        codeSnippet: formatCode('linkText', trimmedText, tool, progLang),
        priority: PriorityLevel.LINK_TEXT,
        description: t.link_text,
        stability: 'Medium' 
      });
    }
  }

  // --- 5. CSS SELECTORS & CLASS COMBINATIONS ---
  if (rawClass) {
    const classes = rawClass.split(/\s+/).filter(c => c.length > 0);
    const validClasses = classes.filter(c => !isDynamicValue(c));
    
    // Strategy 5a: Generate individual class selectors
    validClasses.forEach(cls => {
      results.push({
        id: `strat-css-class-${cls}-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'css',
        value: `${tagName}.${cls}`,
        codeSnippet: formatCode('css', `${tagName}.${cls}`, tool, progLang),
        priority: PriorityLevel.CSS_CLASS,
        description: t.css_class, // "Good if class names are meaningful..."
        stability: 'Medium'
      });
    });

    // Strategy 5b: Multi-class selector (if multiple valid classes exist)
    if (validClasses.length > 1) {
      const multiClass = `.${validClasses.join('.')}`;
      results.push({
        id: `strat-css-multi-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'css',
        value: `${tagName}${multiClass}`,
        codeSnippet: formatCode('css', `${tagName}${multiClass}`, tool, progLang),
        priority: PriorityLevel.CSS_CLASS,
        description: t.css_class_multi,
        stability: 'High'
      });
    }
  }

  // --- 6. ATTRIBUTES (CSS + XPath) ---
  Array.from(element.attributes).forEach(attr => {
    const name = attr.name;
    const val = attr.value;
    if (name === 'id' || name === 'class' || name === 'style' || name.startsWith('data-v-') || name.startsWith('ng-')) return;
    
    const isImportant = ['placeholder', 'name', 'type', 'data-testid', 'data-cy', 'role', 'title', 'alt', 'for', 'href', 'src', 'value', 'aria-label'].includes(name);
    
    if (isImportant || (val && val.length < 40)) {
        const isTestId = name.startsWith('data-test') || name.startsWith('data-cy');
        const safeVal = val.replace(/'/g, "\\'"); // For XPath
        
        // CSS Version
        results.push({
          id: `strat-css-attr-${name}-${Math.random()}`,
          elementName,
          tagName, // Added tagName
          method: 'css',
          value: `${tagName}[${name}='${val}']`,
          codeSnippet: formatCode('css', `${tagName}[${name}='${val}']`, tool, progLang),
          priority: isTestId ? PriorityLevel.CSS_ID : PriorityLevel.CSS_ATTR,
          description: t.css_attr(name),
          stability: isTestId ? 'High' : 'Medium'
        });

        // XPath Version (User requested more options)
        const xpathAttr = `//${tagName}[@${name}='${safeVal}']`;
        results.push({
          id: `strat-xpath-attr-${name}-${Math.random()}`,
          elementName,
          tagName, // Added tagName
          method: 'xpath',
          value: xpathAttr,
          codeSnippet: formatCode('xpath', xpathAttr, tool, progLang),
          priority: PriorityLevel.XPATH_COMPLEX,
          description: t.xpath_attr,
          stability: 'Medium'
        });
    }
  });

  // --- 7. XPATH TEXT STRATEGIES ---
  if (trimmedText.length > 0 && !['script', 'style', 'select', 'svg'].includes(tagName)) {
    const safeText = trimmedText.includes("'") ? `"${trimmedText}"` : `'${trimmedText}'`;
    
    // Strategy A: Exact Match
    // Only generates if strict conditions met, but we now allow Normalized to exist alongside.
    if (isLeafNode && !hasNewLines && rawTextContent === trimmedText) {
      const xpath = `//${tagName}[text()=${safeText}]`;
      results.push({
        id: `strat-xpath-text-exact-${Math.random()}`,
        elementName,
        tagName, // Added tagName
        method: 'xpath',
        value: xpath,
        codeSnippet: formatCode('xpath', xpath, tool, progLang),
        priority: PriorityLevel.XPATH_TEXT,
        description: t.xpath_text_exact,
        stability: 'High'
      });

      // Strategy A2: Combined Text + Class (High Specificity)
      // Example: //span[text()='Admin' and @class='oxd-text']
      if (rawClass) {
         const classes = rawClass.split(/\s+/).filter(c => !isDynamicValue(c));
         if (classes.length > 0) {
             const firstClass = classes[0]; // Use the first valid class
             const xpathCombo = `//${tagName}[text()=${safeText} and contains(@class, '${firstClass}')]`;
             results.push({
                id: `strat-xpath-text-class-${Math.random()}`,
                elementName,
                tagName, // Added tagName
                method: 'xpath',
                value: xpathCombo,
                codeSnippet: formatCode('xpath', xpathCombo, tool, progLang),
                priority: PriorityLevel.XPATH_COMPLEX,
                description: 'Highly specific: Matches both text and class.',
                stability: 'High'
             });
         }
      }
    }

    // Strategy B: Normalized Match (Always available for text)
    if (trimmedText.length < 200) {
        const xpathNorm = `//${tagName}[normalize-space()=${safeText}]`;
        results.push({
            id: `strat-xpath-text-norm-${Math.random()}`,
            elementName,
            tagName, // Added tagName
            method: 'xpath',
            value: xpathNorm,
            codeSnippet: formatCode('xpath', xpathNorm, tool, progLang),
            priority: PriorityLevel.XPATH_TEXT,
            description: t.xpath_text,
            stability: 'High'
        });
    }

    // Strategy C: Contains Text (Flexible)
    // Lowered threshold to > 2 chars to catch "Add", "Ok", "Admin"
    if (trimmedText.length > 2 && trimmedText.length < 100) {
       const part = trimmedText.substring(0, 25); 
       const safePart = part.includes("'") ? `"${part}"` : `'${part}'`;
       
       // Variation C1: contains(text(), ...) - Target specific text node
       if (isLeafNode) {
           const xpath = `//${tagName}[contains(text(), ${safePart})]`;
           results.push({
              id: `strat-xpath-contains-text-${Math.random()}`,
              elementName,
              tagName, // Added tagName
              method: 'xpath',
              value: xpath,
              codeSnippet: formatCode('xpath', xpath, tool, progLang),
              priority: PriorityLevel.XPATH_COMPLEX,
              description: t.xpath_contains,
              stability: 'Medium'
           });
       }

       // Variation C2: contains(., ...) - Target string value of element (handles nested spans)
       if (!isLeafNode && hasElementChildren) {
           const xpathDot = `//${tagName}[contains(., ${safePart})]`;
           results.push({
              id: `strat-xpath-contains-dot-${Math.random()}`,
              elementName,
              tagName, // Added tagName
              method: 'xpath',
              value: xpathDot,
              codeSnippet: formatCode('xpath', xpathDot, tool, progLang),
              priority: PriorityLevel.XPATH_COMPLEX,
              description: `${t.xpath_contains} (Nested)`,
              stability: 'Medium'
           });
       }
    }
  }

  // SORT based on tool context
  return sortLocators(results, tool);
};

/**
 * Helper to convert basic CSS selectors to XPath for robust indexing in Selenium/Appium.
 */
const cssToXPath = (cssSelector: string): string | null => {
  // ID: #myId -> //*[@id='myId']
  if (cssSelector.startsWith('#')) {
    const id = cssSelector.substring(1);
    if (/^[\w-]+$/.test(id)) {
      return `//*[@id='${id}']`;
    }
  }
  
  // Tag+ID: div#myId -> //div[@id='myId']
  const tagIdMatch = cssSelector.match(/^(\w+)#([\w-]+)$/);
  if (tagIdMatch) {
    return `//${tagIdMatch[1]}[@id='${tagIdMatch[2]}']`;
  }

  // Class: .myClass -> //*[contains(concat(' ', normalize-space(@class), ' '), ' myClass ')]
  // Robust check handles "btn btn-primary" correctly
  if (cssSelector.startsWith('.')) {
    const cls = cssSelector.substring(1);
    if (/^[\w-]+$/.test(cls)) {
      return `//*[contains(concat(' ', normalize-space(@class), ' '), ' ${cls} ')]`;
    }
  }

  // Tag+Class: div.myClass -> //div[contains(concat(' ', normalize-space(@class), ' '), ' myClass ')]
  const tagClassMatch = cssSelector.match(/^(\w+)\.([\w-]+)$/);
  if (tagClassMatch) {
    return `//${tagClassMatch[1]}[contains(concat(' ', normalize-space(@class), ' '), ' ${tagClassMatch[2]} ')]`;
  }

  // Attribute: [name='foo'] -> //*[@name='foo']
  const attrMatch = cssSelector.match(/^\[([\w-]+)='(.*)'\]$/);
  if (attrMatch) {
    return `//*[@${attrMatch[1]}='${attrMatch[2]}']`;
  }

  // Tag+Attribute: input[name='foo'] -> //input[@name='foo']
  const tagAttrMatch = cssSelector.match(/^(\w+)\[([\w-]+)='(.*)'\]$/);
  if (tagAttrMatch) {
    return `//${tagAttrMatch[1]}[@${tagAttrMatch[2]}='${tagAttrMatch[3]}']`;
  }

  return null;
};

/**
 * Post-processes the results to handle duplicates using indexing.
 */
const handleDuplicates = (results: GeneratedLocator[], tool: TestTool): GeneratedLocator[] => {
  const countMap = new Map<string, number>();
  
  // First pass: count occurrences of locator values
  results.forEach(res => {
    const key = res.value;
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  // If no duplicates, return as is
  let hasDuplicates = false;
  for (const count of countMap.values()) {
    if (count > 1) {
      hasDuplicates = true;
      break;
    }
  }
  if (!hasDuplicates) return results;

  // Second pass: assign indexes
  const currentCount = new Map<string, number>();
  
  return results.map(res => {
    const key = res.value;
    const total = countMap.get(key) || 0;
    
    if (total <= 1) return res;

    // Increment current count for this key
    const idx = (currentCount.get(key) || 0) + 1;
    currentCount.set(key, idx);

    // Apply indexing strategy
    let newValue = res.value;
    let newCode = res.codeSnippet;
    let newDescription = `${res.description} (Duplicate #${idx})`;
    let newMethod = res.method;
    let newStability = res.stability;

    if (tool === 'playwright') {
      // Playwright: .nth(i) - Index starts at 0
      if (res.codeSnippet.endsWith(')')) {
         newCode = `${res.codeSnippet}.nth(${idx - 1})`;
         newValue = `${res.value} >> nth=${idx - 1}`;
      }
    } else {
      // Selenium / Appium
      if (res.method === 'xpath') {
        // XPath Index: (//div)[1]
        newValue = `(${res.value})[${idx}]`;
        // Update code snippet roughly by replacing the raw value
        // Using regex replace to avoid replacing occurrences inside other strings if simple replace fails
        newCode = res.codeSnippet.replace(res.value, newValue); 
      } else if (res.method === 'css') {
        // CSS Index Strategy
        // Attempt to convert to XPath for robust indexing
        const xpathEquivalent = cssToXPath(res.value);
        
        if (xpathEquivalent) {
           newValue = `(${xpathEquivalent})[${idx}]`;
           newMethod = 'xpath'; // Switch method to XPath
           // Re-generate code snippet using the new XPath value
           
           // Heuristic patch: replace the CSS finding part with XPath finding part
           if (newCode.includes('By.cssSelector')) {
               newCode = newCode.replace('By.cssSelector', 'By.xpath').replace(res.value, newValue);
           } else if (newCode.includes('By.css')) {
               newCode = newCode.replace('By.css', 'By.xpath').replace(res.value, newValue);
           } else if (newCode.includes('by_css_selector')) { // python
               newCode = newCode.replace('CSS_SELECTOR', 'XPATH').replace(res.value, newValue);
           } else {
               // Fallback replacement
               newCode = newCode.replace(res.value, newValue);
           }
           newDescription += " [Converted to XPath for indexing]";
        } else {
           // Fallback to CSS :nth-of-type if we can't convert
           newValue = `${res.value}:nth-of-type(${idx})`; 
           newCode = res.codeSnippet.replace(res.value, newValue);
           newStability = 'Low';
           newDescription += " [Warning: :nth-of-type depends on tag structure]";
        }
      } else {
        // ID, Name, etc. duplicates -> Fallback to basic indexing display
        newValue = `${res.value} [Index: ${idx}]`; 
        newDescription += " [Manual indexing required]";
      }
    }

    return {
      ...res,
      method: newMethod,
      value: newValue,
      codeSnippet: newCode,
      description: newDescription,
      stability: newStability
    };
  });
};

/**
 * Main Generator Function.
 */
export const generateXPaths = (
  html: string, 
  lang: Language, 
  tool: TestTool, 
  progLang: ProgrammingLanguage,
  deepScan: boolean
): GeneratedLocator[] => {
  const { target, container } = parseHTML(html);
  if (!target) return [];

  let allResults: GeneratedLocator[] = [];

  // 1. Always process the Root Element
  const rootName = generateElementName(target);
  const rootLocators = generateLocatorsForNode(target, container, lang, tool, progLang, rootName);
  allResults = [...rootLocators];

  // 2. Deep Scan Logic (Advanced)
  if (deepScan) {
    const allNodes = container.querySelectorAll('*');
    
    allNodes.forEach(node => {
      if (node === target) return;
      
      const tagName = node.tagName.toLowerCase();
      const isLeaf = node.childElementCount === 0;
      const hasText = node.textContent && node.textContent.trim().length > 0;
      
      // Interactive Elements Detection (Advanced)
      const role = node.getAttribute('role');
      const isClickableRole = ['button', 'checkbox', 'link', 'menuitem', 'tab', 'switch', 'option'].includes(role || '');
      
      // Check for JS/Framework Event Handlers
      const attributes = Array.from(node.attributes).map(a => a.name);
      const hasEvent = attributes.some(attr => 
        attr.startsWith('on') || // onclick, onmousedown...
        attr === 'ng-click' ||
        attr === '@click' ||
        attr === 'v-on:click' ||
        attr.startsWith('hx-') // htmx
      );
      
      const isStandardInteractive = ['input', 'button', 'select', 'textarea', 'a'].includes(tagName);
      
      // SVG as Button (icon inside a button or link, or clickable itself)
      const isInteractiveSvg = tagName === 'svg' && (hasEvent || ['button', 'a'].includes(node.parentElement?.tagName.toLowerCase() || ''));
      
      const isLabel = tagName === 'label';

      // Content Elements (Text Leaves)
      const isContentLeaf = isLeaf && hasText && ['span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'strong', 'b', 'em', 'i', 'small'].includes(tagName);

      // Filter Logic
      if (isStandardInteractive || isClickableRole || hasEvent || isInteractiveSvg || isLabel || isContentLeaf) {
         const name = generateElementName(node);
         const nodeLocators = generateLocatorsForNode(node, container, lang, tool, progLang, name);
         if (nodeLocators.length > 0) {
            allResults = [...allResults, ...nodeLocators];
         }
      }
    });
  }

  // 3. Deduplication & Indexing
  return handleDuplicates(allResults, tool);
};
