import React from 'react';
import { IMessage } from '../models/message.model';
import dayjs from 'dayjs';

type ChatBubbleProps = {
  sentByYou: boolean;
  message: IMessage;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  sentByYou = false,
  message,
}) => {

  if(message.isNotification) {
    return (
      <div className="divider whitespace-normal mb-0 h-auto text-accent text-opacity-70 before:w-auto after:w-auto">
        <span className='bg-secondary px-4 py-1 rounded-lg text-slate-100 font-bold text-base md:text-lg text-center'>{message.content}</span>
      </div>
    );
  }


  return (
    <div className={`chat ${sentByYou ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-image avatar ${
          message.sender?.profilePicture ? '' : 'placeholder:'
        }`}
      >
        {message.sender?.profilePicture ? (
          <div className="w-10 rounded-full ring-1 ring-primary ring-opacity-50">
            <img
              alt={message.sender.name}
              src={message.sender?.profilePicture}
              className="!object-contain"
            />
          </div>
        ) : (
          <div className="avatar placeholder ring-1 ring-primary ring-opacity-50">
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
      <div className={`chat-bubble rounded-xl text-2xl text-justify ${sentByYou ? '' : 'chat-bubble-success text-white'}`}>
        {message.content}
      </div>
      <div className="chat-footer">
        <time className="text-sm">
          {dayjs(message.createdAt).format('hh:mm a')}
        </time>
      </div>
    </div>
  );
};

export default ChatBubble;
