/**
 * Template Engine for Parameterized Questions
 * Generates unlimited question variations from templates with {variable} placeholders.
 * Zero ongoing costs — all generation is deterministic and client-side.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type VariableType =
  | 'number' | 'integer' | 'string' | 'boolean'
  | 'date' | 'ip_address' | 'password' | 'email' | 'url' | 'custom';

export interface VariableDefinition {
  type: VariableType;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  options?: string[];
  format?: string;
  /** For password type: criteria like length, uppercase, etc. */
  criteria?: Record<string, unknown>;
  /** Expression referencing other variables, e.g. "{min_length} - 2" */
  expression?: string;
}

export interface TemplateData {
  templateText: string;
  variableDefinitions: Record<string, VariableDefinition>;
  correctAnswerTemplate: string;
  wrongOptionsTemplates: string[];
  explanationTemplate: string;
}

export interface GeneratedQuestion {
  text: string;
  correctAnswer: string;
  wrongOptions: string[];
  explanation: string;
  variablesUsed: Record<string, string | number | boolean>;
}

// ─── Variable Parser ─────────────────────────────────────────────────────────

/** Extract all {variable_name} placeholders from a template string */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(1, -1)))];
}

/** Validate that all variables in templates have definitions */
export function validateTemplate(data: TemplateData): string[] {
  const errors: string[] = [];
  const allTemplates = [
    data.templateText,
    data.correctAnswerTemplate,
    data.explanationTemplate,
    ...data.wrongOptionsTemplates,
  ].join(' ');

  const vars = extractVariables(allTemplates);
  for (const v of vars) {
    // Allow expression variables like "min_length-2" — skip validation for those
    if (v.includes('-') || v.includes('+')) continue;
    if (!data.variableDefinitions[v]) {
      errors.push(`Variable "{${v}}" used in template but not defined`);
    }
  }

  for (const [name, def] of Object.entries(data.variableDefinitions)) {
    if (def.type === 'number' || def.type === 'integer') {
      if (def.min !== undefined && def.max !== undefined && def.min > def.max) {
        errors.push(`Variable "${name}": min (${def.min}) > max (${def.max})`);
      }
    }
    if (def.type === 'string' && (!def.options || def.options.length === 0)) {
      errors.push(`Variable "${name}": string type requires options list`);
    }
  }

  return errors;
}

// ─── Value Generator ─────────────────────────────────────────────────────────

const RANDOM_DOMAINS = ['example.com', 'mail.test', 'inbox.org', 'secure.net', 'webmail.co'];
const RANDOM_NAMES = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi'];
const RANDOM_TLDS = ['.com', '.org', '.net', '.io', '.co'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIpAddress(): string {
  return `${randomInt(1, 254)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function generatePassword(criteria?: Record<string, unknown>): string {
  const length = (criteria?.length as number) || randomInt(6, 16);
  const useUpper = criteria?.uppercase !== false;
  const useLower = criteria?.lowercase !== false;
  const useNumbers = criteria?.numbers !== false;
  const useSpecial = criteria?.special !== false;

  let chars = '';
  if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useNumbers) chars += '0123456789';
  if (useSpecial) chars += '!@#$%^&*';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateEmail(): string {
  return `${randomFrom(RANDOM_NAMES)}${randomInt(1, 99)}@${randomFrom(RANDOM_DOMAINS)}`;
}

function generateUrl(): string {
  const protocol = Math.random() > 0.3 ? 'https' : 'http';
  const domain = randomFrom(RANDOM_NAMES) + randomFrom(RANDOM_TLDS);
  return `${protocol}://${domain}`;
}

function generateDate(format?: string): string {
  const year = randomInt(2020, 2026);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  if (format === 'ISO') return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return `${month}/${day}/${year}`;
}

/** Generate a single variable value */
export function generateValue(def: VariableDefinition): string | number | boolean {
  switch (def.type) {
    case 'integer':
      return randomInt(def.min ?? 0, def.max ?? 100);
    case 'number':
      return randomFloat(def.min ?? 0, def.max ?? 100, def.decimals ?? 2);
    case 'string':
      return randomFrom(def.options ?? ['default']);
    case 'boolean':
      return Math.random() > 0.5;
    case 'date':
      return generateDate(def.format);
    case 'ip_address':
      return generateIpAddress();
    case 'password':
      return generatePassword(def.criteria);
    case 'email':
      return generateEmail();
    case 'url':
      return generateUrl();
    case 'custom':
      return randomFrom(def.options ?? ['custom_value']);
    default:
      return 'unknown';
  }
}

/** Generate all variable values for a template, respecting dependencies via expressions */
export function generateAllValues(
  definitions: Record<string, VariableDefinition>
): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {};

  // First pass: generate all non-expression values
  for (const [name, def] of Object.entries(definitions)) {
    if (!def.expression) {
      values[name] = generateValue(def);
    }
  }

  // Second pass: evaluate expressions
  for (const [name, def] of Object.entries(definitions)) {
    if (def.expression) {
      values[name] = evaluateExpression(def.expression, values);
    }
  }

  return values;
}

// ─── Expression Evaluator ────────────────────────────────────────────────────

/** Simple expression evaluator: supports {var}, arithmetic (+, -, *, /), comparisons */
export function evaluateExpression(
  expr: string,
  values: Record<string, string | number | boolean>
): string | number | boolean {
  // Replace {var} references with their values
  let resolved = expr.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_, name) => {
    const val = values[name];
    return val !== undefined ? String(val) : '0';
  });

  // Handle simple boolean expressions
  if (resolved === 'true') return true;
  if (resolved === 'false') return false;

  // Handle ternary: "condition ? trueVal : falseVal"
  const ternaryMatch = resolved.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
  if (ternaryMatch) {
    const condition = evaluateExpression(ternaryMatch[1], values);
    return condition ? String(ternaryMatch[2]).trim() : String(ternaryMatch[3]).trim();
  }

  // Handle comparison operators
  for (const op of ['>=', '<=', '>', '<', '==', '!=']) {
    if (resolved.includes(op)) {
      const [left, right] = resolved.split(op).map(s => s.trim());
      const l = Number(left), r = Number(right);
      if (!isNaN(l) && !isNaN(r)) {
        switch (op) {
          case '>=': return l >= r;
          case '<=': return l <= r;
          case '>': return l > r;
          case '<': return l < r;
          case '==': return l === r;
          case '!=': return l !== r;
        }
      }
    }
  }

  // Try arithmetic evaluation (safe: only numbers and operators)
  if (/^[\d\s+\-*/().]+$/.test(resolved)) {
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return (${resolved})`)();
      if (typeof result === 'number' && isFinite(result)) {
        return Math.round(result * 100) / 100;
      }
    } catch {
      // fall through
    }
  }

  return resolved;
}

// ─── Question Renderer ───────────────────────────────────────────────────────

/** Replace all {variable} placeholders in text with actual values */
export function renderTemplate(
  template: string,
  values: Record<string, string | number | boolean>
): string {
  return template.replace(/\{([^}]+)\}/g, (match, expr) => {
    // Direct variable reference
    if (values[expr] !== undefined) {
      return String(values[expr]);
    }

    // Expression (e.g., "min_length-2")
    const evaluated = evaluateExpression(`{${expr}}`, values);
    if (evaluated !== match) return String(evaluated);

    // Try as arithmetic with variable substitution
    const resolved = expr.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, (varName: string) => {
      return values[varName] !== undefined ? String(values[varName]) : varName;
    });

    if (/^[\d\s+\-*/().]+$/.test(resolved)) {
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function(`return (${resolved})`)();
        if (typeof result === 'number' && isFinite(result)) {
          return String(Math.round(result * 100) / 100);
        }
      } catch {
        // fall through
      }
    }

    return match;
  });
}

/** Generate a complete question from a template */
export function generateQuestion(template: TemplateData): GeneratedQuestion {
  const values = generateAllValues(template.variableDefinitions);

  const text = renderTemplate(template.templateText, values);
  const correctAnswer = renderTemplate(template.correctAnswerTemplate, values);
  const wrongOptions = template.wrongOptionsTemplates.map(t => renderTemplate(t, values));
  const explanation = renderTemplate(template.explanationTemplate, values);

  return { text, correctAnswer, wrongOptions, explanation, variablesUsed: values };
}

/** Generate N unique questions from a template (different variable values) */
export function generateMultipleQuestions(
  template: TemplateData,
  count: number
): GeneratedQuestion[] {
  const results: GeneratedQuestion[] = [];
  const seenTexts = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const q = generateQuestion(template);
    if (!seenTexts.has(q.text)) {
      seenTexts.add(q.text);
      results.push(q);
    }
  }

  return results;
}

// ─── Shuffle utility ─────────────────────────────────────────────────────────

/** Shuffle an array of options, returning the array and index of the correct answer */
export function shuffleOptions(
  correctAnswer: string,
  wrongOptions: string[]
): { options: string[]; correctIndex: number } {
  const all = [correctAnswer, ...wrongOptions];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return { options: all, correctIndex: all.indexOf(correctAnswer) };
}
