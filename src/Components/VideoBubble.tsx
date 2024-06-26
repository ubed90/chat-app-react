import React from 'react'
import { IMessage } from '../models/message.model';
import { IUserData } from '../models/user.model';
import { FileUploaderChildrenArgs } from './FileUploader';
import VideoPlayer from "react-player/lazy";
import dayjs from 'dayjs';
import MessageStatus from './MessageStatus';

const VideoBubble: React.FC<
  FileUploaderChildrenArgs & {
    message: IMessage;
    user: IUserData | null;
    sentByYou: boolean;
  }
> = ({ isLoading, handleDownload, percentage, message, user, sentByYou }) => {
  return (
    <div
      className={`chat ${sentByYou ? 'chat-end' : 'chat-start'}`}
      onClick={() => {
        if (sentByYou) return;

        handleDownload({
          type: message.attachment?.type,
          fileName: message.content,
        });
      }}
    >
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
        className={`chat-bubble video-bubble p-0 w-full max-w-[25rem] md:max-w-[32rem] aspect-square object-contain rounded-xl text-2xl text-justify flex items-center justify-center overflow-hidden border border-gray-600 gap-4 ${
          user?._id !== message.sender._id && 'flex-row-reverse'
        }`}
      >
        {isLoading && !message.attachment?.url && (
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
        )}

        {!isLoading && message.attachment?.url && (
          <VideoPlayer
            controls
            width="100%"
            height="100%"
            url={message.attachment?.url}
          />
        )}
        {/* <p className="text-2xl">{message.content}</p> */}
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

export default VideoBubble