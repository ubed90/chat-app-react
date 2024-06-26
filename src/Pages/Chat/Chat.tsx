import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RootState, useAppDispatch } from '../../Store';
import {
  addMessage,
  clearMessages,
  clearUnreadMessages,
  setMessages,
  setSelectedChat,
} from '../../features/chat';
import { LoaderFunction, useParams } from 'react-router-dom';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import {
  IMessageResponse,
  INewMessageResponse,
} from '../../models/message.model';
import { ChatBubble, ChatFooter, ChatHeader } from '../../Components';
import { useSelector } from 'react-redux';
import './Chat.scss';
import { IChat, IChatCreation } from '../../models/chat.model';
import { toast } from 'react-toastify';
import { MdOutlineError } from 'react-icons/md';
import { FaArrowsRotate } from 'react-icons/fa6';
import { IoChatboxEllipses } from 'react-icons/io5';
import { useSocket } from '../../Context/SocketContext';
import {
  EXISTING_USERS_EVENT,
  JOIN_CHAT_EVENT,
  LEAVE_CHAT_EVENT,
  STOP_TYPING_EVENT,
  TYPING_EVENT,
  USER_CONNECTED,
  USER_DISCONNECTED,
} from '../../utils/EventsMap';
import UploadBubble from '../../Components/UploadBubble';
import { getOtherUserDetails } from '../../utils/getOtherUser';
import throttle from '../../utils/throttle';
import { FaArrowDown } from 'react-icons/fa';
import { Store } from '@reduxjs/toolkit';

export const ChatLoader =
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  (queryClient: QueryClient, store: Store<RootState, any>): LoaderFunction =>
  async ({ params }) => {
    const { id } = params;
    const selectedChat = store.getState().chat.selectedChat;

    if (!selectedChat) {
      const { data } = await queryClient.ensureQueryData({
        queryKey: ['current-chat', id],
        queryFn: () => customFetch.get<IChatCreation>(`/chats/${id}`),
      });

      store.dispatch(setSelectedChat(data.chat));
    }

    return null;
  };

export type CallProps = {
  isUserOnline: boolean;
};

const Chat = () => {
  // * User and Selected chat to selectively show only List or Chat as per Mobile / Desktop layout
  const { user } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);

  // * New Redux Way to Handle Messages
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = useSelector((state: RootState) => state.chat.messages);

  const numOfMessages = useMemo(
    () => Object.keys(messages || {}).length,
    [messages]
  );

  const dispatch = useAppDispatch();

  // * Only use is to clean the selected chat state when component is unmounted
  const { id } = useParams();

  // * Is User Online STate
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // * AVailable Users
  const [isInRoom, setIsInRoom] = useState<boolean>(false);

  const handleStatus = (status: boolean) => {
    setIsOnline(status);
  };

  // * Local client instance to set new messages in cache
  const queryClient = useQueryClient();

  // * Mutation to send message
  const { mutate: sendMessage, isPending } = useMutation({
    mutationKey: ['send-message', selectedChat?._id],
    mutationFn: (variables: { content: string; status?: string }) =>
      customFetch.post<INewMessageResponse>(
        `/message/${selectedChat?._id}`,
        variables
      ),
  });

  // * Original Send Message function which are passing to our child
  const handleNewMessage = ({
    content,
    setContent,
  }: {
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
  }) => {
    console.time('MESSAGE');
    sendMessage(
      {
        content,
        ...(selectedChat?.isGroupChat
          ? {}
          : isInRoom
          ? { status: 'READ' }
          : {}),
      },
      {
        onSuccess: ({ data }) => {
          dispatch(addMessage({ message: data.newMessage }));

          queryClient.setQueryData(['all-chats', user?._id], (chats: IChat[]) => {
            let newChats: IChat[] = structuredClone(chats);

            const chat = newChats.find(
              (chat) => chat._id === data.newMessage.chat
            );

            if (!chat) return newChats;

            chat['lastMessage'] = data.newMessage;

            newChats = [chat, ...newChats.filter((ch) => ch._id !== chat._id)];

            return newChats;
          });
          setContent('');
          console.timeEnd('MESSAGE');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          return toast.error(error.response.data.message || error.message);
        },
      }
    );
  };

  // * State For Fetching Old Messages
  const [page, setPage] = useState(0);
  const totalPages = useRef(0);

  const fetchMessages = async (page: number) => {
    if(page > 0) {
      messageRef.current?.scrollTo({
        top: -messageRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    const { data } = await customFetch.get<IMessageResponse>(
      `/message/${id}/${page}`
    );
    if (isOnline !== data.isOnline) {
      setIsOnline(data.isOnline);
    }
    totalPages.current = data.pages;
    dispatch(setMessages({ messages: data.messages }));
    return data.messages;
  };

  // * Query to fetch data dynamically when Single Chat is Loaded
  const {
    isLoading,
    isPending: messagesPending,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['chat', id, user?._id, page],
    queryFn: () => fetchMessages(page),
    placeholderData:
      Object.keys(messages || []).length > 0
        ? Object.values(messages || [])
        : [],
  });

  // * CHeck whether the user is at the bottom or not
  const [isAtBottom, setIsAtBottom] = useState(true);

  // * Ref for Message Box
  const messageRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(
    throttle((event: React.UIEvent<HTMLElement, UIEvent>) => {
      const scrollHeight = (event.target as HTMLElement).scrollHeight;
      const scrollTop = Math.abs((event.target as HTMLElement).scrollTop);
      const clientHeight = (event.target as HTMLElement).clientHeight;

      // * Logic for Scroll to Bottom Button
      if (scrollTop > 50) {
        setIsAtBottom(false);
      } else {
        setIsAtBottom(true);
      }

      // * Logic for Fetching old messages
      const reachedTop = scrollHeight - (scrollTop + clientHeight) <= 50;

      console.log(
        'Is Top Reached ? %o, ScrollHeight: %d, ScrollTop: %d, ClientHeight: %d',
        reachedTop,
        scrollHeight,
        scrollTop,
        clientHeight
      );

      if (reachedTop) {
        if (page < totalPages.current) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    }, 1000),
    [page]
  );

  // * Socket to join the current Chat room
  const { socket } = useSocket();

  // * Local Typing state for Instances when both the user are online, active and Typing
  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = (value: boolean) => setIsTyping(value);

  // * To clean the selected Chat when the component is unmounted
  useEffect(() => {
    return () => {
      dispatch(setSelectedChat(undefined));
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // * Mount Join CHat and Leave Chat Event
  useEffect(() => {
    if (!socket || !selectedChat?._id || !user?._id) return;

    socket.emit(JOIN_CHAT_EVENT, {
      chatId: selectedChat._id,
      userId: user._id,
    });

    return () => {
      socket.emit(LEAVE_CHAT_EVENT, {
        chatId: selectedChat?._id,
        userId: user?._id,
      });
    };
  }, [dispatch, selectedChat?._id, socket, user?._id]);

  // * Mount the Typing events
  useEffect(() => {
    if (!socket || !user || !selectedChat?._id) return;

    socket.on(TYPING_EVENT, () => handleTyping(true));

    socket.on(STOP_TYPING_EVENT, () => handleTyping(false));

    return () => {
      socket.off(TYPING_EVENT, () => handleTyping(true));

      socket.off(STOP_TYPING_EVENT, () => handleTyping(false));
    };
  }, [selectedChat?._id, socket, user]);

  // * To Check for whether other user is online or not
  useEffect(() => {
    if (!socket || selectedChat?.isGroupChat) return;

    const handleUserConnection = (userId: string) => {
      if (!user || !selectedChat?.users) return;

      const otherUser = getOtherUserDetails(user, selectedChat.users);

      if (otherUser._id === userId) {
        handleStatus(true);
      }
    };

    const handleUserDisconnection = (userId: string) => {
      if (!user || !selectedChat?.users) return;

      const otherUser = getOtherUserDetails(user, selectedChat.users);

      if (otherUser._id === userId) {
        handleStatus(false);
      }
    };

    socket.on(USER_CONNECTED, handleUserConnection);

    socket.on(USER_DISCONNECTED, handleUserDisconnection);

    return () => {
      socket.off(USER_CONNECTED, handleUserConnection);
      socket.off(USER_DISCONNECTED, handleUserDisconnection);
    };
  }, [selectedChat?.isGroupChat, selectedChat?.users, socket, user]);

  // * Set / Unset Available Users for One on One Chat
  useEffect(() => {
    if (!socket || !selectedChat?._id || !user?._id || selectedChat.isGroupChat)
      return;

    const handleJoinChatEvent = (props: { chatId: string; userId: string }) => {
      if (props.chatId !== selectedChat._id) return;

      socket.emit(EXISTING_USERS_EVENT, {
        chatId: selectedChat._id,
        userId: user._id,
        otherUser: props.userId,
      });

      setIsInRoom((prev) => {
        if (!prev) {
          dispatch(clearUnreadMessages());
          return true;
        }

        return prev;
      });
    };

    // * Handle Leave Chat Event
    const handleLeaveChatEvent = (props: {
      chatId: string;
      userId: string;
    }) => {
      if (props.chatId !== selectedChat._id) return;

      setIsInRoom(false);
    };

    // * Handle Existing Users Event
    const handleExistingUsersEvent = (props: {
      chatId: string;
      userId: string;
    }) => {
      if (props.chatId !== selectedChat._id) return;

      setIsInRoom(true);
    };

    socket.on(JOIN_CHAT_EVENT, handleJoinChatEvent);

    socket.on(LEAVE_CHAT_EVENT, handleLeaveChatEvent);

    socket.on(EXISTING_USERS_EVENT, handleExistingUsersEvent);

    return () => {
      socket.off(JOIN_CHAT_EVENT, handleJoinChatEvent);

      socket.off(LEAVE_CHAT_EVENT, handleLeaveChatEvent);

      socket.off(EXISTING_USERS_EVENT, handleExistingUsersEvent);
    };
  }, [
    dispatch,
    selectedChat?._id,
    selectedChat?.isGroupChat,
    socket,
    user?._id,
  ]);

  // * Use Effect For Scroll Events of Message Container
  useEffect(() => {
    if (isLoading || numOfMessages === 0) return;

    const messageContainer = messageRef.current;

    messageContainer?.addEventListener('scroll', handleScroll);

    return () => {
      messageContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, isLoading, numOfMessages]);

  if (isError)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="max-w-80 flex flex-col items-center gap-4">
          <MdOutlineError className="text-6xl text-accent" />
          <p className="text-2xl md:text-3xl capitalize text-center">
            {error?.message || 'Error Fetching messages'}
          </p>
          <button
            onClick={() => refetchMessages()}
            className="btn btn-accent text-xl rounded-xl text-white"
          >
            Try Again
            <FaArrowsRotate />
          </button>
        </div>
      </div>
    );

  return (
    <div className="chat-body relative overflow-hidden">
      <ChatHeader isUserOnline={isOnline} />
      <section
        ref={messageRef}
        className={`messages p-4 relative ${
          numOfMessages === 0 && 'justify-center items-center'
        }`}
      >
        {isLoading && numOfMessages === 0 && <MessagesLoader isFullPage />}
        {!isLoading &&
          !messagesPending &&
          !isFetching &&
          !isPlaceholderData &&
          numOfMessages === 0 && (
            <div className="flex flex-col items-center">
              <IoChatboxEllipses className="text-6xl text-accent opacity-30" />
              <p className="text-3xl opacity-30">No Messages Here.</p>
            </div>
          )}
        {isTyping && (
          <div
            className={`bg-primary bg-opacity-25 backdrop-blur-lg px-3 grid place-items-center rounded-full w-max ${
              numOfMessages <= 0 && 'absolute bottom-2 left-4'
            }`}
          >
            <span className="loading loading-dots loading-lg text-accent"></span>
          </div>
        )}
        {messages &&
          Object.keys(messages)?.map((messageId) => {
            const message = messages[messageId];

            return message.isAttachment ? (
              <UploadBubble
                key={messageId}
                {...message}
                isInRoom={selectedChat?.isGroupChat ? false : isInRoom}
              />
            ) : (
              <ChatBubble
                key={messageId}
                sentByYou={user?._id === message.sender._id}
                messageId={messageId}
              />
            );
          })}
        {isFetching && <MessagesLoader />}
      </section>
      <ChatFooter sendMessage={handleNewMessage} isPending={isPending} />
      {!isAtBottom && (
        <span
          onClick={() => {
            messageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="btn btn-accent btn-rounded absolute right-10 bottom-28 animate-bounce"
        >
          <FaArrowDown />
        </span>
      )}
    </div>
  );
};

export default Chat;

const MessagesLoader = ({ isFullPage = false }: { isFullPage?: boolean }) => (
  <div
    className={`${
      isFullPage ? 'w-full h-full' : ''
    } p-4 flex gap-4 flex-col items-center justify-center`}
  >
    <span className="loading loading-bars text-accent loading-lg"></span>
    <p className="text-accent text-2xl md:text-3xl">Loading your messages...</p>
  </div>
);
