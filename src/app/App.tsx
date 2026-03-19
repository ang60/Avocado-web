import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SidebarProvider } from './context/SidebarContext';

function App() {
  return (
    <SidebarProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <RouterProvider router={router} />
      </div>
    </SidebarProvider>
  );
}

export default App;