import { IMessage } from "./message.model";
import { IUserData } from "./user.model";

export type IChat = {
  _id?: string;
  name: string;
  isGroupChat: boolean;
  users: IUserData[];
  admin: IUserData;
  lastMessage: IMessage;
  notify?: string;
}

export type IChatResponse = { status: string; message: string; chats: IChat[] };

export type IChatCreation = {
  status: string;
  message: string;
  chat: IChat;
};