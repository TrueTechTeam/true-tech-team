import type { SectionRow } from '../schema/types';
import { ItemRenderer } from './ItemRenderer';
import styles from '../grid/Grid.module.scss';

export function RowRenderer({ row }: { row: SectionRow }) {
  return (
    <div className={styles.row} data-testid={row.id}>
      {row.items.map((item) => (
        <ItemRenderer key={item.id} item={item} />
      ))}
    </div>
  );
}
