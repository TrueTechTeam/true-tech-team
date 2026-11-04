import { describe, it, expect } from 'vitest';
import { isRecord, readHeading, readRecordList, readText } from './readProps';

describe('isRecord', () => {
  it('accepts plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it.each([null, undefined, [], [1], 'x', 7, true])('rejects %j', (value) => {
    expect(isRecord(value)).toBe(false);
  });
});

describe('readRecordList', () => {
  it.each([null, undefined, 'x', 7, {}, { 0: { a: 1 }, length: 1 }])(
    'reads %j as an empty list',
    (value) => {
      expect(readRecordList(value)).toEqual([]);
    }
  );

  it('drops non-object entries and keeps the rest in order', () => {
    const a = { n: 1 };
    const b = { n: 2 };
    expect(readRecordList([a, null, 'x', 7, [a], undefined, b])).toEqual([a, b]);
  });

  it('returns an empty array for an empty array', () => {
    expect(readRecordList([])).toEqual([]);
  });
});

describe('readText', () => {
  it('returns a string unchanged, including the empty string', () => {
    expect(readText('hello')).toBe('hello');
    expect(readText('')).toBe('');
  });

  it.each([null, undefined, 7, true, {}, [], ['x']])('reads %j as an empty string', (value) => {
    expect(readText(value)).toBe('');
  });
});

describe('readHeading', () => {
  it('reads the heading prop', () => {
    expect(readHeading({ heading: 'Hello' })).toBe('Hello');
  });

  it.each([{}, { heading: 3 }, { heading: null }])('reads %j as empty', (props) => {
    expect(readHeading(props)).toBe('');
  });
});
