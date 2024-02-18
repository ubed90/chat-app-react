import { IUserData } from "./user.model";

export type IMessage = {
  _id?: string;
  content: string;
  chat: string;
  sender: IUserData;
  isNotification: boolean;
  isAttachment: boolean;
  attachment?: {
    type: "IMAGE" | "PDF",
    url?: string,
    content?: Buffer;
    file?: File;
  }
  createdAt?: string;
};

export type IMessageResponse = {
  status: string,
  message: string,
  messages: IMessage[]
}

export type INewMessageResponse = {
  status: string;
  message: string;
  newMessage: IMessage;
};