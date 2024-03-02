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
          <Header />
          <Outlet />
          {/* <Footer /> */}
        </Landing>
      </PeerProvider>
    </SocketProvider>
  );
};

export default HomeLayout;
