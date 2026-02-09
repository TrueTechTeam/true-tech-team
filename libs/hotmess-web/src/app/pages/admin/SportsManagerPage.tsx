import styles from './AdminPages.module.scss';

export function SportsManagerPage() {
  const sports = [
    { id: '1', name: 'Kickball', icon: '⚽', teamSize: 11, isActive: true },
    { id: '2', name: 'Volleyball', icon: '🏐', teamSize: 6, isActive: true },
    { id: '3', name: 'Pickleball', icon: '🏓', teamSize: 2, isActive: true },
    { id: '4', name: 'Basketball', icon: '🏀', teamSize: 5, isActive: true },
    { id: '5', name: 'Cornhole', icon: '🎯', teamSize: 2, isActive: true },
    { id: '6', name: 'Bowling', icon: '🎳', teamSize: 4, isActive: true },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Sports</h1>
        <button className={styles.primaryButton}>+ Add Sport</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sport</th>
              <th>Team Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sports.map((sport) => (
              <tr key={sport.id}>
                <td>
                  <span className={styles.sportCell}>
                    <span>{sport.icon}</span>
                    <span>{sport.name}</span>
                  </span>
                </td>
                <td>{sport.teamSize} players</td>
                <td>
                  <span className={sport.isActive ? styles.badgeActive : styles.badgeInactive}>
                    {sport.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className={styles.tableAction}>Edit</button>
                  <button className={styles.tableAction}>Rules</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
