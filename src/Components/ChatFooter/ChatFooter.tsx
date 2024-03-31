import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';
import { FaFilePdf } from 'react-icons/fa6';
import { FaMicrophone } from 'react-icons/fa6';
import { BsFillEmojiLaughingFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { Form } from 'react-router-dom';
import { RootState, useAppDispatch } from '../../Store';
import { Themes } from '../../utils/localStorage';
import { toast } from 'react-toastify';
import { useSocket } from '../../Context/SocketContext';
import { STOP_TYPING_EVENT, TYPING_EVENT } from '../../utils/EventsMap';
import { v4 as generateRandomUID } from 'uuid';
import { IMessage, IMessageTypes } from '../../models/message.model';
import { IUserData } from '../../models/user.model';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import SendAudio from '../SendAudio';
import { addMessage } from '../../features/chat';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

const FILE_TYPES = {
  IMAGE: ['png', 'jpg', 'jpeg'],
  VIDEO: ['mp4', 'mov', 'webm'],
  PDF: ['pdf'],
  AUDIO: ['mp3'],
};

const MAX_SIZES = {
  IMAGE: 1024 * 1024,
  VIDEO: 1024 * 1024 * 3,
  PDF: 1024 * 1094 * 2,
  AUDIO: 1024 * 1024,
};

type ChatFooterProps = {
  sendMessage: (props: {
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
  }) => void;
  isPending: boolean;
};

let ChatFooter: React.FC<ChatFooterProps> = ({ sendMessage, isPending }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const [content, setContent] = useState('');
  const { theme } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { socket } = useSocket();

  // * Local State for Emoji Drawer
  const [emojiPicker, setEmojiPicker] = useState(false)

  // * Local State for Audio Recorder
  const [showAudioRecorder, setSetshowAudioRecorder] = useState(false)

  const toggleAudioRecorderStatus = () => {
    setSetshowAudioRecorder(!showAudioRecorder);
  }

  const toggleEmojiPicker = () => {
    setEmojiPicker(!emojiPicker);
  }

  const handleEmojiClick = (event: EmojiClickData) => {
    setContent(prevContent => prevContent + event.emoji)
  }

  const [localTyping, setLocalTyping] = useState(false);

  const handleLocalTyping = (value: boolean) => setLocalTyping(value);

  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);

    if (!socket) return;

    if (!localTyping) {
      handleLocalTyping(true);
      socket.emit(TYPING_EVENT, selectedChat?._id);
    }

    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      handleLocalTyping(false);
      socket.emit(STOP_TYPING_EVENT, selectedChat?._id);
    }, 3000);
  };

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content) return toast.warning('Message cannot be empty.');

    handleLocalTyping(false);
    socket?.emit(STOP_TYPING_EVENT, selectedChat?._id);
    if (timeout.current) clearTimeout(timeout.current);

    sendMessage({ content, setContent });
  };

  // * QueryClient for adding placeholder message
  // const queryClient = useQueryClient();

  const dispatch = useAppDispatch()

  const handleFileUpload = ({ event, file }: {
    event?: ChangeEvent<HTMLInputElement>;
    file?: File
  }) => {
    const uploadedFile = event?.target?.files?.[0] || file;

    if (!uploadedFile) return toast.warn('Please choose a file');

    const fileExtension = uploadedFile.type.split('/')[1];

    const fileType = Object.keys(FILE_TYPES)
      .map((key) =>
        FILE_TYPES[key as keyof typeof FILE_TYPES].includes(fileExtension)
          ? key
          : undefined
      )
      .filter(Boolean)[0];

    if (!fileType || fileType.length === 0)
      return toast.error('Supported File types are ' + event?.target.accept);

    const isLimitExcedded =
      MAX_SIZES[fileType as keyof typeof FILE_TYPES] < uploadedFile.size;

    if (isLimitExcedded)
      return toast.error(
        'Max file size for ' +
          fileType +
          ' is ' +
          Math.floor(
            MAX_SIZES[fileType as keyof typeof FILE_TYPES] / (1024 * 1024)
          ) +
          ' MB'
      );

    // // * Creating a Dummy Message
    const messageId = generateRandomUID();

    const attachmentMessage: IMessage = {
      _id: messageId,
      chat: selectedChat?._id as string,
      content: uploadedFile.name,
      sender: user as IUserData,
      isNotification: false,
      isAttachment: true,
      attachment: {
        type: fileType as IMessageTypes,
        file: uploadedFile
      },
      status: 'LOADING'
    };

    // * Pushing the Dummy Message to Query
    // ! Not required in latest Redux implementation
    // queryClient.setQueryData(
    //   ['chat', selectedChat?._id],
    //   (oldMessages: IMessage[]) => {
    //     const newMessages = [attachmentMessage, ...oldMessages];
    //     return newMessages;
    //   }
    // );
    dispatch(addMessage({ message: attachmentMessage }))
  };

  // * Emoji Picker ref
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // * logic to Close Emoji Picker when clicked Outside
  useOnClickOutside(emojiPickerRef, () => setEmojiPicker(false))

  return (
    <footer className="local-chat-footer p-4 border-t-[1px] border-t-accent flex items-stretch gap-4">
      {showAudioRecorder ? (
        <SendAudio
          cancelRecording={toggleAudioRecorderStatus}
          handleFileUpload={handleFileUpload}
        />
      ) : (
        <>
          <div className="dropdown dropdown-top z-10">
            <button className="btn btn-square btn-lg btn-neutral rounded-xl">
              <GrAttachment className="text-2xl" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] mb-7 menu menu-lg shadow bg-neutral rounded-xl min-w-max"
            >
              <li className="flex items-center">
                <label
                  htmlFor="image-upload"
                  className="rounded-lg text-2xl w-full flex gap-4 text-white hover:bg-gray-700"
                >
                  <FaFilePdf className="text-3xl" /> Upload PDF
                </label>
                <input
                  type="file"
                  name="image-upload"
                  accept=".pdf"
                  id="image-upload"
                  className="hidden"
                  onChange={(event) => handleFileUpload({ event })}
                />
              </li>
              <li className="flex items-center">
                <label
                  htmlFor="pdf-upload"
                  className="rounded-lg text-2xl w-full flex gap-4 text-white hover:bg-gray-700"
                >
                  <FaImage className="text-3xl" /> Upload Media
                </label>
                <input
                  type="file"
                  name="pdf-upload"
                  id="pdf-upload"
                  accept=".jpg,.jpeg,.png,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={(event) => handleFileUpload({ event })}
                />
              </li>
            </ul>
          </div>
          <Form
            method="POST"
            className="flex-1 flex gap-4 items-stretch"
            onSubmit={handleSend}
          >
            <div className="input-with-emoji flex-1 relative">
              <input
                type="text"
                name="content"
                placeholder="Enter Your Message..."
                className={`w-full h-full focus:outline-none hover:outline-none pl-4 pr-16 rounded-xl ${
                  theme === Themes.LIGHT && 'bg-gray-200'
                }`}
                value={content}
                onChange={handleChange}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={toggleEmojiPicker}
                className="hover:bg-accent hover:bg-opacity-20 transition rounded-full h-full px-4 absolute right-0 top-2/4 -translate-y-2/4"
              >
                <BsFillEmojiLaughingFill className="text-3xl text-gray-500" />
              </button>
              <div ref={emojiPickerRef}>
                <EmojiPicker
                  className="!w-[25rem] md:!w-[32rem] absolute bottom-[46rem] left-full -translate-x-full"
                  height="40rem"
                  theme={Theme.DARK}
                  open={emojiPicker}
                  onEmojiClick={handleEmojiClick}
                  searchDisabled
                />
              </div>
            </div>
            {content.length ? (
              <button
                disabled={isPending}
                className="btn btn-square btn-lg btn-neutral rounded-xl"
              >
                {isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <IoSend className="text-2xl" />
                )}
              </button>
            ) : (
              <button
                onClick={toggleAudioRecorderStatus}
                className="btn btn-square btn-lg btn-neutral rounded-xl"
              >
                <FaMicrophone className="text-2xl" />
              </button>
            )}
          </Form>
        </>
      )}
    </footer>
  );
};

ChatFooter = React.memo(ChatFooter);

export default ChatFooter;
