import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlowBoard from '../features/flow/components/FlowBoard';
import Sidebar from '../features/flow/components/NodeSideBar.tsx';
import TopBar from '../features/flow/components/TopBar.tsx';
import { store } from './store.ts';
const App: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: 3, // Retry failed requests 3 times
      },
      mutations: {
        retry: 1, // Retry failed mutations 1 time
      },
    },
  });
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>
          <div className='h-screen flex bg-slate-950'>
            <Sidebar />
            <TopBar />
            <div className='flex-1 relative'>
              <FlowBoard />

              <div className='absolute top-15 right-4 z-[1000]'></div>
            </div>
          </div>
        </ReactFlowProvider>
        <ToastContainer
          position='top-right'
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='dark'
        />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
