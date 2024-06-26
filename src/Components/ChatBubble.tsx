import React from 'react';
import dayjs from 'dayjs';
import MessageStatus from './MessageStatus';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';

type ChatBubbleProps = {
  sentByYou: boolean;
  messageId: string;
};

let ChatBubble: React.FC<ChatBubbleProps> = ({
  sentByYou = false,
  messageId,
}) => {

  const message = useSelector((state: RootState) => state.chat.messages?.[messageId]);
  

  if(message?.isNotification) {
    return (
      <div key={messageId} className="divider whitespace-normal mb-0 h-auto text-accent text-opacity-70 before:w-auto after:w-auto">
        <span className='bg-secondary px-4 py-1 rounded-lg text-slate-100 font-bold text-base md:text-lg text-center'>{message.content}</span>
      </div>
    );
  }


  return (
    <div key={messageId} className={`chat ${sentByYou ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-image avatar rounded-full ${
          message?.sender?.profilePicture ? '' : 'placeholder:'
        }`}
      >
        {message?.sender?.profilePicture ? (
          <div className="w-10 rounded-full ring-1 ring-primary ring-opacity-50">
            <img
              alt={message?.sender.name}
              src={message?.sender.profilePicture?.url || message?.sender.profilePicture}
              className="!object-contain"
            />
          </div>
        ) : (
          <div className="avatar placeholder rounded-full ring-1 ring-primary ring-opacity-50">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span className="text-xl uppercase">
                {message?.sender.name.substring(0, 2)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-header capitalize text-lg font-bold text-primary">
        {sentByYou ? 'You' : message?.sender.name}
      </div>
      <div
        className={`chat-bubble rounded-xl text-2xl text-justify relative ${
          sentByYou ? 'pr-8' : 'chat-bubble-secondary text-white'
        }`}
      >
        {message?.content}
        {sentByYou && message?.status && <MessageStatus status={message?.status} />}
      </div>
      <div className="chat-footer">
        <time className="text-sm">
          {dayjs(message?.createdAt).format('hh:mm a')}
        </time>
      </div>
    </div>
  );
};

ChatBubble = React.memo(ChatBubble);

export default ChatBubble;
