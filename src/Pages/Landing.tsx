import { PropsWithChildren, useEffect } from "react"
import { useSocket } from "../Context/SocketContext"
import { useSelector } from "react-redux";
import { RootState, store } from "../Store";
import { CONNECTED_EVENT, DISCONNECT_EVENT, MESSAGE_RECEIVED_EVENT, NEW_CHAT_EVENT } from "../utils/EventsMap";
import { useQueryClient } from "@tanstack/react-query";
import { onNewChat, onNewMessage } from "../utils/socketCallbacks";

const Landing: React.FC<PropsWithChildren> = ({ children }) => {
  const { socket, disconnect } = useSocket();
  const { user } = useSelector((state: RootState) => state.user)
  // const { selectedChat } = useSelector((state: RootState) => state.chat)

  const queryClient = useQueryClient();
  
  useEffect(() => {
    if(!socket) return;

    // * Setup Listeners

    // ? CONNECTION ESTABLISHED LISTENER
    socket.on(CONNECTED_EVENT, () => console.log("USER CONNECTED 🚀", user?._id))

    // ? DISCONNECT EVENT LISTENER
    socket.on(DISCONNECT_EVENT, disconnect);

    // ? Listener for New Messages
    socket.on(MESSAGE_RECEIVED_EVENT, onNewMessage(queryClient, store))

    // ? Listener for New Chat Event
    socket.on(NEW_CHAT_EVENT, onNewChat(queryClient, store))
    

    return () => {
      socket.emit(DISCONNECT_EVENT)

      socket.off(MESSAGE_RECEIVED_EVENT, onNewMessage(queryClient, store))

      socket.off(NEW_CHAT_EVENT, onNewChat(queryClient, store));

      socket.off(CONNECTED_EVENT, () =>
        console.log('USER DISCONNECTED ⚠️', user?._id)
      );

      socket.off(DISCONNECT_EVENT, disconnect);
    }

  }, [socket, user])

  return (
    <main className="app-grid with-header">
        {children}
    </main>
  )
}

// TODO: GROUP ADD / REMOVE Event messages;
// TODO: Disable / Remove Chat from other user List when its deleted from one end;
// TODO: Disable / Remove Group from other user List when removed;
// TODO: Notify all users when Group Name is Changed.

export default Landing