import React, { useEffect, useState } from 'react';
import { INewMessageResponse } from '../models/message.model';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import customFetch from '../utils/customFetch';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../Store';
import { toast } from 'react-toastify';
import axios from 'axios';
import { deleteMessage, editMessage } from '../features/chat';

type FileUploaderProps = {
  messageId: string;
  children: (props: FileUploaderChildrenArgs) => JSX.Element;
  file?: File | string | Buffer;
  isInRoom: boolean;
};

export type FileUploaderChildrenArgs = {
  isLoading: boolean;
  percentage: number;
  handleDownload: (props: {
    type: string | undefined;
    fileName: string;
  }) => void;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  messageId,
  children,
  file,
  isInRoom
}) => {
  // * Selected Chat
  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChat?._id
  );

  // * Dispatch for upading message
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [isUploaded, setIsUploaded] = useState(false)

  // * Upload Percentage
  const [percentage, setPercentage] = useState<number>(0);

  // * Local State to check whether the File is uploaded or not

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
              const uploadPercentage = (progressEvent.progress * 100).toFixed(
                2
              );
              setPercentage(+uploadPercentage);
            }
          },
        }
      ),
  });

  // * Function to Download the Attachment
  const handleDownload = async ({
    type,
    fileName,
  }: {
    type?: string;
    fileName: string;
  }) => {
    if (!file || file instanceof File || !type) return;

    setIsLoading(true);

    if (type === 'IMAGE' || type === 'VIDEO') {
      const { data } = await axios.get(file as string, {
        responseType: 'blob',
        onDownloadProgress(progressEvent) {
          if (progressEvent.progress && progressEvent.progress > 0) {
            const downloadPercentage = progressEvent.progress * 100;
            setPercentage(downloadPercentage);

            if (downloadPercentage === 100) {
              setIsLoading(false);
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
      };

      downloadButton.addEventListener('click', handleOnDownload, false);

      downloadButton.click();
    } else if (type === 'PDF') {
      const downloadLink = `data:application/pdf;base64,${file}`;
      const downloadButton = document.createElement('a');

      downloadButton.href = downloadLink;
      downloadButton.download = fileName;

      downloadButton.click();
      setIsLoading(false);
    }

    // * Buffer / PDF
    // Handle That
  };

  //   * Local Client
  const queryClient = useQueryClient();

  // * TO invoke Upload Dynamically whenever File Changes and Type is Upload
  useEffect(() => {
    if (!file || !(file instanceof File) || isLoading || isUploaded) return;    

    const formData = new FormData();
    formData.append('attachments', file);

    if(isInRoom) {
      formData.append('status', 'READ')
    }

    // Send The Request to Server
    uploadAttachment(formData, {
      onSuccess({ data }) {        
        dispatch(
          editMessage({
            id: messageId,
            message: data.newMessage,
          })
        );
        setIsLoading(false);
        setIsUploaded(true);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError(error: any) {
        setIsLoading(false);
        setIsUploaded(false)
        toast.error(error?.response?.data?.message || error.message);

        setIsLoading(false);
        dispatch(deleteMessage({ id: messageId }))
      },
    });
  }, [dispatch, file, isInRoom, isLoading, isUploaded, messageId, queryClient, selectedChatId, uploadAttachment]);

  return children({ isLoading, percentage, handleDownload });
};

export default FileUploader;
