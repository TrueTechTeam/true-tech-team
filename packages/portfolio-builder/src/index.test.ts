import { describe, it, expect } from 'vitest';
import * as PortfolioBuilder from '@true-tech-team/portfolio-builder';

describe('@true-tech-team/portfolio-builder package', () => {
  it('is importable by its workspace package name', () => {
    expect(PortfolioBuilder).toBeDefined();
  });
});
