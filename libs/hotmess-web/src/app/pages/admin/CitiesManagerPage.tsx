import styles from './AdminPages.module.scss';

export function CitiesManagerPage() {
  const cities = [
    { id: '1', name: 'Miami', state: 'FL', leagues: 4, isActive: true },
    { id: '2', name: 'Fort Lauderdale', state: 'FL', leagues: 2, isActive: true },
    { id: '3', name: 'West Palm Beach', state: 'FL', leagues: 3, isActive: true },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Cities</h1>
        <button className={styles.primaryButton}>+ Add City</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>City</th>
              <th>State</th>
              <th>Leagues</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id}>
                <td>{city.name}</td>
                <td>{city.state}</td>
                <td>{city.leagues}</td>
                <td>
                  <span className={city.isActive ? styles.badgeActive : styles.badgeInactive}>
                    {city.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className={styles.tableAction}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
