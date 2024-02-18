import { PropsWithChildren, useEffect } from "react"
import { useSocket } from "../Context/SocketContext"
import { useSelector } from "react-redux";
import { RootState, store } from "../Store";
import { CONNECTED_EVENT, DELETE_CHAT_EVENT, DISCONNECT_EVENT, MESSAGE_RECEIVED_EVENT, NEW_CHAT_EVENT, REMOVE_FROM_GROUP_EVENT, UPDATE_GROUP_NAME_EVENT } from "../utils/EventsMap";
import { useQueryClient } from "@tanstack/react-query";
import { onDeleteChat, onGroupRename, onNewChat, onNewMessage, onRemove } from "../utils/socketCallbacks";
import { useNavigate } from "react-router-dom";

const Landing: React.FC<PropsWithChildren> = ({ children }) => {
  const { socket, disconnect } = useSocket();
  const { user } = useSelector((state: RootState) => state.user)
  // const { selectedChat } = useSelector((state: RootState) => state.chat)

  const queryClient = useQueryClient();

  const navigate = useNavigate();
  
  useEffect(() => {
    if (!socket) return;

    // * Setup Listeners
    // ? CONNECTION ESTABLISHED LISTENER
    socket.on(CONNECTED_EVENT, () =>
      console.log('USER CONNECTED 🚀', user?._id)
    );

    // ? DISCONNECT EVENT LISTENER
    socket.on(DISCONNECT_EVENT, disconnect);

    // ? Listener for New Messages
    socket.on(MESSAGE_RECEIVED_EVENT, onNewMessage(queryClient, store));

    // ? Listener for New Chat Event
    socket.on(NEW_CHAT_EVENT, onNewChat(queryClient, store));

    // ? Listener for Delete Chat Event
    socket.on(DELETE_CHAT_EVENT, onDeleteChat(queryClient, store, navigate));

    // ? Listener for Remove From Group EVent
    socket.on(REMOVE_FROM_GROUP_EVENT, onRemove(queryClient, store, navigate));

    // ? Listener for Rename Group EVent
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupRename(queryClient, store));

    return () => {
      socket.emit(DISCONNECT_EVENT);

      socket.off(REMOVE_FROM_GROUP_EVENT, onGroupRename(queryClient, store));

      socket.off(
        REMOVE_FROM_GROUP_EVENT,
        onRemove(queryClient, store, navigate)
      );

      socket.off(DELETE_CHAT_EVENT, onDeleteChat(queryClient, store, navigate));

      socket.off(MESSAGE_RECEIVED_EVENT, onNewMessage(queryClient, store));

      socket.off(NEW_CHAT_EVENT, onNewChat(queryClient, store));

      socket.off(CONNECTED_EVENT, () =>
        console.log('USER DISCONNECTED ⚠️', user?._id)
      );

      socket.off(DISCONNECT_EVENT, disconnect);
    };
  }, [socket, user])

  return (
    <main className="app-grid with-header">
        {children}
    </main>
  )
}

export default Landing

// TODO: Need to Implement Attachment upload Func