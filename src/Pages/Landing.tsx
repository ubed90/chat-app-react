import { PropsWithChildren, useEffect } from 'react';
import { useSocket } from '../Context/SocketContext';
import { useSelector } from 'react-redux';
import { RootState, store } from '../Store';
import {
  CALL_OFFER_RECEIVED,
  CONNECTED_EVENT,
  DELETE_CHAT_EVENT,
  DISCONNECT_EVENT,
  MESSAGE_RECEIVED_EVENT,
  NEW_CHAT_EVENT,
  REMOVE_FROM_GROUP_EVENT,
  UPDATE_GROUP_NAME_EVENT,
} from '../utils/EventsMap';
import { useQueryClient } from '@tanstack/react-query';
import {
  onDeleteChat,
  onGroupRename,
  onNewChat,
  onNewMessage,
  onRemove,
} from '../utils/socketCallbacks';
import { useNavigate } from 'react-router-dom';
import { usePeer } from '../Context/PeerContext';
import VideoCall from './VideoCall/VideoCall';
import { CallNotifier } from '../Components';
// import { IUserData } from "../models/user.model";
// import { usePeer } from "../Context/PeerContext";

const Landing: React.FC<PropsWithChildren> = ({ children }) => {
  const { socket, disconnect } = useSocket();
  const { user } = useSelector((state: RootState) => state.user);
  const queryClient = useQueryClient();

  // * For Video / Audio Call
  const {
    handleCaller,
    handleIncomingCall,
    incomingCall,
    caller,
    isVideoCall,
  } = usePeer();

  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

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

      // ? Listener for Rename Group EVent
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupRename(queryClient, store));

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
  }, [disconnect, navigate, queryClient, socket, user]);

  useEffect(() => {
    if (!socket) return;

    // ? Listener for INCOMING CALL EVENT
    socket.on(CALL_OFFER_RECEIVED, ({ caller, roomId }) => {
      console.log('INCOMING CALL REQUEST FROM :: ', caller, roomId);
      handleIncomingCall(true);
      handleCaller({ caller, roomId });
    });

    return () => {
      // ? Listener for INCOMING CALL EVENT
      socket.off(CALL_OFFER_RECEIVED, ({ caller, roomId }) => {
        console.log('CLEARING CALL OFFER SOCKET :: ', caller, roomId);
      });
    };
  }, [socket]);

  return (
    <main className="app-grid with-header">
      {children}
      {isVideoCall && <VideoCall />}
      {incomingCall && caller && <CallNotifier />}
    </main>
  );
};

export default Landing;
