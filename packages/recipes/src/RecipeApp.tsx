'use client';

import { useState } from 'react';
import { Button } from '@true-tech-team/react-components';
import { MiniAppHeader } from '@true-tech-team/dashboard-kit';
import AgentSearchView from './agent/AgentSearchView';
import RecipeProfileDialog from './profile/RecipeProfileDialog';
import styles from './RecipeApp.module.scss';

export default function RecipeApp() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className={styles.app}>
      <MiniAppHeader
        title="Recipe AI Agent"
        actions={
          <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
            My Profile
          </Button>
        }
      />

      <div className={styles.content}>
        <AgentSearchView />
      </div>

      {profileOpen && <RecipeProfileDialog onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
