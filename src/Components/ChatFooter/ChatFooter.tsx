import React, { FormEvent, useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { Form } from 'react-router-dom';
import { RootState } from '../../Store';
import { Themes } from '../../utils/localStorage';
import { toast } from 'react-toastify';

type ChatFooterProps = {
  sendMessage: (content: string) => void;
  isPending: boolean;
};

const ChatFooter: React.FC<ChatFooterProps> = ({ sendMessage, isPending }) => {
  const [content, setContent] = useState('')
  const { theme } = useSelector((state: RootState) => state.user)

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if(!content) return toast.warning('Message cannot be empty.')

    sendMessage(content);
  }

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
          onChange={(event) => setContent(event.target.value)}
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
