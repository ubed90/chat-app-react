import React, { useEffect, useRef, useState } from 'react'
import { IMessage } from '../models/message.model';
import { IUserData } from '../models/user.model';
import { FileUploaderChildrenArgs } from './FileUploader';
import dayjs from 'dayjs';
import WaveSurfer from 'wavesurfer.js';
import { FaPlay, FaStop } from 'react-icons/fa';
import formatTime from '../utils/formatTime';
import MessageStatus from './MessageStatus';

const AudioBubble: React.FC<
  FileUploaderChildrenArgs & {
    message: IMessage;
    user: IUserData | null;
    sentByYou: boolean;
  }
> = ({ message, user, isLoading, percentage, sentByYou }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  const [totalDuration, setTotalDuration] = useState(0);

  const [waveform, setWaveform] = useState<WaveSurfer | null>(null);

  const waveformRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || waveform || !message.attachment?.content) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current as HTMLDivElement,
      interact: false,
      waveColor: '#fff',
      progressColor: sentByYou ? '#4a9eff' : '#ff6347',
      cursorColor: '#7ae3c3',
      barWidth: 2,
      height: 30,
    });

    setWaveform(wavesurfer);

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      wavesurfer.stop();
      setCurrentPlaybackTime(0);
    });
  }, [isLoading, message.attachment?.content, sentByYou, waveform]);

  useEffect(() => {
    if (!waveform || !message.attachment?.content) return;

    const audioURL = `data:audio/mp3;base64,${message.attachment.content}`;

    if (!audio) {
      const localAudio = new Audio(audioURL);

      setAudio(localAudio);
    }

    waveform.load(audioURL);

    waveform.on('ready', () => {
      setTotalDuration(Math.floor(waveform.getDuration()));
    });

    const updateTime = (currentTime: number) => {
      setCurrentPlaybackTime(currentTime);
    };

    waveform.on('timeupdate', updateTime);

    return () => {
      if (waveform) {
        waveform.destroy();
        setWaveform(null);
      }
    };
  }, [message.attachment?.content, audio, waveform]);

  const handlePlay = async () => {
    if (!audio || !waveform) return;

    await waveform.play();
    await audio.play();
    setIsPlaying(true);
  };

  const handlePause = async () => {
    if (!audio || !waveform) return;

    waveform.pause();
    audio.pause();
    setIsPlaying(false);
  };

  return (
    <div className={`chat ${sentByYou ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-image avatar ${
          user?.profilePicture ? '' : 'placeholder:'
        }`}
      >
        {user?.profilePicture ? (
          <div className="w-10 rounded-full ring-1 ring-primary ring-opacity-50">
            <img
              alt={user.name}
              src={user?.profilePicture}
              className="!object-contain"
            />
          </div>
        ) : (
          <div className="avatar rounded-full placeholder ring-1 ring-primary ring-opacity-50">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span className="text-xl uppercase">
                {message.sender.name.substring(0, 2)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-header capitalize text-lg font-bold text-primary">
        {sentByYou ? 'You' : message.sender.name}
      </div>
      <div
        className={`chat-bubble p-4 rounded-xl text-2xl text-justify flex items-center gap-4 ${
          user?._id !== message.sender._id && isLoading && 'flex-row-reverse'
        } ${sentByYou ? '' : 'chat-bubble-secondary text-white'}`}
      >
        {isLoading ||
          (!message.attachment?.content && (
            <>
              <div
                className={`radial-progress text-success text-base font-bold ${
                  isLoading || sentByYou ? '' : 'text-white cursor-pointer'
                }`}
                style={{
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  // TS Giving error on Dynamic Custom Properties
                  '--value': isLoading ? percentage : 100,
                  '--size': '3.5rem',
                  '--thickness': '2px',
                }}
                role="progressbar"
              >
                {isLoading && Math.floor(percentage) + '%'}
              </div>
              <p className="text-2xl max-w-80 md:max-w-xl truncate">
                {message.content}
              </p>
            </>
          ))}
        {!isLoading && message.attachment?.content && (
          <>
            {isPlaying ? (
              <FaStop
                onClick={handlePause}
                className="text-red-500 animate-pulse text-2xl cursor-pointer"
              />
            ) : (
              <FaPlay
                onClick={handlePlay}
                className="text-white text-2xl cursor-pointer"
              />
            )}

            <div ref={waveformRef} className="w-80 md:w-96" />
            {audio && waveform && (
              <span>
                {isPlaying
                  ? formatTime(currentPlaybackTime)
                  : formatTime(totalDuration)}
              </span>
            )}
          </>
        )}

        {sentByYou && message.status && (
          <MessageStatus status={message.status} />
        )}
      </div>
      <div className="chat-footer">
        <time className="text-sm">{dayjs().format('hh:mm a')}</time>
      </div>
    </div>
  );
};

export default AudioBubble