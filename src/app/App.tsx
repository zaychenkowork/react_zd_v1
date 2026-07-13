import { QueryProvider } from '~/app/providers/QueryProvider';
import { ToastProvider } from '~/app/providers/ToastProvider';
import { AppRouter } from '~/app/router';

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;
