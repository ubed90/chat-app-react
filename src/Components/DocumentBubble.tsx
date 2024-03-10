import React from 'react'
import { IMessage } from '../models/message.model';
import { IUserData } from '../models/user.model';
import { FileUploaderChildrenArgs } from './FileUploader';
import { FaCheck } from 'react-icons/fa';
import { IoMdDownload } from 'react-icons/io';
import dayjs from 'dayjs';
import MessageStatus from './MessageStatus';

const DocumentBubble: React.FC<
  FileUploaderChildrenArgs & {
    message: IMessage;
    user: IUserData | null;
    sentByYou: boolean;
  }
> = ({ isLoading, percentage, handleDownload, message, user, sentByYou }) => {
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
      <div
        className={`chat-bubble p-4 rounded-xl text-2xl text-justify flex items-center gap-4 ${
          user?._id !== message.sender._id && 'flex-row-reverse'
        } ${sentByYou ? '' : 'chat-bubble-success text-white'}`}
      >
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
          onClick={() => {
            if (sentByYou || isLoading) return;

            handleDownload({
              type: message.attachment?.type,
              fileName: message.content,
            });
          }}
        >
          {isLoading ? (
            Math.floor(percentage) + '%'
          ) : sentByYou ? (
            <FaCheck className="text-3xl text-success" />
          ) : (
            <IoMdDownload className="text-3xl text-white" />
          )}
        </div>
        <p className="text-2xl max-w-80 md:max-w-xl truncate">
          {message.content}
        </p>
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

export default DocumentBubble