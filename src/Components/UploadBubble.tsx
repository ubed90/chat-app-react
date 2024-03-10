/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';
import FileUploader from './FileUploader';
import { IMessage, IMessageTypes } from '../models/message.model';
import ImageBubble from './ImageBubble';
import AudioBubble from './AudioBubble';
import VideoBubble from './VideoBubble';
import DocumentBubble from './DocumentBubble';

const getCorrespondingComponent = (type: IMessageTypes) => {
  switch (type) {
    case 'IMAGE':
      return ImageBubble;

    case 'VIDEO':
      return VideoBubble;

    case 'AUDIO':
      return AudioBubble;

    case 'PDF':
      return DocumentBubble
  
    default:
      return DocumentBubble;
  }
}

const UploadBubble: React.FC<IMessage & { isInRoom: boolean }> = (message) => {
  const user = useSelector((state: RootState) => state.user.user);

  const [file] = useState<File | string | Buffer | undefined>(
    message.attachment?.file ||
      message.attachment?.url ||
      message.attachment?.content
  );

  return (
    <FileUploader isInRoom={message.isInRoom} messageId={message._id as string} file={file}>
      {({ isLoading, percentage, handleDownload }) => {
        const Component = getCorrespondingComponent(message.attachment!.type)

        return (
          <Component
            isLoading={isLoading}
            percentage={percentage}
            handleDownload={handleDownload}
            message={message}
            user={user}
            key={message._id}
            sentByYou={user?._id === message.sender._id}
          />
        );
      }}
    </FileUploader>
  );
};

export default UploadBubble;
