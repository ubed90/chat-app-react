import Peer from 'peerjs';
import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { IUserData } from '../models/user.model';
import { v4 as randomIdGenerator } from "uuid";

type Caller = {
  caller: IUserData,
  roomId: string,
  callType: 'Audio' | 'Video',
  groupName?: string;
}

type PeerContext = {
  peer: Peer | null;
  handlePeer: () => string;
  destroyPeer: () => void;
  incomingCall: boolean;
  handleIncomingCall: (value: boolean) => void;
  stream: MediaStream | null;
  handleStream: (stream: MediaStream | null) => void;
  isCaller: boolean;
  handleIsCaller: (isCaller: boolean) => void;
  caller: Caller | null;
  handleCaller: (value: Caller | null) => void;
  receiver: IUserData | null;
  handleReceiver(receiver: IUserData | null): void;
  isVideoCall: boolean;
  handleVideoCall(value: boolean): void;
  isAudioCall: boolean;
  handleAudioCall(value: boolean): void;
  isGroupCall: boolean;
  handleIsGroupCall(isGroupCall: boolean): void;
};

const peerContext = createContext<PeerContext>({
  peer: null,
  handlePeer: () => '',
  destroyPeer: () => {},
  incomingCall: false,
  handleIncomingCall: () => {},
  isCaller: false,
  handleIsCaller: () => {},
  stream: null,
  handleStream: () => {},
  receiver: null,
  handleReceiver: () => {},
  caller: null,
  handleCaller: () => {},
  isVideoCall: false,
  handleVideoCall: () => {},
  isAudioCall: false,
  handleAudioCall: () => {},
  isGroupCall: false,
  handleIsGroupCall: () => {},
});

const PeerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [receiver, setReceiver] = useState<IUserData | null>(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState<Caller | null>(null);
  const [isGroupCall, setIsGroupCall] = useState(false)

  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleStream = (stream: MediaStream | null) => {
    setStream(stream);
  };

  const handleIsCaller = (isCaller: boolean) => setIsCaller(isCaller);

  const handleVideoCall = (action: boolean) => setIsVideoCall(action);

  const handleAudioCall = (action: boolean) => setIsAudioCall(action);

  const handleReceiver = (receiver: IUserData | null) => setReceiver(receiver);

  const handlePeer = () => {
    if(peer) return peer.id

    const myPeer = new Peer(randomIdGenerator(), {
      debug: 2,
      host: '/',
      path: '/peerjs/video-call',
      port: 3000,
    });

    console.log('PEER CREATED :: ', myPeer.id);

    setPeer(myPeer);

    return myPeer.id;
  };

  const destroyPeer = () => {
    console.log("PEER SET TO NULL ::");
    setPeer(null);
  };

  const handleIncomingCall = (value: boolean) => setIncomingCall(value);

  const handleCaller = (value: Caller | null) => {
    console.log('CALLER UPATED :: ', value);
    setCaller(value);
  };

  const handleIsGroupCall = (value: boolean) => setIsGroupCall(value);

  return (
    <peerContext.Provider
      value={{
        peer,
        handlePeer,
        destroyPeer,
        isCaller,
        handleStream,
        stream,
        handleIsCaller,
        isVideoCall,
        handleVideoCall,
        isAudioCall,
        handleAudioCall,
        handleReceiver,
        receiver,
        incomingCall,
        handleIncomingCall,
        caller,
        handleCaller,
        isGroupCall,
        handleIsGroupCall
      }}
    >
      {children}
    </peerContext.Provider>
  );
};

export default PeerProvider;

export const usePeer = () => useContext(peerContext);
