import SignupForm from '../components/auth/SignupForm';
import Link from 'next/link';
import Image from 'next/image';
import styles from './signup.module.scss';

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="True Tech Team" width={48} height={48} />
          <span>True Tech Team</span>
        </Link>
        <h1 className={styles.title}>Join True Tech Team</h1>
        <p className={styles.subtitle}>Create your account to get started</p>
        <SignupForm />
      </div>
    </div>
  );
}

