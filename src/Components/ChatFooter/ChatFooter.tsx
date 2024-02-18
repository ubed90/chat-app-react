import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';
import { FaFilePdf } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { Form } from 'react-router-dom';
import { RootState } from '../../Store';
import { Themes } from '../../utils/localStorage';
import { toast } from 'react-toastify';
import { useSocket } from '../../Context/SocketContext';
import { STOP_TYPING_EVENT, TYPING_EVENT } from '../../utils/EventsMap';
import { v4 as generateRandomUID } from 'uuid';
import { IMessage } from '../../models/message.model';
import { IUserData } from '../../models/user.model';
import { useQueryClient } from '@tanstack/react-query';

const FILE_TYPES = {
  Image: ['png', 'jpg', 'jpeg'],
  Video: ['mp4', 'mov', 'webm'],
  Document: ['pdf']
};

const MAX_SIZES = {
  Image: 1024 * 1024,
  Video: 1024 * 1024 * 5,
  Document: 1024 * 1094 * 2,
}

type ChatFooterProps = {
  sendMessage: (props: {
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
  }) => void;
  isPending: boolean;
};

const ChatFooter: React.FC<ChatFooterProps> = ({
  sendMessage,
  isPending
}) => {
  const { user } = useSelector((state: RootState) => state.user)
  const [content, setContent] = useState('');
  const { theme } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { socket } = useSocket();

  const [localTyping, setLocalTyping] = useState(false)

  const handleLocalTyping = (value: boolean) => setLocalTyping(value)

  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);

    if (!socket) return;

    if (!localTyping) {
      handleLocalTyping(true);
      socket.emit(TYPING_EVENT, selectedChat?._id);
    }

    if(timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      handleLocalTyping(false)
      socket.emit(STOP_TYPING_EVENT, selectedChat?._id);
    }, 3000);
  };

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content) return toast.warning('Message cannot be empty.');

    handleLocalTyping(false);
    socket?.emit(STOP_TYPING_EVENT, selectedChat?._id)
    if(timeout.current) clearTimeout(timeout.current);

    sendMessage({ content, setContent });
  };

  // * QueryClient for adding placeholder message
  const queryClient = useQueryClient();

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];

    if (!file) return toast.warn('Please choose a file');

    const fileExtension = file.type.split('/')[1];

    const fileType = Object.keys(FILE_TYPES).map((key) => FILE_TYPES[key as keyof typeof FILE_TYPES].includes(fileExtension) ? key : undefined).filter(Boolean)[0];

    if(!fileType || fileType.length === 0)
      return toast.error('Supported File types are ' + event.target.accept);

    const isLimitExcedded = MAX_SIZES[fileType as keyof typeof FILE_TYPES] < file.size;
    
    if(isLimitExcedded) return toast.error(
      'Max file size for ' +
        fileType +
        ' is ' +
        Math.floor(MAX_SIZES[fileType as keyof typeof FILE_TYPES] / (1024 * 1024)) + ' MB'
    );

    // // * Creating a Dummy Message
    const messageId = generateRandomUID();

    const attachmentMessage: IMessage = {
      _id: messageId,
      chat: selectedChat?._id as string,
      content: file.name,
      sender: user as IUserData,
      isNotification: false,
      isAttachment: true,
      attachment: {
        type: fileType === 'pdf' ? 'PDF' : 'IMAGE',
        file
      },
    };

    // // * Pushing the Dummy Message to Query
    queryClient.setQueryData(
      ['chat', selectedChat?._id],
      (oldMessages: IMessage[]) => {
        const newMessages = [attachmentMessage, ...oldMessages];
        return newMessages;
      }
    );
  }

  return (
    <footer className="local-chat-footer p-4 border-t-[1px] border-t-accent flex items-stretch gap-4">
      <div className="dropdown dropdown-top">
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
              onChange={handleFileUpload}
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
              onChange={handleFileUpload}
            />
          </li>
        </ul>
      </div>
      <Form
        method="POST"
        className="flex-1 flex gap-4 items-stretch"
        onSubmit={handleSend}
      >
        <input
          type="text"
          name="content"
          placeholder="Enter Your Message..."
          className={`flex-1 focus:outline-none hover:outline-none px-4 rounded-xl ${
            theme === Themes.LIGHT && 'bg-gray-200'
          }`}
          value={content}
          onChange={handleChange}
          autoComplete="off"
        />
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
      </Form>
    </footer>
  );
};

export default ChatFooter;
