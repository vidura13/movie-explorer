import { describe, expect, it } from 'vitest';
import { validateCredentials, isCredentialsValid } from '../utils/validators';

describe('validateCredentials', () => {
  it('accepts the demo credentials', () => {
    expect(validateCredentials({ username: 'demo', password: 'demo1234' })).toEqual({});
    expect(isCredentialsValid({ username: 'demo', password: 'demo1234' })).toBe(true);
  });

  it('requires a username', () => {
    expect(validateCredentials({ username: '', password: 'demo1234' }).username).toBeDefined();
    expect(validateCredentials({ username: '   ', password: 'demo1234' }).username).toBeDefined();
  });

  it('rejects a username shorter than three characters', () => {
    expect(validateCredentials({ username: 'ab', password: 'demo1234' }).username).toMatch(/at least 3/);
  });

  it('requires a password of at least six characters', () => {
    expect(validateCredentials({ username: 'demo', password: '' }).password).toBeDefined();
    expect(validateCredentials({ username: 'demo', password: '12345' }).password).toMatch(/at least 6/);
  });

  it('reports both fields at once when both are wrong', () => {
    const errors = validateCredentials({ username: '', password: '' });
    expect(Object.keys(errors).sort()).toEqual(['password', 'username']);
  });

  it('treats a whitespace-padded username as valid input', () => {
    expect(validateCredentials({ username: '  demo  ', password: 'demo1234' })).toEqual({});
  });
});
