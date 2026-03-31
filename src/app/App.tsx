// src/app/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { lazy, memo, Suspense } from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import { useEffect, useState } from 'react';

// Lazy load components
const FlowBoard = lazy(() => import('../features/flow/components/FlowBoard'));
const Sidebar = lazy(() => import('../features/flow/components/NodeSideBar'));
const TopBar = lazy(() => import('../features/flow/components/TopBar'));
// Loading component
const LoadingSpinner = memo(() => (
  <div className='flex items-center justify-center h-screen bg-slate-950'>
    <div className='text-center'>
      <div className='animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto' />
      <p className='mt-4 text-sm text-slate-400'>Loading editor...</p>
    </div>
  </div>
));

const DesktopOnlyWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isTouchDevice = navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;

      if (
        /android|iphone|ipad|ipod/i.test(userAgent) ||
        (isTouchDevice && isSmallScreen)
      ) {
        setIsMobile(true);
      }
    };

    checkDevice();
  }, []);

  if (isMobile) {
    return (
      <div
        style={{
          backgroundColor: '#121212',
          color: 'white',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <h1>💻 Desktop Required</h1>
        <p>
          Hermes-Flow requires a desktop browser for real-time audio processing
          and system architecture tools.
        </p>
        <p>Please switch to a computer to continue.</p>
      </div>
    );
  }

  return <>{children}</>;
};

LoadingSpinner.displayName = 'LoadingSpinner';

// QueryClient singleton
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Memoized toast config
const toastConfig = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: 'dark' as const,
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <DesktopOnlyWrapper>
              <div className='h-screen flex bg-slate-950'>
                <Sidebar />
                <TopBar />

                <div className='flex-1 relative'>
                  <FlowBoard />
                </div>
              </div>
            </DesktopOnlyWrapper>
          </Suspense>
        </ReactFlowProvider>

        <ToastContainer {...toastConfig} />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
