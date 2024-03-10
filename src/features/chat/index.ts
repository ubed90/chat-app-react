import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IChat } from '../../models/chat.model';
import { IMessage } from '../../models/message.model';

type NotificationAction = 'NEW_CHAT' | 'NEW_MESSAGE';

export type NotificationData = {
  action: NotificationAction;
  value: string | IMessage[];
  isGroupChat?: boolean;
  chatName?: string;
};

type Chat = {
  selectedChat: IChat | undefined;
  notification:
    | {
        [key: string]: NotificationData;
      }
    | undefined;

  messages: { [key: string]: IMessage } | undefined;
  unreadMessages: string[] | undefined;
};

const initialState: Chat = {
  selectedChat: undefined,
  notification: undefined,
  messages: undefined,
  unreadMessages: undefined,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChat: (state, { payload }: PayloadAction<IChat | undefined>) => {
      state.selectedChat = payload;
    },
    setNotification: (
      state,
      { payload }: PayloadAction<{ key: string; value: NotificationData }>
    ) => {
      state.notification = {
        ...state.notification,
        [payload.key]: payload.value,
      };
    },
    deleteNotification: (
      state,
      { payload }: PayloadAction<{ key: string }>
    ) => {
      const notifications = { ...state.notification };

      delete notifications[payload.key];

      state.notification = notifications;
    },
    setMessages: (
      state,
      { payload }: PayloadAction<{ messages: IMessage[] }>
    ) => {
      const messages: { [key: string]: IMessage } = {};
      const unreadMessages: string[] = [];
      for (const message of payload.messages) {
        messages[message._id as string] = message;
        if (
          state.selectedChat &&
          !state.selectedChat.isGroupChat &&
          message.status !== 'READ'
        ) {
          unreadMessages.push(message._id as string);
        }
      }

      state.messages = messages;
      state.unreadMessages =
        state.selectedChat && !state.selectedChat.isGroupChat
          ? unreadMessages
          : undefined;
    },
    clearMessages: (state) => {
      state.messages = undefined;
      state.unreadMessages = undefined;
    },
    clearUnreadMessages: (state,) => {
      if (!state.messages || !state.unreadMessages) return state;

      state.unreadMessages.forEach(messageId => {
        const message = state.messages?.[messageId];
        if(!message) return;

        message.status = 'READ';
        state.messages = {
          ...state.messages,
          [messageId]: message
        }
      });

      state.unreadMessages = undefined;
    },
    editMessage: (
      state,
      { payload }: PayloadAction<{ id: string; message: IMessage }>
    ) => {
      state.messages = {
        ...state.messages,
        [payload.id]: payload.message,
      };
    },
    deleteMessage: (state, { payload }: PayloadAction<{ id: string }>) => {
      const messages = { ...state.messages };
      delete messages[payload.id];
      state.messages = messages;
    },
    addMessage: (state, { payload }: PayloadAction<{ message: IMessage }>) => {
      state.messages = {
        [payload.message._id as string]: payload.message,
        ...state.messages,
      };

      if(payload.message.status !== 'READ') {
        state.unreadMessages?.push(payload.message._id as string);
      }
    },
  },
});

export const {
  setSelectedChat,
  setNotification,
  deleteNotification,
  addMessage,
  clearMessages,
  deleteMessage,
  editMessage,
  setMessages,
  clearUnreadMessages
} = chatSlice.actions;

export default chatSlice.reducer;
