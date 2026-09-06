import type { CSSProperties } from 'react';
import type { GridItem } from '../schema/types';
import { getRegistryEntry } from '../components/registry';
import { collapsedSpans } from '../grid/responsive';
import styles from '../grid/Grid.module.scss';

export function ItemRenderer({ item }: { item: GridItem }) {
  const spans = collapsedSpans(item.span);
  const style = {
    '--span-desktop': String(spans.desktop),
    '--span-tablet': String(spans.tablet),
    '--span-mobile': String(spans.mobile),
  } as CSSProperties;

  const entry = getRegistryEntry(item.component);
  if (!entry || entry.validate(item.props).length > 0) {
    return (
      <div
        className={styles.itemPlaceholder}
        style={style}
        data-testid={item.id}
        data-placeholder="true"
      />
    );
  }

  const Component = entry.component;
  return (
    <div className={styles.item} style={style} data-testid={item.id}>
      <Component {...item.props} />
    </div>
  );
}
