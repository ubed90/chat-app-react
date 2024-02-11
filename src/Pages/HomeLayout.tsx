import { Outlet } from "react-router-dom"
import { Header } from "../Components"
import SocketProvider from "../Context/SocketContext"
import Landing from "./Landing";

const HomeLayout = () => {
  return (
    <SocketProvider>
      <Landing>
        <Header />
        <Outlet />
        {/* <Footer /> */}
      </Landing>
    </SocketProvider>
  );
}

export default HomeLayout