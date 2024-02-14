import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { IChat } from "../../models/chat.model"
import { IMessage } from "../../models/message.model";

type NotificationAction = 'NEW_CHAT' | 'NEW_MESSAGE'

export type NotificationData = {
  action: NotificationAction;
  value: string | IMessage[];
  isGroupChat?: boolean;
  chatName?: string;
};

type Chat = {
  selectedChat: IChat | undefined;
  notification:{
        [key: string]: NotificationData;
      }
    | undefined;
};

const initialState: Chat = {
    selectedChat: undefined,
    notification: undefined,
}

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
  },
});

export const { setSelectedChat, setNotification, deleteNotification } = chatSlice.actions;

export default chatSlice.reducer;