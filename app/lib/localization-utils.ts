import { LocalizationDB } from './database';

/**
 * Extract text strings from React component code
 * Finds text between JSX tags and in string props
 */
export function extractTextFromComponent(code: string): string[] {
  const texts: Set<string> = new Set();

  // Pattern 1: Text between JSX tags: >Text<
  const jsxTextRegex = />([^<>{}]+)</g;
  let match;
  while ((match = jsxTextRegex.exec(code)) !== null) {
    const text = match[1].trim();
    if (text && !text.startsWith('{') && text.length > 1) {
      texts.add(text);
    }
  }

  // Pattern 2: User-facing string attributes only (placeholder, title, aria-label, alt)
  const userFacingAttrs = /(?:placeholder|title|aria-label|alt)=(['"])((?:(?!\1).)*)\1/g;
  while ((match = userFacingAttrs.exec(code)) !== null) {
    const text = match[2].trim();
    if (text && text.length > 1) {
      texts.add(text);
    }
  }

  return Array.from(texts);
}

/**
 * Generate localization key from text
 * e.g., "Welcome to our App" -> "welcome.to.our.app"
 */
export function generateLocalizationKey(text: string, prefix: string = ''): string {
  const key = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4) // Limit to 4 words
    .join('.');

  return prefix ? `${prefix}.${key}` : key;
}

/**
 * Transform component code to use localization
 * Replaces hardcoded text with {t('localization.key')}
 */
export function transformComponentWithLocalization(
  code: string,
  textToKeyMap: Record<string, string>
): string {
  let transformedCode = code;

  // Add inline translation function (works in preview without imports)
  if (!transformedCode.includes('const t =')) {
    // Create translation map for this component
    const translationMap = JSON.stringify(textToKeyMap);

    // Find the function body start
    const functionBodyMatch = transformedCode.match(/(?:function \w+\([^)]*\)|const \w+ = \([^)]*\) =>)\s*\{/);
    if (functionBodyMatch) {
      const insertPos = functionBodyMatch.index! + functionBodyMatch[0].length;
      const translationFunction = `\n  // Inline translation function for preview\n  const translations = ${translationMap};\n  const t = (key: string) => {\n    const originalText = Object.keys(translations).find(k => translations[k] === key);\n    return originalText || key;\n  };\n`;
      transformedCode =
        transformedCode.slice(0, insertPos) +
        translationFunction +
        transformedCode.slice(insertPos);
    }
  }

  // Replace each text with t('key') - only in user-facing locations
  for (const [text, key] of Object.entries(textToKeyMap)) {
    // Replace in JSX content: >Text< -> >{t('key')}<
    const jsxPattern = new RegExp(`>\\s*${escapeRegExp(text)}\\s*<`, 'g');
    transformedCode = transformedCode.replace(jsxPattern, `>{t('${key}')}<`);

    // Replace in JSX string attributes (but NOT className, style, or other non-user-facing attrs)
    // Match patterns like: placeholder="Text", title="Text", aria-label="Text"
    const jsxAttrPattern = new RegExp(
      `((?:placeholder|title|aria-label|alt|label)=)["']${escapeRegExp(text)}["']`,
      'gi'
    );
    transformedCode = transformedCode.replace(jsxAttrPattern, `$1{t('${key}')}`);
  }

  return transformedCode;
}

/**
 * Create localization entries for extracted text
 */
export async function createLocalizationEntries(
  texts: string[],
  prefix: string = 'component'
): Promise<Record<string, string>> {
  const localizationDB = LocalizationDB.getInstance();
  const textToKeyMap: Record<string, string> = {};

  for (const text of texts) {
    const key = generateLocalizationKey(text, prefix);
    textToKeyMap[text] = key;

    // Create entry in database (English only for now, others can be translated later)
    try {
      await localizationDB.create({
        id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        key,
        en: text,
        es: text, // Placeholder - user can translate
        fr: text,
        de: text,
        ja: text,
        zh: text
      });
    } catch (error) {
      // Entry might already exist, that's okay
      console.log(`Localization key ${key} already exists or error:`, error);
    }
  }

  return textToKeyMap;
}

/**
 * Utility to add useTranslation import
 */
export function addTranslationImport(code: string): string {
  if (code.includes('useTranslation')) {
    return code;
  }

  // Find React import
  const reactImportMatch = code.match(/import React.*from ['"]react['"]/);
  if (reactImportMatch) {
    const importLine = reactImportMatch[0];
    const newImport = importLine + '\nimport { useTranslation } from \'../lib/translations\';';
    return code.replace(importLine, newImport);
  }

  return code;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Complete localization workflow for a component
 */
export async function localizeComponent(
  componentCode: string,
  componentName: string
): Promise<{ code: string; extractedTexts: string[]; textToKeyMap: Record<string, string> }> {
  // 1. Extract text from component
  const extractedTexts = extractTextFromComponent(componentCode);

  if (extractedTexts.length === 0) {
    return {
      code: componentCode,
      extractedTexts: [],
      textToKeyMap: {}
    };
  }

  // 2. Create localization entries
  const prefix = componentName.toLowerCase().replace(/component$/, '');
  const textToKeyMap = await createLocalizationEntries(extractedTexts, prefix);

  // 3. Transform component code (no import needed - uses inline translation function)
  const localizedCode = transformComponentWithLocalization(componentCode, textToKeyMap);

  return {
    code: localizedCode,
    extractedTexts,
    textToKeyMap
  };
}
