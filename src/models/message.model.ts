import { IUserData } from "./user.model";

export type IMessage = {
  _id?: string;
  content: string;
  chat: string;
  sender: IUserData;
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