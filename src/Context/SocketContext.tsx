import socketio, { Socket } from "socket.io-client";
import { getUserFromLocalStorage } from "../utils/localStorage";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { store } from "../Store";

const getSocket = () => {
    const user = getUserFromLocalStorage() || store.getState()?.user?.user;
    
    return socketio(import.meta.env.VITE_WS_URI || process.env.VITE_WS_URI, {
      ...(import.meta?.env?.PROD || process.env.NODE_ENV === 'production'
        ? {}
        : { withCredentials: true }),
      auth: { token: user?.token },
    });
}

type SocketContext = {
  socket: Socket | null;
  disconnect: () => void;
};

const socketContext = createContext<SocketContext>({ socket: null, disconnect: () => {} });

const SocketProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(
      null
    );

    const disconnect = () => {
      if(socket) {
        socket.disconnect();
        socket.close();
        setSocket(null);
      }
    };

    useEffect(() => {
        setSocket(getSocket());

        return () => {
          console.log("Socket Disconnected");
          disconnect();
        }
    }, [])

    return <socketContext.Provider value={{ socket, disconnect }}>
        {children}
    </socketContext.Provider>
}

export const useSocket = () => useContext(socketContext);

export default SocketProvider;

