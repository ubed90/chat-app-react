/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient } from '@tanstack/react-query';
import { IMessage } from '../models/message.model';
import { IChat } from '../models/chat.model';
import { Store } from '@reduxjs/toolkit';
import { RootState } from '../Store';
import {
  addMessage,
  deleteNotification,
  setNotification,
  setSelectedChat,
} from '../features/chat';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MutableRefObject } from 'react';

type CallbackProps = {
  queryClient: QueryClient;
  store: Store<RootState, any>;
  notificationRef?: MutableRefObject<HTMLAudioElement | null>;
};

const onNewMessage =
  ({ store, notificationRef, queryClient }: CallbackProps) =>
  ({ newMessage, chat }: { newMessage: IMessage; chat: IChat }) => {
    const id = store.getState().chat.selectedChat?._id;

    if (id && id === newMessage.chat) {
      // ! Since we are moving from RTK Query to Redux this is not required.
      // queryClient.setQueryData(['chat', id], (oldMessages: IMessage[]) => {
      //   const newMessages = [newMessage, ...oldMessages];
      //   return newMessages;
      // });
      store.dispatch(addMessage({ message: newMessage }));

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

      let existingNotification: any;

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

      existingNotification = {
        ...existingNotification,
        ...(chat.isGroupChat ? { isGroupChat: true, chatName: chat.name } : {}),
      };

      // ! I guess we dont require this coz we are anyhow Refetching the latest messages on CLick
      // queryClient.setQueryData(
      //   ['chat', newMessage.chat],
      //   (oldMessages: IMessage[] | undefined) => {
      //     let newMessages = [newMessage];
      //     if (oldMessages) {
      //       newMessages = [...newMessages, ...oldMessages];
      //     }
      //     return newMessages;
      //   }
      // );

      queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
        let newChats: IChat[] = structuredClone(chats);

        const chat = newChats.find((chat) => chat._id === newMessage.chat);

        if (!chat) return newChats;

        chat['lastMessage'] = newMessage;

        chat.notify = `${existingNotification.value.length}`;

        newChats = [chat, ...newChats.filter((ch) => ch._id !== chat._id)];

        return newChats;
      });

      store.dispatch(
        setNotification({
          key: newMessage.chat,
          value: existingNotification as any,
        })
      );
    }

    notificationRef?.current?.play();
  };

const onNewChat =
  ({ queryClient, store, notificationRef }: CallbackProps) => (chat: IChat) => {
    queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
      let newChats: IChat[] = structuredClone(chats);

      chat.notify = 'new';

      newChats = [chat, ...newChats];

      return newChats;
    });

    const notification = {
      action: 'NEW_CHAT',
      value:
        chat.admin.name +
        (chat.isGroupChat
          ? ` added you in ${chat.name}`
          : ' added you as a friend'),
      ...(chat.isGroupChat ? { isGroupChat: true, chatName: chat.name } : {}),
    };

    store.dispatch(
      setNotification({
        key: chat._id as string,
        value: notification as any,
      })
    );

    notificationRef?.current?.play();
  };

const onDeleteChat =
  (
    queryClient: QueryClient,
    store: Store<RootState, any>,
    navigate: NavigateFunction
  ) =>
  ({ deletedChat, name }: { deletedChat: IChat; name: string }) => {
    const selectedChatId = store.getState().chat.selectedChat?._id;
    const notificationExists =
      store.getState()?.chat?.notification?.[deletedChat._id as string];

    if (selectedChatId === deletedChat._id) {
      navigate('/chats');
      store.dispatch(setSelectedChat(undefined));
      queryClient.invalidateQueries(
        { queryKey: ['chat', deletedChat._id], exact: true },
        { cancelRefetch: true }
      );
    }

    if (notificationExists) {
      store.dispatch(deleteNotification({ key: deletedChat._id as string }));
    }

    queryClient.setQueryData(['all-chats'], (chats: IChat[] | undefined) => {
      const allChats = structuredClone(chats)?.filter(
        (chat) => chat._id !== deletedChat._id
      );

      return allChats;
    });

    toast.error(
      name +
        (deletedChat.isGroupChat
          ? ` deleted the group ${deletedChat.name}`
          : ' deleted this chat just now.')
    );
  };

const onRemove =
  (
    queryClient: QueryClient,
    store: Store<RootState, any>,
    navigate: NavigateFunction,
  ) =>
  (chat: IChat) => {
    const selectedChatId = store.getState().chat.selectedChat?._id;
    const notificationExists =
      store.getState()?.chat?.notification?.[chat._id as string];

    if (selectedChatId === chat._id) {
      navigate('/chats');
      store.dispatch(setSelectedChat(undefined));
      queryClient.invalidateQueries(
        { queryKey: ['chat', chat._id], exact: true },
        { cancelRefetch: true }
      );
    }

    if (notificationExists) {
      store.dispatch(deleteNotification({ key: chat._id as string }));
    }

    queryClient.setQueryData(['all-chats'], (chats: IChat[] | undefined) => {
      const allChats = structuredClone(chats)?.filter(
        (chat) => chat._id !== chat._id
      );

      return allChats;
    });

    toast.error(chat.admin.name + ' removed you from ' + chat.name);
  };

const onGroupRename =
  (queryClient: QueryClient, store: Store<RootState, any>) =>
  ({ chatId, name }: { chatId: string; name: string }) => {
    console.log("ON GROUP RENAME", chatId, name);
    
    const id = store.getState().chat.selectedChat?._id;

    queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
      const newChats: IChat[] = structuredClone(chats);

      const chat = newChats.find((chat) => chat._id === chatId);

      if (!chat) return newChats;

      toast.dark(chat.admin.name + ' renamed ' + `"${chat.name}" to "${name}"` )

      chat['name'] = name;


      if(id === chatId) {
        store.dispatch(setSelectedChat(chat));
      }

      return newChats;
    });
  };

export { onNewMessage, onNewChat, onDeleteChat, onRemove, onGroupRename };
