import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions } from '../../../lib/auth/permissions';
import AdminPanel from './AdminPanel';
import styles from './admin.module.scss';
import Footer from '../../../components/layout/Footer';
import Header from '../../../components/layout/Header';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const permissions = await getUserPermissions(user.id);

  if (!permissions.isAdmin) {
    redirect('/dashboard');
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Admin Panel</h1>
            <p>Manage user roles and app access grants.</p>
          </div>
          <AdminPanel currentUserId={user.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
