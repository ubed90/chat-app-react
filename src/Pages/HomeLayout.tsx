// ! Main Page Responsible for Entire Application Flow
// ? Consists Important Context Providers Wrapped like Socket and Peer providers;

import { Outlet } from 'react-router-dom';
import { Header } from '../Components';
import SocketProvider from '../Context/SocketContext';
import Landing from './Landing';
import PeerProvider from '../Context/PeerContext';

const HomeLayout = () => {
  return (
    <SocketProvider>
      <PeerProvider>
        <Landing>
          {/* Header is Available all throughout the application */}
          <Header />
          <Outlet />
        </Landing>
      </PeerProvider>
    </SocketProvider>
  );
};

export default HomeLayout;
