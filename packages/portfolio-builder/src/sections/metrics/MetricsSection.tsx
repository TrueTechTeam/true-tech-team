'use client';

import { CountUpItem, KpiItem } from '../../components/wrappers/metrics';
import type { SectionComponentProps } from '../types';
import { readHeading, readRecordList, readText } from '../readProps';
import styles from './MetricsSection.module.scss';

interface MetricEntry {
  value: number;
  label: string;
  suffix: string;
}

/**
 * A metric needs a finite numeric value; anything else (a string, NaN, Infinity) is skipped so a
 * published portfolio never shows `NaN`.
 */
function readMetrics(value: unknown): MetricEntry[] {
  return readRecordList(value).flatMap((entry): MetricEntry[] => {
    const metricValue = entry['value'];
    if (typeof metricValue !== 'number' || !Number.isFinite(metricValue)) {
      return [];
    }
    return [
      {
        value: metricValue,
        label: readText(entry['label']),
        suffix: readText(entry['suffix']),
      },
    ];
  });
}

export function MetricsSection({ section }: SectionComponentProps) {
  const heading = readHeading(section.props);
  const animate = section.props['animate'] === true;
  const metrics = readMetrics(section.props['items']);

  return (
    <div className={styles.metrics}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {metrics.length === 0 ? (
        <p className={styles.empty}>No metrics yet.</p>
      ) : (
        <ul className={styles.grid}>
          {metrics.map((metric, index) => (
            // eslint-disable-next-line react/no-array-index-key -- metrics have no stable id in stored data; position is their identity and a reorder replaces the whole array
            <li key={`${metric.label}-${index}`} className={styles.item}>
              {animate ? (
                <>
                  <CountUpItem value={metric.value} suffix={metric.suffix} />
                  {metric.label.length > 0 && <span className={styles.label}>{metric.label}</span>}
                </>
              ) : (
                <KpiItem title={metric.label} value={metric.value} subtitle={metric.suffix} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
