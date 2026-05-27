import { describe, it, expect } from 'vitest';

// Test the gamification level calculation logic (mirrors the DB function)
function calculateUserLevel(points: number): string {
  if (points >= 5500) return 'Digital Sentinel';
  if (points >= 3500) return 'Cyber Defender';
  if (points >= 2000) return 'Security Specialist';
  if (points >= 1000) return 'Privacy Guardian';
  if (points >= 500) return 'Threat Detector';
  if (points >= 200) return 'Security Apprentice';
  return 'Cyber Novice';
}

describe('calculateUserLevel', () => {
  it('returns Cyber Novice for 0 points', () => {
    expect(calculateUserLevel(0)).toBe('Cyber Novice');
  });

  it('returns Security Apprentice at 200 points', () => {
    expect(calculateUserLevel(200)).toBe('Security Apprentice');
  });

  it('returns Threat Detector at 500 points', () => {
    expect(calculateUserLevel(500)).toBe('Threat Detector');
  });

  it('returns Privacy Guardian at 1000 points', () => {
    expect(calculateUserLevel(1000)).toBe('Privacy Guardian');
  });

  it('returns Digital Sentinel at max', () => {
    expect(calculateUserLevel(10000)).toBe('Digital Sentinel');
  });

  it('handles boundary values correctly', () => {
    expect(calculateUserLevel(199)).toBe('Cyber Novice');
    expect(calculateUserLevel(200)).toBe('Security Apprentice');
    expect(calculateUserLevel(499)).toBe('Security Apprentice');
    expect(calculateUserLevel(3499)).toBe('Security Specialist');
    expect(calculateUserLevel(3500)).toBe('Cyber Defender');
    expect(calculateUserLevel(5499)).toBe('Cyber Defender');
    expect(calculateUserLevel(5500)).toBe('Digital Sentinel');
  });
});
