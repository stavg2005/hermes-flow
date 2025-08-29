import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlowBoard from '../src/components/Flow/FlowBoard';
import Sidebar from './components/SideBar/NodeSideBar';
import TopBar from './components/TopBar/TopBar';
import { store } from './store/store';

const App: React.FC = () => {
  return (
    <Provider store={store}>
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
    </Provider>
  );
};

export default App;
