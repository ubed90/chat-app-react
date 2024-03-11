import { IUserData } from "./user.model";

export type IMessageTypes = "IMAGE" | "VIDEO" | "PDF" | "AUDIO";

export type MESSAGE_STATUS = 'SENT' | 'DELIVERED' | 'READ' | 'LOADING';

export type IMessage = {
  _id?: string;
  content: string;
  chat: string;
  sender: IUserData;
  isNotification: boolean;
  isAttachment: boolean;
  status: MESSAGE_STATUS;
  attachment?: {
    type: IMessageTypes,
    url?: string,
    content?: Buffer;
    file?: File;
  }
  createdAt?: string;
};

export type IMessageResponse = {
  status: string,
  message: string,
  messages: IMessage[],
  isOnline: boolean;
}

export type INewMessageResponse = {
  status: string;
  message: string;
  newMessage: IMessage;
};