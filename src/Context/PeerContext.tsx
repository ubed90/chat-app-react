/**
 * ! Peer Context Responsible for Creation and Destruction of Peer, Required for Audio/Video Call.
 * ? Exposes Various Variables and Methods which are responsible for management of Incoming and Outgoing Call under the hood.
 */
import Peer from 'peerjs';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';
import { IUserData } from '../models/user.model';

type Caller = {
  caller: IUserData,
  roomId: string,
  callType: 'Audio' | 'Video',
  groupName?: string;
}

type PeerContext = {
  peer: Peer | null;
  handlePeer: () => Promise<string>;
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
  handlePeer: () => Promise.resolve(''),
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
  // ? Peer variable indicates whether connection is established or not
  const [peer, setPeer] = useState<Peer | null>(null);
  // ? Indicates whether the user is call initiator or receiver
  const [isCaller, setIsCaller] = useState(false);
  // ? Indicates whether the call is Video or Audio
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  // ? Sets the User object of the person who is being called as receiver
  const [receiver, setReceiver] = useState<IUserData | null>(null);
  // ? Indicates there is an incoming call
  const [incomingCall, setIncomingCall] = useState(false);
  // ? Sets the incoming caller user object as Caller
  const [caller, setCaller] = useState<Caller | null>(null);
  // ? Indicates whether the current call is Group Call or Not
  const [isGroupCall, setIsGroupCall] = useState(false)
  // ? Indicated the current ongoing stream
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleStream = (stream: MediaStream | null) => {
    setStream(stream);
  };

  const handleIsCaller = (isCaller: boolean) => setIsCaller(isCaller);

  const handleVideoCall = (action: boolean) => setIsVideoCall(action);

  const handleAudioCall = (action: boolean) => setIsAudioCall(action);

  const handleReceiver = (receiver: IUserData | null) => setReceiver(receiver);

  const handlePeer = () => {
    // ? Willingly made to return a promise so that we can block further execution if Peer creation is blocked due to any reason
    return new Promise<string>((resolve, reject) => {
      /**
       * ? If Peer is already available will resolve the connected Peer
       * ? If Peer is available but is disconnected it will just initiate the reconnection.
       */
      if (peer) {
        if(peer.disconnected) {
          peer.reconnect();
        }

        return resolve(peer.id);
      }

      // ? Peer Creation
      const myPeer = new Peer({
        debug: 2,
        host: '/',
        path: '/call',
        ...(import.meta.env.PROD
          ? {}
          : { port: Number(import.meta.env.VITE_PEER_PORT) }),
        ...(import.meta.env.PROD ? { secure: true } : {}),
        config: {
          iceServers: [
            {
              urls: 'stun:stun.relay.metered.ca:80',
            },
            {
              urls: 'turn:global.relay.metered.ca:80',
              username: 'fc02a8dcd56db1322b8e6509',
              credential: 'Rnuo/x5ugZ0Uxe3a',
            },
            {
              urls: 'turn:global.relay.metered.ca:80?transport=tcp',
              username: 'fc02a8dcd56db1322b8e6509',
              credential: 'Rnuo/x5ugZ0Uxe3a',
            },
            {
              urls: 'turn:global.relay.metered.ca:443',
              username: 'fc02a8dcd56db1322b8e6509',
              credential: 'Rnuo/x5ugZ0Uxe3a',
            },
            {
              urls: 'turns:global.relay.metered.ca:443?transport=tcp',
              username: 'fc02a8dcd56db1322b8e6509',
              credential: 'Rnuo/x5ugZ0Uxe3a',
            },
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
        },
      });

      // ! Fires when Peer is created successfully
      myPeer.on('open', (id) => {
        /**
         * ? Using a setter function, because This listener is fired even Peer is Reconnected 🥲
         * ? So thats why we are using a setter function to check if previous peer exists then we will return that or else we will return the newly created Peer.
         * ! This will prevent unnecessary Connection and Disconnection of Peer.
         */
        setPeer((prevPeer) => {
          if (prevPeer) {
            console.log('PEER RECONNECTED :: ', id);
            return prevPeer;
          }

          console.log('PEER CREATED :: ', id);
          resolve(id);
          return myPeer;
        });
      })

      // ! Fires when Peer creation fails, which in turn fails the promise.
      myPeer.on('error', (error) => {
        console.log('Error Creating Peer :: ', error);
        return reject(error)
      })
    })
  };

  const destroyPeer = () => {
    if(peer) {
      console.log("PEER DISCONNECTED ::");
      peer.disconnect();
    }
  };

  const handleIncomingCall = (value: boolean) => setIncomingCall(value);

  const handleCaller = (value: Caller | null) => {
    console.log('CALLER UPATED :: ', value);
    setCaller(value);
  };

  const handleIsGroupCall = (value: boolean) => setIsGroupCall(value);

  // ? This UseEffect is used to destroy the Connected Peer when User is logged out or component is unmounted.
  useEffect(() => {

    return () => {
      if(peer) {
        console.log("PEER DESTROYED :: ", peer.id);
        peer.destroy();
        setPeer(null)
      }
    }
  }, [peer])

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