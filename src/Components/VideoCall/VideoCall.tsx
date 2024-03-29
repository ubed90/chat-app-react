import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../Modal/Modal';
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
import { BlockModal, CustomBtn, Player } from '..';

// * ICcons
import { IoMdMic } from 'react-icons/io';
import { IoMdMicOff } from 'react-icons/io';

import { FaVideo } from 'react-icons/fa6';
import { FaVideoSlash } from 'react-icons/fa6';

import { MdCallEnd } from 'react-icons/md';
import { IUserData } from '../../models/user.model';
import { MediaConnection } from 'peerjs';

import { useBlocker } from "react-router-dom";

// type CTA_STATES = {
//   muted: boolean,
//   playing: boolean,
// }

const VideoCall = () => {
  // CTA States
  // const [ctaStates, setCtaStates] = useState<CTA_STATES>({ muted: true, playing: true })

  const [isCalling, setIsCalling] = useState(false);

  // * Required for Group Calls
  const [callAccepted, setCallAccepted] = useState(false);

  const blockNavigation = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isCalling && currentLocation.pathname !== nextLocation.pathname
  );

  const userId = useSelector((state: RootState) => state.user.user?._id);
  const userName = useSelector((state: RootState) => state.user.user?.name);
  const caller = useSelector((state: RootState) => state.user.user);

  const { players, addPlayer, toggleAudio, toggleVideo, removePlayer } =
    usePlayers();
    

  const {
    peer,
    stream,
    handleVideoCall,
    handleReceiver,
    handleIsCaller,
    handleStream,
    caller: callerWithRoomid,
    handleCaller,
    destroyPeer,
    isGroupCall
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
    if(!socket || !isCalling || isGroupCall) return;

    const handleRejectCallback = (reason: string) => {
      console.log('PEER DESTROYED :: ');
      if(peer) {
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
  }, [destroyPeer, handleCaller, handleIsCaller, handleStream, handleVideoCall, isCalling, isGroupCall, peer, socket, stream])

  // * Listen If even a single user hasn't join the call.
  useEffect(() => {
    if(!socket || !isCalling || !isGroupCall || callAccepted) return;


    const timeout = setTimeout(() => {
      toast.error('No one Answered the call');
      handleHangUp();
    }, 30000);

    return () => {
      clearTimeout(timeout)
    }
  }, [callAccepted, handleHangUp, isCalling, isGroupCall, socket])

  // * Listen for User Joined the room event
  useEffect(() => {
    if (!socket || !peer || peer.disconnected || !stream || !isCalling) return;

    const callConnected = ({ user, peerId }: { user: IUserData, peerId: string }) => {
      console.log('USER ACCEPTED THE CALL :: ', user, peerId);
      // * For Group Call
      if(isGroupCall && !callAccepted) {
        setCallAccepted(true)
      }
      try {
        const call = peer.call(peerId, stream, {
          metadata: { id: userId, name: userName },
        });
        console.log('CALLED USER :: ', user.name);
        call.on('stream', (receiverStream) => {
          console.log(
            'RECEIVED STREAM FROM USER :: ',
            user._id,
            receiverStream
          );

          if(!players[user._id]) {
            addPlayer({
              playerId: user._id,
              name: user.name,
              muted: false,
              playing: true,
              stream: receiverStream,
              call,
            });
          }
        });

        if(!players[user._id]) {
          call?.on('close', () => {
            console.log('Connection Closed From User:: ', user._id, user.name);

            removePlayer(user._id);
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    socket.on(CALL_CONNECTED, callConnected);

    return () => {
      socket.off(CALL_CONNECTED, callConnected);
    }
  }, [socket, peer, isCalling, stream, addPlayer, removePlayer, isGroupCall, callAccepted, userId, userName, players])

  // * Listen for Incoming call on Peer
  useEffect(() => {
    if(!peer || peer.disconnected || !isCalling || !stream) return;

    const onIncomingCall = (call: MediaConnection) => {
      const { metadata } = call;

      if (isGroupCall && !callAccepted) {
        setCallAccepted(true);
      }

      console.log('GETTING CALL FROM :: ', metadata.name);
      call.answer(stream);
      console.log('ANSWERED CALL FROM :: ', metadata.name);

      try {
        call.on('stream', (callerStream) => {
          console.log(
            'RECEIVED STREAM FROM USER :: ',
            metadata.name,
            callerStream
          );

          if(!players[metadata.id]) {
            addPlayer({
              playerId: metadata.id,
              muted: false,
              playing: true,
              stream: callerStream,
              call,
              name: metadata.name,
            });
          }
        });

        if (!players[metadata.id]) {
          call.on('close', () => {
            console.log('CONNECTION CLOSED FROM USER:: ', metadata.name);
            removePlayer(metadata.id);
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    peer.on('call', onIncomingCall);
  
    return () => {
      peer.off('call', onIncomingCall)
    }
  }, [addPlayer, callAccepted, isCalling, isGroupCall, peer, players, removePlayer, stream])
  
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

  // * Listen for Page Refresh and Notify user has left in the room
  useEffect(() => {
    if(!socket || !isCalling || !peer) return;

    const onPageReload = (event: BeforeUnloadEvent) => {
      const customMessage =
        'Are you sure you want to leave? Your call will be disconnected.';

      // Set the custom message
      event.returnValue = customMessage;

      // Return the custom message to display it along with the default browser message
      return customMessage;
    }

    window.addEventListener('beforeunload', onPageReload);

    window.addEventListener('pagehide', () => {
      peer?.destroy();
      // socket.emit(USER_HANG_UP, { user: 'Kalwa', roomId: 'kela' })
    })


    return () => {
      window.removeEventListener('beforeunload', onPageReload);
      window.removeEventListener('pagehide', () => {})
    }

  }, [isCalling, peer, socket])

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

  const handleLeave = () => {
    handleHangUp();
    blockNavigation.proceed && blockNavigation.proceed();
  }

  const handleCancel = () => {
    blockNavigation.state === 'blocked' && blockNavigation.reset &&  blockNavigation.reset();
  }

  const numOfPlayers = useMemo(() => Object.keys(players).length, [players]);

  console.log(players);
  
  

  return (
    <Modal
      id="video-call"
      isOpen={isCalling}
      onClose={handleHangUp}
      className="border-none w-full h-full !p-0 grid gap-4 video-call-grid bg-accent relative"
      closeOnBackdrop={false}
      disableCloseOnEscape
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
                } ${numOfPlayers > 2 ? 'group-call' : ''}`}
              >
                {Object.keys(players).map((player) => {
                  const props = players[player];

                  return <Player key={player} {...props} />;
                })}
              </section>
            )}
          </Modal.Body>
          <Modal.Footer className="self-center flex w-full justify-center gap-8">
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
          {blockNavigation.state === 'blocked' && <BlockModal handleLeave={handleLeave} handleCancel={handleCancel} />}
        </>
      )}
    </Modal>
  );
};

export default VideoCall;
