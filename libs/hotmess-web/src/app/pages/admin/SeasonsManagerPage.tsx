import styles from './AdminPages.module.scss';

export function SeasonsManagerPage() {
  const seasons = [
    {
      id: '1',
      name: 'Fall 2024',
      league: 'Miami Kickball',
      status: 'Active',
      teams: 12,
      startDate: '2024-09-01',
    },
    {
      id: '2',
      name: 'Fall 2024',
      league: 'Miami Volleyball',
      status: 'Registration',
      teams: 8,
      startDate: '2024-09-15',
    },
    {
      id: '3',
      name: 'Summer 2024',
      league: 'Fort Lauderdale Kickball',
      status: 'Completed',
      teams: 10,
      startDate: '2024-06-01',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Seasons</h1>
        <button className={styles.primaryButton}>+ Create Season</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Season</th>
              <th>League</th>
              <th>Start Date</th>
              <th>Teams</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((season) => (
              <tr key={season.id}>
                <td>{season.name}</td>
                <td>{season.league}</td>
                <td>{season.startDate}</td>
                <td>{season.teams}</td>
                <td>
                  <span className={getStatusClass(season.status)}>{season.status}</span>
                </td>
                <td>
                  <button className={styles.tableAction}>Manage</button>
                  <button className={styles.tableAction}>Schedule</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Active':
      return styles.badgeActive;
    case 'Registration':
      return styles.badgeWarning;
    case 'Completed':
      return styles.badgeMuted;
    default:
      return '';
  }
}
