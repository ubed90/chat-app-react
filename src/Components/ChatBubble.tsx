import React from 'react';
import { IMessage } from '../models/message.model';
import dayjs from 'dayjs';

type ChatBubbleProps = {
  alignRight: boolean;
  message: IMessage;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  alignRight = false,
  message,
}) => {
  return (
    <div className={`chat ${alignRight ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-image avatar ${
          message.sender?.profilePicture ? '' : 'placeholder:'
        }`}
      >
        {message.sender?.profilePicture ? (
          <div className="w-10 rounded-full">
            <img
              alt={message.sender.name}
              src={message.sender?.profilePicture}
            />
          </div>
        ) : (
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span className="text-xl uppercase">{message.sender.name.substring(0, 2)}</span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-header capitalize text-lg font-bold text-primary">
        {message.sender.name}
      </div>
      <div className="chat-bubble rounded-xl text-2xl">{message.content}</div>
      <div className="chat-footer">
        <time className="text-sm">
          {dayjs(message.createdAt).format('hh:mm a')}
        </time>
      </div>
    </div>
  );
};

export default ChatBubble;
