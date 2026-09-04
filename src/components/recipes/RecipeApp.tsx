'use client';

import { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationItem,
  useMediaQuery,
  Icon,
} from '@true-tech-team/ui-components';
import AgentSearchView from './agent/AgentSearchView';
import SavedRecipesView from './saved/SavedRecipesView';
import RecipeProfilePanel from './profile/RecipeProfilePanel';
import styles from './RecipeApp.module.scss';

type TabId = 'search' | 'saved' | 'profile';

interface RecipeAppProps {
  initialTab?: TabId;
}

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'search', label: 'Search', icon: 'Search' },
  { id: 'saved', label: 'Saved', icon: 'Bookmark' },
  { id: 'profile', label: 'My Profile', icon: 'User' },
];

export default function RecipeApp({ initialTab = 'search' }: RecipeAppProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <div className={styles.app}>
      {/* Desktop tab bar */}
      {!isMobile && (
        <div className={styles.tabBar}>
          <div className={styles.tabList}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={[styles.tab, activeTab === tab.id ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <Icon name={tab.icon as Parameters<typeof Icon>[0]['name']} size="sm" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className={styles.content}>
        {activeTab === 'search' && <AgentSearchView />}
        {activeTab === 'saved' && <SavedRecipesView />}
        {activeTab === 'profile' && <RecipeProfilePanel />}
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <BottomNavigation value={activeTab} onChange={(v) => setActiveTab(v as TabId)}>
          {TABS.map((tab) => (
            <BottomNavigationItem
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon as Parameters<typeof Icon>[0]['name']}
            />
          ))}
        </BottomNavigation>
      )}
    </div>
  );
}
