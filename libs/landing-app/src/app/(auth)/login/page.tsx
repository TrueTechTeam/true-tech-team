import LoginForm from '../components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';
import styles from './login.module.scss';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="True Tech Team" width={48} height={48} />
          <span>True Tech Team</span>
        </Link>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your account to continue</p>
        <LoginForm />
      </div>
    </div>
  );
}

