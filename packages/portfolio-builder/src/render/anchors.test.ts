import { describe, it, expect } from 'vitest';
import { sectionAnchors } from './anchors';

describe('sectionAnchors', () => {
  it('derives a slugified anchor from each section name', () => {
    const map = sectionAnchors([
      { id: 'a', name: 'About Me' },
      { id: 'b', name: 'My Work' },
    ]);
    expect(map.get('a')).toBe('about-me');
    expect(map.get('b')).toBe('my-work');
  });

  it('dedupes colliding names deterministically', () => {
    const map = sectionAnchors([
      { id: 'a', name: 'Gallery' },
      { id: 'b', name: 'Gallery' },
      { id: 'c', name: 'Gallery' },
    ]);
    expect(map.get('a')).toBe('gallery');
    expect(map.get('b')).toBe('gallery-2');
    expect(map.get('c')).toBe('gallery-3');
  });

  // Review Focus 2: slugify('!!!') and slugify('   ') both return '', which would produce
  // href="#" and a failed document.getElementById('').
  it('falls back to a positional anchor when a name slugifies to empty', () => {
    const map = sectionAnchors([
      { id: 'a', name: '!!!' },
      { id: 'b', name: '   ' },
    ]);
    expect(map.get('a')).toBe('section-1');
    expect(map.get('b')).toBe('section-2');
  });

  it('never returns an empty anchor and covers every section exactly once', () => {
    const sections = [
      { id: 'a', name: 'Intro' },
      { id: 'b', name: '???' },
      { id: 'c', name: 'Intro' },
    ];
    const map = sectionAnchors(sections);
    expect(map.size).toBe(3);
    sections.forEach((section) => {
      const anchor = map.get(section.id);
      expect(anchor).toBeTruthy();
      expect(anchor).not.toBe('');
    });
    expect(new Set(map.values()).size).toBe(3);
  });

  it('returns an empty map for no sections', () => {
    expect(sectionAnchors([]).size).toBe(0);
  });
});
