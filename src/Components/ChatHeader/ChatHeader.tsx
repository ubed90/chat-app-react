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
import { CiText } from 'react-icons/ci';
import EditGroupName from '../Group/EditGroupName';
import ViewParticipants from '../Group/ViewParticipants';
import RemoveUserFromGroup from '../Group/RemoveUserFromGroup';
import AddUserToGroup from '../Group/AddUserToGroup';
import { useMutation } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';
import { useChatsContext } from '../../Pages/ChatsContainer/ChatsContext';

type CTA_STATE = 'EDIT' | 'ADD' | 'REMOVE' | 'VIEW' | null;

const ChatHeader = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const otherUser = getOtherUserDetails(user!, selectedChat!.users);

  // * Profile Modal
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  // * CTA State
  const [ctaState, setCtaState] = useState<CTA_STATE>(null);

  const handleCtaToggle = (state: CTA_STATE) => setCtaState(state);

  // * On SuccessFull Name Change
  const onSuccess = () => {
    handleCtaToggle(null);
    handleToggle();
  };

  // TODO: Remove the Redundant Code Available using HOC / RP / Custom Hooks
  // TODO: Clean Up ChatHeader.tsx

  const CTA = {
    EDIT: <EditGroupName onSuccess={onSuccess} />,
    ADD: <AddUserToGroup onSuccess={onSuccess}/>,
    REMOVE: <RemoveUserFromGroup onSuccess={onSuccess} />,
    VIEW: <ViewParticipants />,
  };

  const handleBack = () => {
    dispatch(setSelectedChat(undefined));
    return navigate('..');
  };

  // * Mutation For Deleting Chat
  const { mutate: deleteChat, isPending: isChatDeleting } = useMutation({
    mutationKey: ['delete-chat'],
    mutationFn: (chatId: string) => customFetch.delete<{ status: string, message: string }>('/chats', {
      data: { chatId }
    })
  })

  // * Mutation for Leaving Group
  const { mutate: leaveGroup, isPending: isLeavingGroup } = useMutation({
    mutationKey: ['leave-group'],
    mutationFn: (chatId: string) =>
      customFetch.delete<{ status: string; message: string }>('/chats/group', {
        data: { chatId },
      }),
  });

  // * Refetch for fetching chats again after Exit / Delete
  const { fetchChats } = useChatsContext()

  // * Handle Exit / Delete Group / Chat
  const handleExit = () => {
    if(!confirm(`Are you sure you want to delete this chat ?`)) return;
    
    if(selectedChat?.isGroupChat) {
      leaveGroup(selectedChat?._id as string, {
        onSuccess({ data }) {
          if (data.status !== 'success') {
            toast.error(data.message);
            return;
          }

          dispatch(setSelectedChat(undefined));
          navigate('..');
          fetchChats && fetchChats();
          toast.success(data.message + '🚀');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError(error: any) {
          toast.error(error?.response?.data?.message || error.message);
        },
      });
    } else {
      deleteChat(selectedChat?._id as string, {
        onSuccess({ data }) {
          if(data.status !== 'success') {
            toast.error(data.message)
            return;
          }

          dispatch(setSelectedChat(undefined));
          navigate('..');
          fetchChats && fetchChats();
          toast.success(data.message + '🚀');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError(error: any) {
          toast.error(error?.response?.data?.message || error.message);
        },
      })
    }
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
        <button role="button" className="btn btn-ghost rounded-xl btn-lg px-0">
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
                <Modal.Body className="pt-4 flex flex-col gap-6">
                  <div
                    className={`profile-modal-header flex justify-center items-center gap-4 ${
                      !selectedChat?.isGroupChat && 'flex-col'
                    }`}
                  >
                    <ProfilePicture
                      className="-space-x-20 md:-space-x-28"
                      width="w-28 md:w-36"
                      placeholderSize="text-4xl md:text-6xl"
                    />
                    <div className="profile-modal-info flex flex-col">
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
                        <p className="text-2xl md:text-3xl flex gap-4 items-center">
                          Username :
                          <span className="text-accent underline underline-offset-2 cursor-pointer">
                            @{otherUser.username}
                          </span>
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
                  {selectedChat?.isGroupChat && (
                    <>
                      <div className="profile-modal-cta">
                        {selectedChat.admin._id === user?._id && (
                          <>
                            <CustomBtn
                              type="button"
                              text="Edit Group Name"
                              clickHandler={() =>
                                handleCtaToggle(
                                  ctaState === 'EDIT' ? null : 'EDIT'
                                )
                              }
                              icon={<CiText className="text-2xl" />}
                              classes={`btn-info rounded-md text-xl flex-row-reverse ${
                                ctaState === 'EDIT' ? '' : 'btn-outline'
                              }`}
                              isDisabled={selectedChat.admin._id !== user._id}
                            />
                            <CustomBtn
                              type="button"
                              clickHandler={() =>
                                handleCtaToggle(
                                  ctaState === 'ADD' ? null : 'ADD'
                                )
                              }
                              text="Add User"
                              classes={`btn-success rounded-md text-xl flex-row-reverse ${
                                ctaState === 'ADD' ? '' : 'btn-outline'
                              }`}
                              isDisabled={selectedChat.admin._id !== user._id}
                              icon={<IoAddCircle className="text-2xl" />}
                            />
                            <CustomBtn
                              type="button"
                              clickHandler={() =>
                                handleCtaToggle(
                                  ctaState === 'REMOVE' ? null : 'REMOVE'
                                )
                              }
                              text="Remove User"
                              classes={`btn-error rounded-md text-xl flex-row-reverse ${
                                ctaState === 'REMOVE' ? '' : 'btn-outline'
                              }`}
                              isDisabled={selectedChat.admin._id !== user._id}
                              icon={<HiUserRemove className="text-2xl" />}
                            />
                          </>
                        )}
                        <CustomBtn
                          type="button"
                          text="View Participants"
                          clickHandler={() =>
                            handleCtaToggle(ctaState === 'VIEW' ? null : 'VIEW')
                          }
                          classes={`btn-accent rounded-md text-xl flex-row-reverse ${
                            ctaState === 'VIEW' ? '' : 'btn-outline'
                          }`}
                          icon={<FaRegEye className="text-2xl" />}
                        />
                      </div>
                      {ctaState && (
                        <div className="profile-modal-action">
                          {CTA[ctaState]}
                        </div>
                      )}
                    </>
                  )}
                </Modal.Body>
              </Modal>
            </>
          </li>
          <li>
            <button
              disabled={isChatDeleting || isLeavingGroup}
              onClick={handleExit}
              className="btn btn-ghost content-center rounded-xl text-xl text-red-400 gap-3 justify-start"
            >
              {(isChatDeleting || isLeavingGroup) && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {!isChatDeleting &&
              !isLeavingGroup &&
              selectedChat?.isGroupChat ? (
                <BiExit className="text-3xl" />
              ) : (
                <MdDelete className="text-3xl" />
              )}
              {(isChatDeleting || isLeavingGroup) && 'Deleting...'}
              {!isChatDeleting && !isLeavingGroup && selectedChat?.isGroupChat
                ? 'Exit Group'
                : 'Delete Chat'}
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default ChatHeader;
