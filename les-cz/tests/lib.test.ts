import { describe, expect, it } from 'vitest';
import { formatMonths, seasonOfMonth } from '@/lib/seasons';
import { normalize, searchEntries } from '@/lib/search';
import { searchIndex } from '@/data/index';

describe('roční období', () => {
  it('mapuje měsíce na období', () => {
    expect(seasonOfMonth(1)).toBe('zima');
    expect(seasonOfMonth(4)).toBe('jaro');
    expect(seasonOfMonth(7)).toBe('leto');
    expect(seasonOfMonth(10)).toBe('podzim');
    expect(seasonOfMonth(12)).toBe('zima');
  });
  it('formátuje rozsahy měsíců včetně přechodu přes nový rok', () => {
    expect(formatMonths([6, 7, 8])).toBe('červen–srpen');
    expect(formatMonths([11, 12, 1, 2])).toBe('listopad–únor');
    expect(formatMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('celoročně');
    expect(formatMonths([3, 9])).toBe('březen, září');
  });
});

describe('vyhledávání', () => {
  const index = searchIndex();
  it('ignoruje diakritiku a velikost písmen', () => {
    expect(normalize('Šípky')).toBe('sipky');
    expect(searchEntries(index, 'sipky')[0]?.slug).toBe('sipky');
    expect(searchEntries(index, 'BŘÍZA')[0]?.slug).toBe('briza');
  });
  it('najde rostlinu podle latinského názvu', () => {
    expect(searchEntries(index, 'Taxus')[0]?.slug).toBe('tis-cerveny');
  });
  it('vrací prázdný výsledek pro neznámý dotaz', () => {
    expect(searchEntries(index, 'xyzzy')).toHaveLength(0);
  });
});
