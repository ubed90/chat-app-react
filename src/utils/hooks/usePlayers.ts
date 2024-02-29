import { useState } from 'react';
import deepClone from 'clone-deep';
import { MediaConnection } from 'peerjs';

export type PlayerProps = {
  stream: MediaStream;
  muted: boolean;
  playing: boolean;
  name?: string;
  isCurrentUser?: boolean;
  call?: MediaConnection;
};

const usePlayers = () => {
  const [players, setPlayers] = useState<{ [key: string]: PlayerProps }>({});
  const [numOfPlayers, setNumOfPlayers] = useState(0)

  const addPlayer = ({ stream, muted, playing, isCurrentUser, playerId, name }: PlayerProps & { playerId: string }) => {
    console.log(name)

    setPlayers({
      ...players,
      [playerId]: { stream, muted, playing, isCurrentUser, name },
    });
    
    setNumOfPlayers(Object.keys(players).length + 1);
  };

  const removePlayer = (playerId: string) => {
    const copyPlayers = deepClone(players);
    if (copyPlayers[playerId]?.stream) {
      copyPlayers[playerId]?.stream.getTracks().forEach((track) => track.stop());
    }
    if(copyPlayers[playerId]?.call) {
      copyPlayers[playerId]?.call?.close();
    }
    delete copyPlayers[playerId];
    setPlayers(copyPlayers);

    setNumOfPlayers(Object.keys(copyPlayers).length);
  };

  const toggleAudio = (playerId: string) => {
    const copyPlayers = deepClone(players);
    copyPlayers[playerId].muted = !copyPlayers[playerId].muted;
    const audioTrack = copyPlayers[playerId].stream.getAudioTracks()[0]
    audioTrack.enabled = !audioTrack.enabled
    setPlayers(copyPlayers);
  }

  const toggleVideo = (playerId: string) => {
    const copyPlayers = deepClone(players);
    copyPlayers[playerId].playing = !copyPlayers[playerId].playing;
    const videoTrack = copyPlayers[playerId].stream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setPlayers(copyPlayers);
  }

  return { players, addPlayer, removePlayer, toggleAudio, toggleVideo, numOfPlayers };
};

export default usePlayers;
