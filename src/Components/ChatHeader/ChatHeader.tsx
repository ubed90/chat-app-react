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
import { FaPhone, FaRegEye, FaVideo } from 'react-icons/fa';
import { CiText } from 'react-icons/ci';
import EditGroupName from '../Group/EditGroupName';
import ViewParticipants from '../Group/ViewParticipants';
import RemoveUserFromGroup from '../Group/RemoveUserFromGroup';
import AddUserToGroup from '../Group/AddUserToGroup';
import { useMutation } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';
import { useChatsContext } from '../../Context/ChatsContext';
import { usePeer } from '../../Context/PeerContext';
import { useSocket } from '../../Context/SocketContext';
import { CALL_INITIATED } from '../../utils/EventsMap';
import askRequiredPermission from '../../utils/askCameraPermission';

type CTA_STATE = 'EDIT' | 'ADD' | 'REMOVE' | 'VIEW' | null;

const ChatHeader: React.FC<{ isUserOnline: boolean }> = ({ isUserOnline }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const otherUser = getOtherUserDetails(user!, selectedChat!.users);

  // * Profile Modal
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const { socket } = useSocket();

  // * For Video And Audio Call
  const {
    handleVideoCall,
    handleAudioCall,
    handleReceiver,
    handleIsCaller,
    handlePeer,
    handleCaller,
    handleStream,
  } = usePeer();

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
    ADD: <AddUserToGroup onSuccess={onSuccess} />,
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
    mutationFn: (chatId: string) =>
      customFetch.delete<{ status: string; message: string }>('/chats', {
        data: { chatId },
      }),
  });

  // * Mutation For Deleting Group Chat
  const { mutate: deleteGroupChat, isPending: isGroupChatDeleting } =
    useMutation({
      mutationKey: ['delete-group-chat'],
      mutationFn: (groupId: string) =>
        customFetch.delete<{ status: string; message: string }>(
          '/chats/group/delete',
          {
            data: { groupId },
          }
        ),
    });

  // * Mutation for Leaving Group
  const { mutate: leaveGroup, isPending: isLeavingGroup } = useMutation({
    mutationKey: ['leave-group'],
    mutationFn: (chatId: string) =>
      customFetch.delete<{ status: string; message: string }>('/chats/group', {
        data: { chatId },
      }),
  });

  // * Refetch for fetching chats again after Exit / Delete
  const { fetchChats } = useChatsContext();

  // * Handle Exit
  const handleExit = () => {
    if (!confirm(`Are you sure you want to Leave this group ?`)) return;
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
  };

  // * Handle / Delete Group / Chat
  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete this chat ?`)) return;

    if (selectedChat?.isGroupChat) {
      deleteGroupChat(selectedChat?._id as string, {
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
          if (data.status !== 'success') {
            toast.error(data.message);
            return;
          }

          dispatch(setSelectedChat(undefined));
          navigate('/chats');
          fetchChats && fetchChats();
          toast.success(data.message + '🚀');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError(error: any) {
          toast.error(error?.response?.data?.message || error.message);
        },
      });
    }
  };

  // * Video Call
  const onVideoCall = async () => {
    // * Check IF User online Locally
    if (!isUserOnline) return toast.error(otherUser.name + ' is not online');

    // * Get Media Permissions
    let mediaStream: MediaStream;
    try {
      mediaStream = await askRequiredPermission(true);
      handleStream(mediaStream);
      // * Min required Entities for Caller to start the stream
      handleVideoCall(true);
    } catch (error) {
      console.log(error);
      return toast.error('Please allow audio and video permission.');
    }

    // * CHeck If User online in BackEnd MAP
    try {
      console.log('CHECK IF USER IS ONLINE IN BE:: ');

      let isReceiverOnline = await socket?.emitWithAck(CALL_INITIATED, {
        caller: user,
        receiver: otherUser._id,
        roomId: selectedChat?._id,
        callType: 'Video',
      });
      console.log('RECEIVED ACK FROM BE :: ', isReceiverOnline);

      isReceiverOnline = Array.isArray(isReceiverOnline)
        ? isReceiverOnline[0]
        : isReceiverOnline;

      if (!isReceiverOnline) {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          handleStream(null);
        }
        handleVideoCall(false);
        return toast.error(otherUser.name + ' is not online');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        handleStream(null);
      }
      handleVideoCall(false);
      return toast.error(error);
    }

    // * Set Peer
    handlePeer(user?._id as string);

    // * Required Entities for Caller
    handleIsCaller(true);
    handleCaller({
      caller: user!,
      roomId: selectedChat?._id as string,
      callType: 'Video',
    });
    handleReceiver(otherUser);
  };

  // * Video Call
  const onAudioCall = async () => {
    // * Check IF User online Locally
    if (!isUserOnline) return toast.error(otherUser.name + ' is not online');

    // * Get Media Permissions
    let mediaStream: MediaStream;
    try {
      mediaStream = await askRequiredPermission(false);
      handleStream(mediaStream);
      // * Min required Entities for Caller to start the stream
      handleAudioCall(true);
    } catch (error) {
      console.log(error);
      return toast.error('Please allow audio permission.');
    }

    // * CHeck If User online in BackEnd MAP
    try {
      console.log('CHECK IF USER IS ONLINE IN BE:: ');

      let isReceiverOnline = await socket?.emitWithAck(CALL_INITIATED, {
        caller: user,
        receiver: otherUser._id,
        roomId: selectedChat?._id,
        callType: 'Audio',
      });
      console.log('RECEIVED ACK FROM BE :: ', isReceiverOnline);

      isReceiverOnline = Array.isArray(isReceiverOnline)
        ? isReceiverOnline[0]
        : isReceiverOnline;

      if (!isReceiverOnline) {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          handleStream(null);
        }
        handleAudioCall(false);
        return toast.error(otherUser.name + ' is not online');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        handleStream(null);
      }
      handleAudioCall(false);
      return toast.error(error);
    }

    // * Set Peer
    handlePeer(user?._id as string);

    // * Required Entities for Caller
    handleIsCaller(true);
    handleCaller({
      caller: user!,
      roomId: selectedChat?._id as string,
      callType: 'Audio',
    });
    handleReceiver(otherUser);
  };

  return (
    <header className="local-chat-header px-4 border-b-[1px] border-b-accent">
      <button
        onClick={handleBack}
        className="btn btn-square btn-outline rounded-xl"
      >
        <IoMdArrowRoundBack className="text-2xl" />
      </button>
      <div
        className={`local-chat-header-info ${isUserOnline && 'user-online'}`}
      >
        <ProfilePicture className="-space-x-16" width="w-16" />
        <h4
          title={selectedChat?.isGroupChat ? selectedChat.name : otherUser.name}
          className="local-chat-header-info-name text-2xl font-bold text-accent truncate"
        >
          {selectedChat?.isGroupChat ? selectedChat.name : otherUser.name}
        </h4>
        {isUserOnline && (
          <p className="local-chat-header-info-status text-base">Online</p>
        )}
      </div>
      <CustomBtn
        disabled={selectedChat?.isGroupChat}
        icon={
          <FaPhone
            className={`text-3xl text-accent ${
              selectedChat?.isGroupChat ? 'text-slate-600' : ''
            }`}
          />
        }
        clickHandler={onAudioCall}
        classes="ml-auto mr-3 btn-lg bg-transparent border-none outline-none shadow-none hover:bg-gray-400 rounded-lg px-4 h-[3rem] min-h-[3rem]"
      />
      <CustomBtn
        disabled={selectedChat?.isGroupChat}
        icon={
          <FaVideo
            className={`text-3xl text-accent ${
              selectedChat?.isGroupChat ? 'text-slate-600' : ''
            }`}
          />
        }
        clickHandler={onVideoCall}
        classes="btn-lg mr-3 bg-transparent border-none outline-none shadow-none hover:bg-gray-400 rounded-lg px-4 h-[3rem] min-h-[3rem] disabled:cursor-not-allowed disabled:bg-transparent"
      />
      <div className="local-chat-header-dropdown cursor-pointer relative dropdown dropdown-end dropdown-hover">
        <button role="button" className="btn btn-ghost rounded-xl btn-lg px-0">
          <CiMenuKebab className="text-4xl" />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-xl w-max mt-4 flex flex-col gap-2"
        >
          <li>
            <>
              <button
                onClick={handleToggle}
                className="btn btn-ghost content-center rounded-xl text-xl text-white gap-3"
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
          {selectedChat?.isGroupChat && (
            <>
              <li>
                <button
                  disabled={isLeavingGroup}
                  onClick={handleExit}
                  className="btn btn-ghost content-center rounded-xl text-xl text-red-400 gap-3 justify-start"
                >
                  {isLeavingGroup && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                  {!isLeavingGroup && <BiExit className="text-3xl" />}
                  {isLeavingGroup && 'Leaving...'}
                  {!isLeavingGroup && 'Exit Group'}
                </button>
              </li>
              <li>
                <button
                  disabled={
                    isGroupChatDeleting || user?._id !== selectedChat.admin._id
                  }
                  onClick={handleDelete}
                  className="btn btn-error text-white content-center rounded-xl text-xl gap-3 justify-start disabled:text-gray-500"
                >
                  {isGroupChatDeleting && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                  {!isGroupChatDeleting && <MdDelete className="text-3xl" />}
                  {isGroupChatDeleting && 'Deleting...'}
                  {!isGroupChatDeleting && 'Delete Group'}
                </button>
              </li>
            </>
          )}
          {!selectedChat?.isGroupChat && (
            <li>
              <button
                disabled={isChatDeleting}
                onClick={handleDelete}
                className="btn btn-ghost content-center rounded-xl text-xl text-red-400 gap-3 justify-start"
              >
                {isChatDeleting && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {!isChatDeleting && <MdDelete className="text-3xl" />}
                {isChatDeleting && 'Deleting...'}
                {!isChatDeleting && 'Delete Chat'}
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default ChatHeader;
