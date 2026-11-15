import { describe, it, expect, vi, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as crud from './crud';
import { slugify, generateUniqueSlug } from './slug';

const fakeSupabase = {} as SupabaseClient;

describe('slugify', () => {
  it('lowercases and hyphenates the title', () => {
    expect(slugify('Justin True')).toBe('justin-true');
  });

  it('collapses runs of non-alphanumeric characters into a single hyphen', () => {
    expect(slugify('Hello, World!! -- Foo')).toBe('hello-world-foo');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Weird Title--  ')).toBe('weird-title');
  });

  it('returns an empty string for a title with no alphanumeric characters', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('generateUniqueSlug', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the base slug when it is available', async () => {
    vi.spyOn(crud, 'checkSlugAvailable').mockResolvedValue(true);
    const slug = await generateUniqueSlug(fakeSupabase, 'Justin True');
    expect(slug).toBe('justin-true');
    expect(crud.checkSlugAvailable).toHaveBeenCalledTimes(1);
    expect(crud.checkSlugAvailable).toHaveBeenCalledWith(fakeSupabase, 'justin-true');
  });

  it('falls back to "page" as the base when the title has no usable characters', async () => {
    vi.spyOn(crud, 'checkSlugAvailable').mockResolvedValue(true);
    const slug = await generateUniqueSlug(fakeSupabase, '!!!');
    expect(slug).toBe('page');
  });

  it('appends a random suffix and retries when the base slug is taken', async () => {
    vi.spyOn(crud, 'checkSlugAvailable')
      .mockResolvedValueOnce(false) // base taken
      .mockResolvedValueOnce(true); // suffixed candidate available

    const slug = await generateUniqueSlug(fakeSupabase, 'Justin True');

    expect(slug).toMatch(/^justin-true-[a-f0-9]{6}$/);
    expect(crud.checkSlugAvailable).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting all attempts', async () => {
    vi.spyOn(crud, 'checkSlugAvailable').mockResolvedValue(false);

    await expect(generateUniqueSlug(fakeSupabase, 'Justin True')).rejects.toThrow(
      'Could not generate a unique page URL. Please try a different title.'
    );
    // 1 call for the base slug + 5 retry attempts = 6 total
    expect(crud.checkSlugAvailable).toHaveBeenCalledTimes(6);
  });
});
