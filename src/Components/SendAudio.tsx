import React, { useEffect, useRef, useState } from 'react';
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from 'react-icons/fa';
import { MdSend } from 'react-icons/md';
import WaveSurfer from 'wavesurfer.js';
import formatTime from '../utils/formatTime';
import { Id, toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';

type SendAudioProps = {
  cancelRecording: () => void;
  handleFileUpload: (handleFileProps: {
    event?: React.ChangeEvent<HTMLInputElement> | undefined;
    file?: File | undefined;
  }) => Id | undefined;
};

const SendAudio: React.FC<SendAudioProps> = ({ cancelRecording, handleFileUpload }) => {
  const username = useSelector((state: RootState) => state.user.user?.username);

  const [isRecording, setIsRecording] = useState(false);

  const [recordedAudio, setRecordedAudio] = useState<HTMLAudioElement | null>(
    null
  );

  const [waveform, setWaveform] = useState<WaveSurfer | null>(null);

  const [recordingDuration, setRecordingDuration] = useState(0);

  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  const [totalDuration, setTotalDuration] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  const [file, setFile] = useState<File | undefined>();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const waveformRef = useRef<HTMLDivElement>(null);

  // const durationRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartRecording = async () => {
    if (!audioRef.current) return;

    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setRecordedAudio(null);

    audioRef.current.srcObject = null;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(mediaStream);

      mediaRecorderRef.current = mediaRecorder;

      audioRef.current.srcObject = mediaStream;

      // let audioChunks: BlobPart[] = [];

      // mediaRecorder.ondataavailable = (event) => {
      //   audioChunks.push(event.data);
      // };

      // mediaRecorder.onstop = () => {
      //     const blob = new Blob(audioChunks, { type: 'audio/ogg; codecs=opus' });
      //     audioChunks = [];
      //     const audioURL = URL.createObjectURL(blob);
      //     const audio = new Audio(audioURL);
      //     setRecordedAudio(audio);

      //     // const audioContext = new AudioContext();

      //     // blob.arrayBuffer().then(buffer => audioContext.decodeAudioData(buffer)).then(ctx => console.log(ctx.duration))

      //     waveform?.load(audioURL);
      // }

      mediaRecorder.start();
    } catch (error) {
      toast.error('Please provide audio access to send recording.');
      return cancelRecording();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      waveform?.stop();

      let audioChunks: BlobPart[] = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        // * Setting the Recorded File into variable for local listening;
        const blob = new Blob(audioChunks, {
          type: 'audio/ogg; codecs=opus',
        });
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        setRecordedAudio(audio);

        waveform?.load(audioURL);

        // * Now creating audio file to send to server for storage;
        new Promise<File>((resolve, reject) => {
          try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });

            // * Restting the chunks after usage to free some memory;
            audioChunks = [];

            // * Creating a File Object with name and type
            const audioFile = new File(
              [audioBlob],
              username + '_' + Date.now(),
              { type: 'audio/mp3' }
            );

            resolve(audioFile);
          } catch (error) {
            reject(error);
          }
        })
          .then((file) => setFile(file))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((error: any) => toast.error(error.message));
        // setRecordedAudio(audioFile)
      });
    }
  };

  const handlePlayRecording = async () => {
    if (recordedAudio) {
      await waveform?.playPause();
      await recordedAudio.play();
      setIsPlaying(true);
    }
  };

  const handlePauseRecording = () => {
    waveform?.pause();
    recordedAudio?.pause();
    setIsPlaying(false);
  };

  const cleanUP = () => {
    if(audioRef.current) {
      audioRef.current.srcObject = null;
    }

    cancelRecording();
  }

  const handleSend = () => {
    handleFileUpload({ file })
    cleanUP();
  }

  useEffect(() => {
    const waveSurfer = WaveSurfer.create({
      container: waveformRef.current as HTMLDivElement,
      interact: false,
      waveColor: '#ccc',
      progressColor: '#4a9eff',
      cursorColor: '#7ae3c3',
      barWidth: 2,
      height: 30,
    });

    setWaveform(waveSurfer);

    // waveSurfer.on('finish', () => {
    //   setIsPlaying(false);
    // });

    return () => {
      waveSurfer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    const allowedLimit = 30;
    let start = 0;

    const interval = setInterval(() => {
      start += 1;
      setRecordingDuration((prevDuration) => {
        setTotalDuration(prevDuration + 1);
        return prevDuration + 1;
      });

      if(start === allowedLimit) {
        toast.error('Maximum 30 secs of audio message is allowed');
        handleStopRecording();
        clearInterval(interval);
        return;
      }
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    if (waveform) handleStartRecording();
  }, [waveform]);

  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };

      const recordingEnded = () => {
        setCurrentPlaybackTime(0);
        waveform?.stop();
        setIsPlaying(false);
      };

      recordedAudio.addEventListener('ended', recordingEnded);

      recordedAudio.addEventListener('timeupdate', updatePlaybackTime);

      return () => {
        recordedAudio.removeEventListener('ended', recordingEnded);
        recordedAudio.removeEventListener('timeupdate', updatePlaybackTime);
      };
    }
  }, [recordedAudio, waveform]);

  return (
    <div className="flex w-full h-full justify-end gap-4 items-stretch">
      <button
        onClick={cleanUP}
        className="btn btn-square btn-lg btn-error rounded-xl"
      >
        <FaTrash className="text-2xl text-white" />
      </button>

      <div className="py-2 px-4 text-white flex-1 sm:flex-initial sm:w-96 flex gap-3 items-center bg-zinc-800 rounded-xl drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 w-full text-2xl animate-pulse flex justify-between items-center">
            Recording <span>{formatTime(recordingDuration)}</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {isPlaying ? (
                  <FaStop
                    className="cursor-pointer text-red-500 animate-pulse"
                    onClick={handlePauseRecording}
                  />
                ) : (
                  <FaPlay
                    className="cursor-pointer"
                    onClick={handlePlayRecording}
                  />
                )}
              </>
            )}
          </div>
        )}

        <div
          ref={waveformRef}
          className="flex-1"
          hidden={isRecording || !recordedAudio}
        />
        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden></audio>
      </div>

      <div className="self-center">
        {!isRecording ? (
          <FaMicrophone
            onClick={handleStartRecording}
            className="text-red-500 text-4xl cursor-pointer"
          />
        ) : (
          <FaPauseCircle
            onClick={handleStopRecording}
            className="text-red-500 text-4xl cursor-pointer"
          />
        )}
      </div>

      <button
        onClick={handleSend}
        className="btn btn-square btn-lg btn-neutral rounded-xl"
      >
        <MdSend className="text-2xl text-white" />
      </button>
    </div>
  );
};

export default SendAudio;
