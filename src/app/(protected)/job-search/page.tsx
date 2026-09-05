import { JobSearchOverview } from '@true-tech-team/job-search';
import styles from './job-search.module.scss';

export default function JobSearchPage() {
  return (
    <div className={styles.content}>
      <JobSearchOverview />
    </div>
  );
}
