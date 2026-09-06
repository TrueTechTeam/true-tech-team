import type { PageSection, SectionBackground } from '../schema/types';
import { RowRenderer } from './RowRenderer';
import styles from './Section.module.scss';

const BACKGROUND_CLASS: Record<SectionBackground, string> = {
  primary: styles.backgroundPrimary,
  secondary: styles.backgroundSecondary,
  tertiary: styles.backgroundTertiary,
  transparent: styles.backgroundTransparent,
};

export function SectionRenderer({ section }: { section: PageSection }) {
  const backgroundClass = BACKGROUND_CLASS[section.background ?? 'transparent'];
  return (
    <section
      id={section.id}
      aria-label={section.name}
      className={`${styles.section} ${backgroundClass}`}
    >
      {section.rows.map((row) => (
        <RowRenderer key={row.id} row={row} />
      ))}
    </section>
  );
}
