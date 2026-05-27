import { describe, it, expect } from 'vitest';
import {
  extractVariables,
  validateTemplate,
  generateValue,
  generateAllValues,
  evaluateExpression,
  renderTemplate,
  generateQuestion,
  generateMultipleQuestions,
  shuffleOptions,
  type TemplateData,
} from './templateEngine';

describe('extractVariables', () => {
  it('extracts variable names from template', () => {
    expect(extractVariables('Hello {name}, you are {age} years old')).toEqual(['name', 'age']);
  });
  it('returns empty for no variables', () => {
    expect(extractVariables('No variables here')).toEqual([]);
  });
  it('deduplicates', () => {
    expect(extractVariables('{x} and {x}')).toEqual(['x']);
  });
});

describe('validateTemplate', () => {
  it('reports missing variable definitions', () => {
    const t: TemplateData = {
      templateText: 'What is {foo}?',
      variableDefinitions: {},
      correctAnswerTemplate: '{foo}',
      wrongOptionsTemplates: [],
      explanationTemplate: '',
    };
    const errors = validateTemplate(t);
    expect(errors.some(e => e.includes('foo'))).toBe(true);
  });
  it('reports min > max', () => {
    const t: TemplateData = {
      templateText: '{x}',
      variableDefinitions: { x: { type: 'integer', min: 10, max: 5 } },
      correctAnswerTemplate: '{x}',
      wrongOptionsTemplates: [],
      explanationTemplate: '',
    };
    expect(validateTemplate(t).length).toBeGreaterThan(0);
  });
});

describe('generateValue', () => {
  it('integer within range', () => {
    for (let i = 0; i < 50; i++) {
      const v = generateValue({ type: 'integer', min: 10, max: 14 });
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(14);
    }
  });
  it('string from options', () => {
    const opts = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(opts).toContain(generateValue({ type: 'string', options: opts }));
    }
  });
  it('boolean', () => {
    const vals = new Set<boolean>();
    for (let i = 0; i < 50; i++) vals.add(generateValue({ type: 'boolean' }) as boolean);
    expect(vals.size).toBe(2);
  });
  it('ip_address format', () => {
    const ip = generateValue({ type: 'ip_address' }) as string;
    expect(ip.split('.').length).toBe(4);
  });
  it('email format', () => {
    const email = generateValue({ type: 'email' }) as string;
    expect(email).toContain('@');
  });
});

describe('evaluateExpression', () => {
  it('arithmetic', () => {
    expect(evaluateExpression('10 - 2', {})).toBe(8);
  });
  it('variable substitution', () => {
    expect(evaluateExpression('{x} + 1', { x: 5 })).toBe(6);
  });
  it('comparison', () => {
    expect(evaluateExpression('{x} >= 12', { x: 14 })).toBe(true);
  });
  it('ternary', () => {
    expect(evaluateExpression('{strong} ? Yes : No', { strong: true })).toBe('Yes');
    expect(evaluateExpression('{strong} ? Yes : No', { strong: false })).toBe('No');
  });
});

describe('renderTemplate', () => {
  it('replaces variables', () => {
    expect(renderTemplate('Length: {len} chars', { len: 12 })).toBe('Length: 12 chars');
  });
  it('evaluates expressions', () => {
    expect(renderTemplate('{len-2}', { len: 12 })).toBe('10');
  });
});

describe('generateQuestion', () => {
  const template: TemplateData = {
    templateText: 'What is the minimum password length? ({min_length} characters)',
    variableDefinitions: { min_length: { type: 'integer', min: 10, max: 14 } },
    correctAnswerTemplate: '{min_length}',
    wrongOptionsTemplates: ['{min_length-2}', '{min_length-4}', '{min_length+4}'],
    explanationTemplate: 'Experts recommend at least {min_length} characters.',
  };

  it('generates valid question', () => {
    const q = generateQuestion(template);
    expect(q.text).toContain('characters');
    expect(Number(q.correctAnswer)).toBeGreaterThanOrEqual(10);
    expect(q.wrongOptions.length).toBe(3);
    expect(q.explanation).toContain('characters');
  });
});

describe('generateMultipleQuestions', () => {
  it('generates unique questions', () => {
    const template: TemplateData = {
      templateText: 'Port for {service}?',
      variableDefinitions: { service: { type: 'string', options: ['HTTP', 'HTTPS', 'SSH', 'FTP', 'DNS'] } },
      correctAnswerTemplate: '{service}',
      wrongOptionsTemplates: ['Wrong1', 'Wrong2'],
      explanationTemplate: '{service} uses a specific port.',
    };
    const qs = generateMultipleQuestions(template, 3);
    const texts = qs.map(q => q.text);
    expect(new Set(texts).size).toBe(3);
  });
});

describe('shuffleOptions', () => {
  it('includes correct answer', () => {
    const { options, correctIndex } = shuffleOptions('A', ['B', 'C', 'D']);
    expect(options.length).toBe(4);
    expect(options[correctIndex]).toBe('A');
  });
});
