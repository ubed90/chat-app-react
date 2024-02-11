/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient } from '@tanstack/react-query';
import { IMessage } from '../models/message.model';
import { IChat } from '../models/chat.model';
import { Store } from '@reduxjs/toolkit';
import { RootState } from '../Store';
import { setNotification } from '../features/chat';

const onNewMessage =
  (queryClient: QueryClient, store: Store<RootState, any>) =>
  (newMessage: IMessage) => {
    const id = store.getState().chat.selectedChat?._id;

    if (id && id === newMessage.chat) {
      queryClient.setQueryData(['chat', id], (oldMessages: IMessage[]) => {
        const newMessages = [newMessage, ...oldMessages];
        return newMessages;
      });
      queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
        const newChats: IChat[] = structuredClone(chats);

        const chat = newChats.find((chat) => chat._id === newMessage.chat);

        if (!chat) return newChats;

        chat['lastMessage'] = newMessage;

        return newChats;
      });
    } else {
      console.log('Notify 📢');
      // * Notification Logic
      const notification = store.getState().chat?.notification;

      let existingNotification;

      console.log(notification, existingNotification);

      if (notification && notification[newMessage.chat]) {
        existingNotification = structuredClone(notification[newMessage.chat]);

        // Append Logic
        if (
          existingNotification?.action === 'NEW_MESSAGE' &&
          Array.isArray(existingNotification.value) &&
          existingNotification.value.length > 0
        ) {
          existingNotification.value = [
            newMessage,
            ...existingNotification.value,
          ];
        } else if (existingNotification?.action === 'NEW_CHAT') {
          existingNotification!.action = 'NEW_MESSAGE';
          existingNotification.value = [newMessage];
        }

      } else {
        existingNotification = {
          action: 'NEW_MESSAGE',
          value: [newMessage],
        };
      }

      queryClient.setQueryData(['chat', newMessage.chat], (oldMessages: IMessage[] | undefined) => {
        let newMessages = [newMessage];
        if(oldMessages) {
          newMessages = [...newMessages, ...oldMessages]
        }
        return newMessages;
      });
      queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
        let newChats: IChat[] = structuredClone(chats);

        const chat = newChats.find((chat) => chat._id === newMessage.chat);

        if (!chat) return newChats;

        chat['lastMessage'] = newMessage;

        chat.notify = `${existingNotification.value.length}`;

        newChats = [chat, ...newChats.filter(ch => ch._id !== chat._id)]

        return newChats;
      });

      console.log(existingNotification);

      store.dispatch(
        setNotification({
          key: newMessage.chat,
          value: existingNotification as any,
        })
      );
    }
  };

const onNewChat =
  (queryClient: QueryClient, store: Store<RootState, any>) =>
  (chat: IChat) => {
    queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
      let newChats: IChat[] = structuredClone(chats);

      chat.notify = 'new';

      newChats = [chat, ...newChats]

      return newChats;
    });

    const notification = {
      action: "NEW_CHAT",
      value: chat.admin.name + ' added you as a friend'
    }

    store.dispatch(setNotification({
      key: chat._id as string,
      value: notification as any
    }))
  };

export { onNewMessage, onNewChat };
