import { Outlet } from "react-router-dom"
import Chats from "../Chats/Chats"
import "./ChatsContainer.scss";
import { ChatsProvider } from "../../Context/ChatsContext"
import useWindowSize from "../../utils/hooks/useWindowSize"
import MobileLayout from "./MobileLayout"

const ChatsContainer = () => {

  const { width } = useWindowSize();

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