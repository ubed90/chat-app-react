import { Outlet } from "react-router-dom"
import Chats from "../Chats/Chats"
import "./ChatsContainer.scss";
import { ChatsProvider } from "../../Context/ChatsContext"
import useWindowSize from "../../utils/hooks/useWindowSize"
import MobileLayout from "./MobileLayout"

const ChatsContainer = () => {

  // ! Custom Hook for Detecting Window Size on the Go.
  const { width } = useWindowSize();

  // ! There's Two Layouts Specifically for Mobile and then Tabs + Desktops
  // ? Desktop One pretty straightforward.
  return (
    <ChatsProvider>
      {width <= 768 && <MobileLayout />}
      {width > 768 && (
        <section className="chats-container">
          <div className="chats-container-left relative">
            <Chats />
          </div>
          <div className="chats-container-right">
            <Outlet />
          </div>
        </section>
      )}
    </ChatsProvider>
  );
}

export default ChatsContainer