import { useEffect, useState } from 'react';
import { RootState, useAppDispatch } from '../../Store';
import { setSelectedChat } from '../../features/chat';
import { Navigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import {
  IMessage,
  IMessageResponse,
  INewMessageResponse,
} from '../../models/message.model';
import { ChatBubble, ChatFooter, ChatHeader } from '../../Components';
import { useSelector } from 'react-redux';
import './Chat.scss';
import { IChat } from '../../models/chat.model';
import { toast } from 'react-toastify';
import { MdOutlineError } from 'react-icons/md';
import { FaArrowsRotate } from 'react-icons/fa6';
import { IoChatboxEllipses } from 'react-icons/io5';
import { useSocket } from '../../Context/SocketContext';
import { JOIN_CHAT_EVENT, STOP_TYPING_EVENT, TYPING_EVENT } from '../../utils/EventsMap';

const Chat = () => {
  // * User and Selected chat to seklectively show only List or Chat as per Mobile / Desktop layout
  const { user } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const dispatch = useAppDispatch();

  // * Only use is to clean the selected chat state when component is unmounted
  const { id } = useParams();

  // * Local client instance to set new messages in cache
  const queryClient = useQueryClient();

  // * Mutation to send message
  const {
    mutate: sendMessage,
    isPending,
  } = useMutation({
    mutationKey: ['send-message', selectedChat?._id],
    mutationFn: (variables: { content: string }) =>
      customFetch.post<INewMessageResponse>(
        `/message/${selectedChat?._id}`,
        variables
      ),
  });
  
  // * Original Send Message function which are passing to our child
  const handleNewMessage = ({ content, setContent }: {
    content: string,
    setContent: React.Dispatch<React.SetStateAction<string>>
  }) => {
    sendMessage(
      {
        content,
      },
      {
        onSuccess: ({ data }) => {
          queryClient.setQueryData(
            ['chat', selectedChat?._id],
            (oldMessages: IMessage[]) => {
              const newMessages = [data.newMessage, ...oldMessages];
              return newMessages;
            }
          );
          queryClient.setQueryData(
            ['all-chats'],
            (chats: IChat[]) => {
              let newChats: IChat[] = structuredClone(chats);

              const chat = newChats.find(chat => chat._id === data.newMessage.chat)

              if(!chat) return newChats;

              chat['lastMessage'] = data.newMessage

              newChats = [chat, ...newChats.filter(ch => ch._id !== chat._id)]

              return newChats
            }
          )
          setContent('');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          console.log(error);
          return toast.error(error.response.data.message || error.message);
        },
      }
    );
  };

  // * Query to fetch data dynamically whem Single Chat is Loaded
  const {
    data: messages,
    isLoading,
    isError,
    error,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['chat', id],
    queryFn: async () => {
      const { data } = await customFetch.get<IMessageResponse>(
        '/message/' + id
      );
      return data.messages;
    },
  });

  // * Socket to join the current Chat room
  const { socket } = useSocket()

  // * Local Typing state for Instances when both the user are online, active and Typing
  const [isTyping, setIsTyping] = useState(false)

  const handleTyping = (value: boolean) => setIsTyping(value);

  // * To clean the selected Chat when the component is unmounted
  useEffect(() => {
    if(!socket) return;

    socket.on(TYPING_EVENT, () => handleTyping(true))


    socket.on(STOP_TYPING_EVENT, () => handleTyping(false));


    return () => {
      dispatch(setSelectedChat(undefined));
    };
  }, [dispatch, socket]);

  useEffect(() => {
    if(!socket) return;

    socket.emit(JOIN_CHAT_EVENT, selectedChat?._id)
  }, [selectedChat?._id, socket])

  // * We are using this hack to set the selected chat dynamically when the user does a refresh on single chat page 
  if (id && !selectedChat) {
    // * Reading chats from cache
    const data = queryClient.getQueryData([
      'all-chats',
    ]) as IChat[];
    if (data) {
      const chats = data;

      if (!chats || chats.length === 0) {
        return <Navigate to="/chats" />;
      }

      const openedChat = chats.find((chat) => chat._id === id);

      if (!openedChat) {
        toast.error(`No chat found with id: ${id}`);
        return <Navigate to="/chats" />;
      }

      // ! Set the currently opened chat page as selected chat
      dispatch(setSelectedChat(openedChat));
    }
  }

  if (isLoading) return (
    <div className="w-full h-full p-4">
      {Array.from({ length: 20 }, (_, index) => (
        <div key={index} className={`chat ${index % 2 === 0 ? 'chat-start' : 'chat-end'}`}>
          <div className="w-10 h-10 bg-secondary bg-opacity-20 chat-image avatar skeleton"></div>
          <div className="w-52 bg-secondary bg-opacity-20 chat-bubble skeleton"></div>
        </div>
      ))}
    </div>
  );

  if (isError) return (
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
    <div className="chat-body">
      <ChatHeader />
      <section
        className={`messages p-4 relative ${
          messages?.length === 0 && 'justify-center items-center'
        }`}
      >
        {messages!.length <= 0 && (
          <div className="flex flex-col items-center">
            <IoChatboxEllipses className="text-6xl text-accent opacity-30" />
            <p className="text-3xl opacity-30">No Messages Here.</p>
          </div>
        )}
        {isTyping && (
          <div
            className={`bg-primary bg-opacity-25 backdrop-blur-lg px-3 grid place-items-center rounded-full w-max ${
              messages!.length <= 0 && 'absolute bottom-2 left-4'
            }`}
          >
            <span className="loading loading-dots loading-lg text-accent"></span>
          </div>
        )}
        {messages?.map((message) => (
          <ChatBubble
            key={message._id}
            sentByYou={user?._id === message.sender._id}
            message={message}
          />
        ))}
      </section>
      <ChatFooter sendMessage={handleNewMessage} isPending={isPending} />
    </div>
  );
};

export default Chat;

// TODO: Need to implement New Message scroll to bottom Functionality