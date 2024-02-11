import React, { FormEvent, useRef, useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { Form } from 'react-router-dom';
import { RootState } from '../../Store';
import { Themes } from '../../utils/localStorage';
import { toast } from 'react-toastify';
import { useSocket } from '../../Context/SocketContext';
import { STOP_TYPING_EVENT, TYPING_EVENT } from '../../utils/EventsMap';

type ChatFooterProps = {
  sendMessage: (props: {
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
  }) => void;
  isPending: boolean;
};

const ChatFooter: React.FC<ChatFooterProps> = ({
  sendMessage,
  isPending,
}) => {
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


    socket?.emit(STOP_TYPING_EVENT, selectedChat?._id)
    if(timeout.current) clearTimeout(timeout.current);

    sendMessage({ content, setContent });
  };

  return (
    <footer className="local-chat-footer p-4 border-t-[1px] border-t-accent flex items-stretch gap-4">
      <button className="btn btn-square btn-lg btn-neutral rounded-xl">
        <GrAttachment className="text-2xl" />
      </button>
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
