import { PriorityLevel, XPathResult } from '../types';

/**
 * Parses raw HTML string into a DOM element.
 */
const parseHTML = (html: string): HTMLElement | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.firstElementChild as HTMLElement;
};

/**
 * Escapes text for XPath 1.0 (handling single quotes).
 * If text contains single quote, we use concat(). 
 * For simplicity in this v1, we will mostly handle standard cases or double quotes.
 */
const escapeXPathText = (text: string): string => {
  if (text.includes("'")) {
    // Basic handling: if it has a single quote, try to use double quotes
    return `"${text}"`;
  }
  return `'${text}'`;
};

export const generateXPaths = (rawHtml: string): XPathResult[] => {
  const results: XPathResult[] = [];
  const element = parseHTML(rawHtml);

  if (!element) return [];

  const tagName = element.tagName.toLowerCase();

  // 1. Priority: ID (The Gold Standard)
  if (element.id) {
    results.push({
      id: 'strategy-id',
      xpath: `//${tagName}[@id='${element.id}']`,
      priority: PriorityLevel.ID,
      description: 'Highest stability. IDs are unique identifiers.',
      category: 'ID'
    });
  }

  // 2. Priority: Text Content
  // We prefer direct text if it exists and isn't too long.
  const rawText = element.textContent?.trim() || '';
  if (rawText.length > 0) {
    const escapedText = escapeXPathText(rawText);
    
    // Exact match (Short text)
    if (rawText.length < 50) {
      results.push({
        id: 'strategy-text-exact',
        xpath: `//${tagName}[normalize-space()=${escapedText}]`,
        priority: PriorityLevel.TEXT,
        description: 'Excellent for buttons and labels. Uses exact text match.',
        category: 'Text'
      });
    }

    // Contains match (Longer text or generally safer)
    // Taking first 20 chars for robustness
    const subText = rawText.substring(0, 20);
    const escapedSubText = escapeXPathText(subText);
    results.push({
      id: 'strategy-text-contains',
      xpath: `//${tagName}[contains(text(), ${escapedSubText})]`,
      priority: PriorityLevel.TEXT,
      description: 'Robust against whitespace changes. Checks if text contains value.',
      category: 'Text'
    });
  }

  // 3. Priority: Unique Attributes
  const importantAttributes = ['name', 'placeholder', 'data-testid', 'data-cy', 'title', 'role', 'type', 'href', 'alt'];
  
  importantAttributes.forEach(attr => {
    const val = element.getAttribute(attr);
    if (val) {
      let priority = PriorityLevel.ATTRIBUTE;
      // Boost priority for test-specific IDs
      if (attr === 'data-testid' || attr === 'data-cy') {
        priority = PriorityLevel.ID; // Treat as ID equivalent
      }

      results.push({
        id: `strategy-attr-${attr}`,
        xpath: `//${tagName}[@${attr}='${val}']`,
        priority: priority,
        description: `Based on '${attr}' attribute. Usually stable.`,
        category: 'Attribute'
      });
    }
  });

  // 4. Priority: Class
  if (element.className) {
    // Filter out obviously dynamic classes (Tailwind, or framework hashes often look random)
    // For this tool, we just take the whole string or specific parts.
    // Handling multiple classes:
    const classes = element.className.trim().split(/\s+/);
    
    if (classes.length > 0) {
       // Single class exact match
       results.push({
        id: 'strategy-class-exact',
        xpath: `//${tagName}[@class='${element.className.trim()}']`,
        priority: PriorityLevel.CLASS,
        description: 'Matches exact class string. Fragile if classes change dynamically.',
        category: 'Class'
      });

      // Contains specific class (if multiple)
      if (classes.length > 1) {
        // Pick the longest class name as it might be the most specific BEM element
        const longestClass = classes.reduce((a, b) => a.length > b.length ? a : b);
        results.push({
            id: 'strategy-class-contains',
            xpath: `//${tagName}[contains(@class, '${longestClass}')]`,
            priority: PriorityLevel.CLASS,
            description: `Matches partial class '${longestClass}'.`,
            category: 'Class'
          });
      }
    }
  }

  // 5. Priority: Combination (Class + Text) or (Attr + Text)
  // Only useful if we have common classes but unique text
  if (element.className && rawText.length > 0 && rawText.length < 30) {
      const escapedText = escapeXPathText(rawText);
      results.push({
          id: 'strategy-combo',
          xpath: `//${tagName}[contains(@class, '${element.className.split(' ')[0]}') and text()=${escapedText}]`,
          priority: PriorityLevel.COMBINATION,
          description: 'High specificity. Requires both Class and Text match.',
          category: 'Combo'
      });
  }

  // Sort by priority (Ascending because 1 is top priority)
  return results.sort((a, b) => a.priority - b.priority);
};
