/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import dayjs from 'dayjs';
import FileUploader from '../FileUploader';
import { IMessage } from '../../models/message.model';
import { IoMdDownload } from 'react-icons/io';

const UploadBubble: React.FC<IMessage> = (message) => {
  const user = useSelector((state: RootState) => state.user.user);

  const [file] = useState<File | string | Buffer | undefined>(
    message.attachment?.file ||
      message.attachment?.url ||
      message.attachment?.content
  );

  return (
    <FileUploader messageId={message._id as string} file={file}>
      {({ isLoading, percentage, handleDownload }) => {
        return (
          <div
            className="chat chat-end"
            onClick={() =>
              handleDownload({
                type: message.attachment?.type,
                fileName: message.content,
              })
            }
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
                <div className="avatar placeholder ring-1 ring-primary ring-opacity-50">
                  <div className="bg-neutral text-neutral-content rounded-full w-10">
                    <span className="text-xl uppercase">
                      {user?.name.substring(0, 2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-header capitalize text-lg font-bold text-primary">
              {user?.name}
            </div>
            <div className="chat-bubble p-4 upload-bubble rounded-xl text-2xl text-justify flex items-center gap-4">
              <div
                className={`radial-progress text-success text-base font-bold cursor-pointer ${
                  isLoading ? '' : 'text-white'
                }`}
                style={{
                  // @ts-expect-error
                  // TS giving error here on custom property;
                  '--value': isLoading ? percentage : 100,
                  '--size': '3.5rem',
                  '--thickness': '2px',
                }}
                role="progressbar"
              >
                {isLoading ? (
                  Math.floor(percentage) + '%'
                ) : (
                  <IoMdDownload className="text-3xl text-white" />
                )}
              </div>
              <p className="text-2xl">{message.content}</p>
            </div>
            <div className="chat-footer">
              <time className="text-sm">{dayjs().format('hh:mm a')}</time>
            </div>
          </div>
        );
      }}
    </FileUploader>
  );
};

export default UploadBubble;
