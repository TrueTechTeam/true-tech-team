import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { router } from './app/routes';

import './styles.scss';
import { GlobalProvider } from '@true-tech-team/ui-components';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <GlobalProvider
      themeConfig={{
        mode: 'dark',
        theme: {
          colors: {
            primary: '#0284c7',
            primaryHover: '#0ea5e9',
            primaryActive: '#0369a1',
            primaryDisabled: '#075985',
            secondary: '#ea580c',
            secondaryHover: '#f97316',
            secondaryActive: '#c2410c',
            secondaryDisabled: '#9a3412',
            success: '#15803d',
            warning: '#ca8a04',
            error: '#dc2626',
            info: '#0e7490',
            backgroundPrimary: '#0d0a14',
            backgroundSecondary: '#16121f',
            backgroundTertiary: '#221d2d',
            surfacePrimary: '#16121f',
            surfaceSecondary: '#0d0a14',
            surfaceElevated: '#221d2d',
            textPrimary: '#fafafa',
            textSecondary: '#d4d4d4',
            textTertiary: '#737373',
            textDisabled: '#525252',
            textOnPrimary: '#ffffff',
            borderPrimary: '#362f46',
            borderSecondary: '#221d2d',
            borderFocus: '#0284c7',
            interactiveHover: '#221d2d',
            interactiveFocus: 'rgba(2, 132, 199, 0.25)',
            interactiveActive: '#16121f',
            interactiveDisabled: '#0d0a14',
            inputBg: '#221d2d',
            inputBgDisabled: '#16121f',
            inputBorder: '#362f46',
            inputBorderHover: '#463e58',
            inputBorderFocus: '#0284c7',
            inputText: '#fafafa',
            inputPlaceholder: '#655c78',
            controlBg: '#221d2d',
            controlBgChecked: '#0284c7',
            controlBorder: '#362f46',
            controlBorderHover: '#463e58',
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </GlobalProvider>
  </StrictMode>
);
