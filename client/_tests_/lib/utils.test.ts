import { cn } from '@/lib/utils';

describe('cn', () => {
  test('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  test('handles falsy values', () => {
    expect(cn('a', null as any, undefined as any, false as any, 0 as any, 'b')).toBe('a b');
  });

  test('deduplicates conflicting Tailwind classes', () => {
    const res = cn('p-2', 'p-4');
    expect(res.includes('p-4')).toBe(true);
    expect(res.includes('p-2')).toBe(false);
  });

  test('merges conditional objects', () => {
    const res = cn('btn', { active: true, disabled: false });
    expect(res).toBe('btn active');
  });
});
