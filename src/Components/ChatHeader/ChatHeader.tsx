import { IoMdArrowRoundBack } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import { getOtherUserDetails } from '../../utils/getOtherUser';
import { CiMenuKebab } from 'react-icons/ci';
import './ChatHeader.scss';
import { useNavigate } from 'react-router-dom';
import { setSelectedChat } from '../../features/chat';

const ChatHeader = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const otherUser = getOtherUserDetails(user!, selectedChat!.users);

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const handleBack = () => {
    dispatch(setSelectedChat(undefined));
    return navigate('..')
  }

  return (
    <header className="local-chat-header px-4 border-b-[1px] border-b-accent">
      <button
        onClick={handleBack}
        className="btn btn-square btn-outline rounded-xl"
      >
        <IoMdArrowRoundBack className="text-2xl" />
      </button>
      <div className="local-chat-header-info">
        {selectedChat?.isGroupChat ? (
          <div className="local-chat-profile-image avatar-group -space-x-16 rtl:space-x-reverse">
            {selectedChat?.users.slice(0, 3).map((user, index) => (
              <div
                className={`avatar ${
                  user?.profilePicture ? '' : 'placeholder'
                }`}
                key={index}
              >
                <div className="w-16 bg-neutral text-neutral-content">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} />
                  ) : (
                    <span className="uppercase">
                      {user.name.substring(0, 2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {selectedChat?.users.length > 3 && (
              <div className="avatar placeholder">
                <div className="w-16 bg-neutral text-neutral-content rounded-full">
                  <span className="text-xl">+{selectedChat?.users.length - 3}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="local-chat-profile-image avatar placeholder">
            <div className="w-16 rounded-full bg-neutral text-neutral-content">
              <span className="text-2xl uppercase">
                {getOtherUserDetails(user!, selectedChat!.users).name.substring(0, 2)}
              </span>
            </div>
          </div>
        )}
        <h4 className="local-chat-header-info-name text-2xl font-bold text-accent">
          {selectedChat?.isGroupChat ? selectedChat.name : otherUser.name}
        </h4>
        <p className="local-chat-header-info-status text-base">Online</p>
      </div>
      <button className="btn btn-ghost rounded-xl btn-lg px-0 ml-auto">
        <CiMenuKebab className="text-4xl" />
      </button>
    </header>
  );
};

export default ChatHeader;
