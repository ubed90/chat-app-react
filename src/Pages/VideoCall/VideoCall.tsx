import { useCallback, useEffect, useState } from 'react';
import Modal from '../../Components/Modal/Modal';
import { toast } from 'react-toastify';
import { useSocket } from '../../Context/SocketContext';
// import { CallProps } from '../Chat/Chat';
import {
  CALL_CONNECTED,
  CALL_REJECTED,
  TOGGLE_AUDIO,
  TOGGLE_VIDEO,
  USER_HANG_UP,
} from '../../utils/EventsMap';
import { usePeer } from '../../Context/PeerContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import usePlayers from '../../utils/hooks/usePlayers';
import './VideoCall.scss';
import { CustomBtn, Player } from '../../Components';

// * ICcons
import { IoMdMic } from 'react-icons/io';
import { IoMdMicOff } from 'react-icons/io';

import { FaVideo } from 'react-icons/fa6';
import { FaVideoSlash } from 'react-icons/fa6';

import { MdCallEnd } from 'react-icons/md';
import { IUserData } from '../../models/user.model';
import { MediaConnection } from 'peerjs';

// type CTA_STATES = {
//   muted: boolean,
//   playing: boolean,
// }

const VideoCall = () => {
  // CTA States
  // const [ctaStates, setCtaStates] = useState<CTA_STATES>({ muted: true, playing: true })

  const [isCalling, setIsCalling] = useState(false);

  const isGroupChat = useSelector(
    (state: RootState) => state.chat.selectedChat?.isGroupChat
  );

  const userId = useSelector((state: RootState) => state.user.user?._id);
  const caller = useSelector((state: RootState) => state.user.user);

  const { players, addPlayer, toggleAudio, toggleVideo, removePlayer, numOfPlayers } =
    usePlayers();

    console.log(players);
    

  const {
    peer,
    stream,
    handleVideoCall,
    handleReceiver,
    handleIsCaller,
    handleStream,
    caller: callerWithRoomid,
    handleCaller,
    destroyPeer
  } = usePeer();

  const { socket } = useSocket();

  const handleHangUp = useCallback(() => {
    handleIsCaller(false);
    if(stream) {
      stream.getTracks().forEach(track => track.stop());
      handleStream(null);
    }
    handleReceiver(null)
    handleCaller(null);
    socket?.emit(USER_HANG_UP, {
      user: caller,
      roomId: callerWithRoomid?.roomId,
    });
    setIsCalling(false);
    handleVideoCall(false);
    if(peer) {
      peer.destroy();
      destroyPeer();
    }
  }, [caller, callerWithRoomid?.roomId, destroyPeer, handleCaller, handleIsCaller, handleReceiver, handleStream, handleVideoCall, peer, socket, stream]);

  // * Add Our Own Stream whenever Component Mounts
  useEffect(() => {
    if(!stream || !userId || isCalling) return;

    addPlayer({ playerId: userId, muted: true, playing: true, stream, isCurrentUser: true, name: caller?.name as string })
    setIsCalling(true);
  }, [addPlayer, caller?.name, isCalling, stream, userId])

  // * Listen for Call Rejected Event Here
  useEffect(() => {
    if(!socket || !isCalling) return;

    const handleRejectCallback = (reason: string) => {
      console.log('PEER DESTROYED :: ');
      if(peer) {
        peer.destroy();
        destroyPeer();
      }
    
      console.log("STREAM DESTROYED :: ");
      if(stream) {
        stream.getTracks().forEach((track) => track.stop());
        handleStream(null);
      }

      handleIsCaller(false)
      handleCaller(null);
      handleVideoCall(false);
      toast.error(reason);
    };

    socket.on(CALL_REJECTED, handleRejectCallback);

    return () => {
      socket.off(CALL_REJECTED, handleRejectCallback)
    }
  }, [destroyPeer, handleCaller, handleIsCaller, handleStream, handleVideoCall, isCalling, peer, socket, stream])

  // * Listen for User Joined the room event
  useEffect(() => {
    if (!socket || !peer || !stream || !isCalling) return;

    const callConnected = ({ user, peerId }: { user: IUserData, peerId: string }) => {
      console.log('USER ACCEPTED THE CALL :: ', user, peerId);
      try {
        const call = peer.call(peerId, stream, {
          metadata: { id: caller?._id, name: caller?.name },
        });
        console.log('CALLED USER :: ', user.name);
        call.on('stream', (receiverStream) => {
          console.log(
            'RECEIVED STREAM FROM USER :: ',
            user._id,
            receiverStream
          );

          addPlayer({
            playerId: user._id,
            name: user.name,
            muted: false,
            playing: true,
            stream: receiverStream,
            call,
          });
        });
      } catch (error) {
        console.log(error);
      }
    };

    socket.on(CALL_CONNECTED, callConnected);

    return () => {
      socket.on(CALL_CONNECTED, callConnected);
    }
  }, [socket, peer, isCalling, stream, addPlayer, caller?.name, caller?._id])

  // * Listen for Incoming call on Peer
  useEffect(() => {
    if(!peer || !isCalling || !stream) return;

    const onIncomingCall = (call: MediaConnection) => {
      const { metadata } = call;

      console.log('GETTING CALL FROM :: ', metadata.name);
      call.answer(stream);
      console.log('ANSWERED CALL FROM :: ', metadata.name);

      call.on('stream', (callerStream) => {
        console.log('RECEIVED STREAM FROM USER :: ', metadata.name, callerStream);

        addPlayer({
          playerId: metadata.id,
          muted: false,
          playing: true,
          stream: callerStream,
          call,
          name: metadata.name
        });
      });
    }

    peer.on('call', onIncomingCall);
  
    return () => {
      peer.off('call', onIncomingCall)
    }
  }, [addPlayer, isCalling, peer, stream])
  
  // * Listen for User Leaving the Room
  useEffect(() => {
    if(!socket || !isCalling) return;
    
    const onUserHangUP = (user: IUserData) => {
      toast.success(user.name + ' left the call', { theme: 'dark' });
      console.log('USER LEFT THE CALL :: ', user);

      removePlayer(user._id);
    }

    socket.on(USER_HANG_UP, onUserHangUP);

    return () => {
      socket.off(USER_HANG_UP, onUserHangUP)
    }
  }, [socket, isCalling, removePlayer])

  // * Listen for Audio and Video Toggle Events
  useEffect(() => {
    if (!socket || !isCalling) return;

    const handleToggleAudio = (userId: string) => {
      console.log('TOGGLED AUDIO:: ', userId);
      toggleAudio(userId);
    };

    const handleToggleVideo = (userId: string) => {
      console.log('TOGGLED VIDEO:: ');
      toggleVideo(userId);
    };

    socket.on(TOGGLE_AUDIO, handleToggleAudio);
    socket.on(TOGGLE_VIDEO, handleToggleVideo);

    return () => {
      socket.off(TOGGLE_AUDIO, handleToggleAudio);
      socket.off(TOGGLE_VIDEO, handleToggleVideo);
    };
  }, [isCalling, socket, toggleAudio, toggleVideo]);

  const handleToggleAudio = () => {
    // setCtaStates((prev) => ({ ...prev, muted: !prev.muted }));
    toggleAudio(userId as string);

    socket?.emit(TOGGLE_AUDIO, { userId, roomId: callerWithRoomid?.roomId });
  };

  const handleToggleVideo = () => {
    // setCtaStates((prev) => ({ ...prev, playing: !prev.playing }));
    toggleVideo(userId as string);

    socket?.emit(TOGGLE_VIDEO, { userId, roomId: callerWithRoomid?.roomId });
  };

  return (
    <Modal
      id="video-call"
      isOpen={isCalling}
      onClose={handleHangUp}
      className="border-none w-full h-full !p-0 !py-6 grid gap-8 video-call-grid bg-accent"
      closeOnBackdrop={false}
    >
      {isCalling && (
        <>
          {/* <header className="text-5xl text-center">
            Call With <span className="text-accent"></span>
          </header> */}
          <Modal.Body className="w-full h-full">
            {numOfPlayers > 0 && (
              <section
                className={`players-grid h-full ${
                  numOfPlayers === 1 ? 'only-stream' : ''
                } ${isGroupChat ? 'group-chat' : ''}`}
              >
                {Object.keys(players).map((player) => {
                  const props = players[player];

                  return <Player key={player} {...props} />;
                })}
              </section>
            )}
          </Modal.Body>
          <Modal.Footer className="flex w-full justify-center gap-8">
            <CustomBtn
              clickHandler={handleToggleAudio}
              classes={`${
                players[userId as string].muted
                  ? 'bg-accent hover:bg-accent/70'
                  : 'bg-red-500 hover:bg-red-500/70'
              } btn-lg btn-circle`}
              icon={
                players[userId as string].muted ? (
                  <IoMdMic className="text-2xl text-white" />
                ) : (
                  <IoMdMicOff className="text-2xl text-white" />
                )
              }
            />

            <CustomBtn
              clickHandler={handleToggleVideo}
              classes={`${
                players[userId as string].playing
                  ? 'bg-accent hover:bg-accent/70'
                  : 'bg-red-500 hover:bg-red-500/70'
              } btn-lg btn-circle`}
              icon={
                players[userId as string].playing ? (
                  <FaVideo className="text-2xl text-white" />
                ) : (
                  <FaVideoSlash className="text-2xl text-white" />
                )
              }
            />

            <CustomBtn
              clickHandler={handleHangUp}
              classes="bg-red-500 hover:bg-red-500/70 btn-lg btn-circle"
              icon={<MdCallEnd className="text-2xl text-white" />}
            />
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default VideoCall;
