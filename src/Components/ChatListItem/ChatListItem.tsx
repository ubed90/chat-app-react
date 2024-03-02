import React from 'react';
import { IChat } from '../../models/chat.model';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import { getOtherUserDetails } from '../../utils/getOtherUser';
import dayjs from 'dayjs';
import './/ChatListItem.scss';
import { useNavigate } from 'react-router-dom';
import { deleteNotification, setSelectedChat } from '../../features/chat';
import { useQueryClient } from '@tanstack/react-query';

const ChatListItem: React.FC<IChat> = (chat) => {
  const { user } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);

  const otherUser = getOtherUserDetails(user!, chat.users)

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const queryClient = useQueryClient();

  const handleChatSelect = () => {
    if(chat?.notify) {
      dispatch(deleteNotification({ key: chat._id as string }));
      queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
        const newChats: IChat[] = structuredClone(chats);

        const existingChat = newChats.find(
          (prevChat) => prevChat._id === chat._id
        );

        if (!existingChat) return chats;

        existingChat.notify = undefined;

        return newChats;
      });
    }
    dispatch(setSelectedChat(chat));
    queryClient.invalidateQueries({ queryKey: ['chat', chat._id] })
    return navigate(chat._id as string, { relative: 'path' });
  };

  return (
    <li
      onClick={handleChatSelect}
      className={`local-chat p-4 border-b-[1px] border-accent border-opacity-20 cursor-pointer hover:bg-accent hover:bg-opacity-10 transition-all duration-300 ${
        selectedChat?._id === chat._id && 'bg-success bg-opacity-50'
      } ${chat.notify ? 'notify' : ''}`}
    >
      {chat.isGroupChat ? (
        <div className="local-chat-profile-image avatar-group -space-x-14 rtl:space-x-reverse">
          {chat.users.slice(0, 3).map((user, index) => (
            <div
              className={`avatar ${user?.profilePicture ? '' : 'placeholder'}`}
              key={index}
            >
              <div className="w-16 bg-neutral text-neutral-content">
                {user?.profilePicture ? (
                  <img src={user?.profilePicture?.url || user?.profilePicture} alt={user.name} />
                ) : (
                  <span className="uppercase">{user.name.substring(0, 2)}</span>
                )}
              </div>
            </div>
          ))}
          {chat.users.length > 3 && (
            <div className="avatar placeholder">
              <div className="w-16 bg-neutral text-neutral-content rounded-full">
                <span className="text-xl">+{chat.users.length - 3}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`local-chat-profile-image avatar ${
            user?.profilePicture ? '' : 'placeholder'
          }`}
        >
          <div className="w-16 rounded-full bg-neutral text-neutral-content !flex justify-center items-center">
            {otherUser?.profilePicture ? (
              <img
                src={
                  otherUser?.profilePicture?.url || otherUser?.profilePicture
                }
                className="!object-contain"
                alt={otherUser.name}
              />
            ) : (
              <span className="text-2xl uppercase">
                {otherUser.name.substring(0, 2)}
              </span>
            )}
          </div>
        </div>
      )}
      <h4
        className={`text-2xl lg:text-3xl text-accent font-bold capitalize local-chat-name truncate ${
          chat?.lastMessage ? '' : 'row-span-2'
        }`}
      >
        {chat.isGroupChat
          ? chat.name
          : getOtherUserDetails(user!, chat.users).name}
      </h4>
      {chat?.lastMessage && (
        <p className="text-lg lg:text-xl capitalize local-chat-lastmessage truncate">
          <span className="font-bold">
            {chat.lastMessage.sender._id === user?._id
              ? 'You'
              : chat.lastMessage.sender.name}
          </span>
          : {chat.lastMessage.content}
        </p>
      )}
      {chat?.notify && (
        <span
          className={`badge badge-success badge-lg rounded-full justify-self-center ${
            chat.notify === 'new' && 'row-span-2'
          }`}
        >
          {chat.notify}
        </span>
      )}
      {chat?.lastMessage && (
        <p className="text-sm local-chat-time">
          {dayjs(chat.lastMessage.createdAt).format('hh:mm a')}
        </p>
      )}
    </li>
  );
};

export default ChatListItem;
