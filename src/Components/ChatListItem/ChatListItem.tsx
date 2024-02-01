import React from 'react'
import { IChat } from '../../models/chat.model'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '../../Store'
import { getOtherUserDetails } from '../../utils/getOtherUser'
import dayjs from 'dayjs'
import './/ChatListItem.scss'
import { useNavigate } from 'react-router-dom'
import { setSelectedChat } from '../../features/chat'

const ChatListItem: React.FC<IChat> = (chat) => {
    const { user } = useSelector((state: RootState) => state.user);

    const navigate = useNavigate();

    const dispatch = useAppDispatch()
    
    const handleChatSelect = () => {
      dispatch(setSelectedChat(chat));
      return navigate(chat._id as string, { relative: 'path' })
    }
    

  return (
    <li
      onClick={handleChatSelect}
      className="local-chat p-4 border-b-[1px] border-accent border-opacity-20 cursor-pointer hover:bg-primary hover:bg-opacity-10 transition-all duration-300"
    >
      {chat.isGroupChat ? (
        <div className="local-chat-profile-image avatar-group -space-x-16 rtl:space-x-reverse">
          {chat.users.slice(0, 3).map((user, index) => (
            <div
              className={`avatar ${user?.profilePicture ? '' : 'placeholder'}`}
              key={index}
            >
              <div className="w-16 bg-neutral text-neutral-content">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} />
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
        <div className="local-chat-profile-image avatar placeholder">
          <div className="w-16 rounded-full bg-neutral text-neutral-content">
            <span className="text-2xl uppercase">
              {getOtherUserDetails(user!, chat.users).name.substring(0, 2)}
            </span>
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
      {chat?.lastMessage && (
        <p className="text-sm local-chat-time">
          {dayjs(chat.lastMessage.createdAt).format('hh:mm a')}
        </p>
      )}
    </li>
  );
}

export default ChatListItem