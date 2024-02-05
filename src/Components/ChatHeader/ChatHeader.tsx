import { IoMdArrowRoundBack } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import { getOtherUserDetails } from '../../utils/getOtherUser';
import { CiMenuKebab } from 'react-icons/ci';
import './ChatHeader.scss';
import { useNavigate } from 'react-router-dom';
import { setSelectedChat } from '../../features/chat';
import { useState } from 'react';
import Modal from '../Modal/Modal';
import ProfilePicture from '../ProfilePicture';
import { CgProfile } from 'react-icons/cg';
import { BiExit } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import { CustomBtn } from '..';
import { IoAddCircle } from 'react-icons/io5';
import { HiUserRemove } from 'react-icons/hi';
import { FaRegEye } from 'react-icons/fa';

const ChatHeader = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const otherUser = getOtherUserDetails(user!, selectedChat!.users);

  // * Profile Modal
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const handleBack = () => {
    dispatch(setSelectedChat(undefined));
    return navigate('..');
  };

  return (
    <header className="local-chat-header px-4 border-b-[1px] border-b-accent">
      <button
        onClick={handleBack}
        className="btn btn-square btn-outline rounded-xl"
      >
        <IoMdArrowRoundBack className="text-2xl" />
      </button>
      <div className="local-chat-header-info">
        <ProfilePicture className="-space-x-16" width="w-16" />
        <h4
          title={selectedChat?.isGroupChat ? selectedChat.name : otherUser.name}
          className="local-chat-header-info-name text-2xl font-bold text-accent truncate"
        >
          {selectedChat?.isGroupChat ? selectedChat.name : otherUser.name}
        </h4>
        <p className="local-chat-header-info-status text-base">Online</p>
      </div>
      <div className="local-chat-header-dropdown cursor-pointer relative ml-auto dropdown dropdown-end dropdown-hover">
        <button className="btn btn-ghost rounded-xl btn-lg px-0">
          <CiMenuKebab className="text-4xl" />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-max mt-4"
        >
          <li>
            <>
              <button
                onClick={handleToggle}
                className="btn btn-ghost content-center rounded-xl text-xl text-accent gap-3"
              >
                <CgProfile className="text-3xl" />
                {selectedChat?.isGroupChat
                  ? 'View Group Details'
                  : 'View Profile'}
              </button>

              <Modal id="profile-modal" isOpen={isOpen} onClose={handleToggle}>
                <Modal.Header onClose={handleToggle}>
                  {selectedChat?.isGroupChat
                    ? selectedChat.name
                    : otherUser.name}
                </Modal.Header>
                <Modal.Body className="pt-4 flex flex-col">
                  <div className="profile-modal-header flex justify-between items-center">
                    <ProfilePicture
                      className="-space-x-20 md:-space-x-28 flex-1"
                      width="w-24 md:w-36"
                    />
                    <div className="profile-modal-info flex flex-col flex-1">
                      {selectedChat?.isGroupChat && (
                        <p className="text-2xl md:text-3xl flex gap-2">
                          Admin :
                          <span className="text-accent underline underline-offset-2 cursor-pointer">
                            {selectedChat?.isGroupChat
                              ? '@' + selectedChat.admin.name
                              : otherUser?.username}
                          </span>
                        </p>
                      )}
                      {!selectedChat?.isGroupChat && (
                        <p className="text-xl md:text-2xl text-accent underline underline-offset-2 mt-2">
                          @{otherUser.username}
                        </p>
                      )}
                      {selectedChat?.isGroupChat && (
                        <p className="text-xl md:text-2xl mt-2">
                          Participants -{' '}
                          <span className="text-accent font-bold">
                            {selectedChat.users.length}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="profile-modal-cta grid">
                    <CustomBtn
                      type="button"
                      text="Add User"
                      classes="btn-info btn-outline rounded-md text-xl flex-row-reverse w-full"
                      icon={<IoAddCircle className="text-2xl" />}
                    />
                    <CustomBtn
                      type="button"
                      text="Remove User"
                      classes="btn-error btn-outline rounded-md text-xl flex-row-reverse w-full"
                      icon={<HiUserRemove className="text-2xl" />}
                    />
                    <CustomBtn
                      type="button"
                      text="View Participants"
                      classes="btn-accent btn-outline rounded-md text-xl flex-row-reverse w-full"
                      icon={<FaRegEye className="text-2xl" />}
                    />
                  </div>
                </Modal.Body>
              </Modal>
            </>
          </li>
          <li>
            <button className="btn btn-ghost content-center rounded-xl text-xl text-red-400 gap-3 justify-start">
              {selectedChat?.isGroupChat ? (
                <BiExit className="text-3xl" />
              ) : (
                <MdDelete className="text-3xl" />
              )}
              {selectedChat?.isGroupChat ? 'Exit Group' : 'Delete Chat'}
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default ChatHeader;
