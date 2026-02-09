import styles from './AdminPages.module.scss';

export function LeaguesManagerPage() {
  const leagues = [
    { id: '1', name: 'Miami Kickball', city: 'Miami', sport: 'Kickball', seasons: 8 },
    { id: '2', name: 'Miami Volleyball', city: 'Miami', sport: 'Volleyball', seasons: 6 },
    {
      id: '3',
      name: 'Fort Lauderdale Kickball',
      city: 'Fort Lauderdale',
      sport: 'Kickball',
      seasons: 4,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Leagues</h1>
        <button className={styles.primaryButton}>+ Add League</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>League</th>
              <th>City</th>
              <th>Sport</th>
              <th>Seasons</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leagues.map((league) => (
              <tr key={league.id}>
                <td>{league.name}</td>
                <td>{league.city}</td>
                <td>{league.sport}</td>
                <td>{league.seasons}</td>
                <td>
                  <button className={styles.tableAction}>Edit</button>
                  <button className={styles.tableAction}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
