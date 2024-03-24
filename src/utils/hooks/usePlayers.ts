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

  const addPlayer = ({ stream, muted, playing, isCurrentUser, playerId, name, call }: PlayerProps & { playerId: string }) => {
    setPlayers((prevPlayers) => ({
      ...prevPlayers,
      [playerId]: { stream, muted, playing, isCurrentUser, name, call },
    }));
    
  };

  const removePlayer = (playerId: string) => {
    setPlayers((prevPlayers) => {
      const copyPlayers = deepClone(prevPlayers);

      const player = copyPlayers[playerId];

      if (player?.stream) {
        player?.stream.getTracks().forEach((track) => track.stop());
      }

      if(player?.call) {
        player?.call?.close();
      }

      delete copyPlayers[playerId];

      return copyPlayers
    })
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

  return { players, addPlayer, removePlayer, toggleAudio, toggleVideo };
};

export default usePlayers;
