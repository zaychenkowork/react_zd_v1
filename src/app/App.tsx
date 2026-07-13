import { QueryProvider } from '~/app/providers/QueryProvider';
import { ToastProvider } from '~/app/providers/ToastProvider';

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <div>react-zd-v1</div>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;
