import React, { useEffect, useState } from 'react';
import { IMessage, INewMessageResponse } from '../models/message.model';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import customFetch from '../utils/customFetch';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';
import { toast } from 'react-toastify';
import axios from 'axios';

type FileUploaderProps = {
  messageId: string;
  children: (props: {
    isLoading: boolean;
    percentage: number;
    handleDownload: (props: { type: string | undefined, fileName: string }) => void;
  }) => JSX.Element;
  file?: File | string | Buffer;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  messageId,
  children,
  file,
}) => {
  // * Selected Chat
  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChat?._id
  );

  const [isLoading, setIsLoading] = useState(false);

  // * Upload Percentage
  const [percentage, setPercentage] = useState<number>(0);

  // * Mutation to Upload Attachment
  const { mutate: uploadAttachment } = useMutation({
    mutationKey: ['send-attachment', selectedChatId],
    mutationFn: (formData: FormData) =>
      customFetch.post<INewMessageResponse>(
        `/message/attachment/${selectedChatId}`,
        formData,
        {
          onUploadProgress(progressEvent) {
            setIsLoading(true);
            if (progressEvent.progress && progressEvent.progress > 0) {
              const uploadPercentage =
                (progressEvent.progress * 100).toFixed(2);
                console.log(uploadPercentage);
                setPercentage(+uploadPercentage)
            }
          },
        }
      ),
  });

  // * Function to Download the Attachment
  const handleDownload = async ({type, fileName}: { type?: string, fileName: string }) => {
    if (!file || file instanceof File || !type) return;

    setIsLoading(true)

    if (type === 'IMAGE' || type === 'VIDEO') {
      const { data } = await axios.get(file as string, {
        responseType: 'blob',
        onDownloadProgress(progressEvent) {
          if (progressEvent.progress && progressEvent.progress > 0) {
            const uploadPercentage = progressEvent.progress * 100;
            setPercentage(uploadPercentage);
            
            if(uploadPercentage === 100) {
              setIsLoading(false)
            }
          }
        },
      });

      const downloadLink = URL.createObjectURL(data);
      const downloadButton = document.createElement('a');
      
      downloadButton.href = downloadLink;
      downloadButton.download = fileName;

      const handleOnDownload = () => {
        setTimeout(() => {
          URL.revokeObjectURL(downloadLink);
          downloadButton.removeEventListener('click', handleOnDownload);
        }, 100);
      }

      downloadButton.addEventListener('click', handleOnDownload, false);

      downloadButton.click();
    } else if (type === 'PDF') {
      const downloadLink = `data:application/pdf;base64,${file}`;
      const downloadButton = document.createElement('a');

      downloadButton.href = downloadLink;
      downloadButton.download = fileName;

      downloadButton.click();
    }

    // * Buffer / PDF
    // Handle That
  };

  //   * Local Client
  const queryClient = useQueryClient();

  // * TO invoke Upload Dynamically whenever File Changes and Type is Upload
  useEffect(() => {
    if (!file || !(file instanceof File)) return;

    const formData = new FormData();
    formData.append('attachments', file);

    // Send The Request to Server
    uploadAttachment(formData, {
      onSuccess({ data }) {
        queryClient.setQueryData(
          ['chat', selectedChatId],
          (oldMessages: IMessage[]) => {
            const allMessages = structuredClone(oldMessages);

            const message = allMessages.find((mes) => mes._id === messageId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            if(message) {
              message._id = data.newMessage._id
              message.chat = data.newMessage.chat
              message.content = data.newMessage.content
              message.sender = data.newMessage.sender
              message.isNotification = data.newMessage.isNotification
              message.isAttachment = data.newMessage.isAttachment
              message.attachment = data.newMessage.attachment
              message.createdAt = data.newMessage.createdAt
            }
            
            return allMessages;
          }
        );
        setIsLoading(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError(error: any) {
        setIsLoading(false);
        toast.error(error?.response?.data?.message || error.message);

        queryClient.setQueryData(
          ['chat', selectedChatId],
          (oldMessages: IMessage[]) => {
            const allMessages = structuredClone(oldMessages).filter(
              (message) => message._id !== messageId
            );

            return allMessages;
          }
        );
      },
    });
  }, [file, messageId, queryClient, selectedChatId, uploadAttachment]);

  return children({ isLoading, percentage, handleDownload });
};

export default FileUploader;
