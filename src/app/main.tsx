import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '~/app/App';

import '~/ui/styles/tokens.css';
import '~/ui/styles/base.css';
import '~/ui/styles/typography.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
