import { IoMdArrowRoundBack } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import { getOtherUserDetails } from '../../utils/getOtherUser';
import { CiMenuKebab } from 'react-icons/ci';
import './ChatHeader.scss';
import { useNavigate } from 'react-router-dom';
import { setSelectedChat } from '../../features/chat';
import React from 'react';
import ProfilePicture from '../ProfilePicture';
import { BiExit } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import { CustomBtn } from '..';
import { FaPhone, FaVideo } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';
import { useChatsContext } from '../../Context/ChatsContext';
import { usePeer } from '../../Context/PeerContext';
import { useSocket } from '../../Context/SocketContext';
import { CALL_INITIATED } from '../../utils/EventsMap';
import askRequiredPermission from '../../utils/askCameraPermission';
import ChatDetails from '../ChatDetails';

let ChatHeader: React.FC<{ isUserOnline: boolean }> = ({ isUserOnline }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const otherUser = getOtherUserDetails(user!, selectedChat!.users);

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
    handleIsGroupCall
  } = usePeer();

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
    if (!selectedChat?.isGroupChat) {
      if (!isUserOnline) return toast.error(otherUser.name + ' is not online');
    }

    // * Get Media Permissions
    let mediaStream: MediaStream;
    try {
      mediaStream = await askRequiredPermission(true);
      handleStream(mediaStream);
      // * Min required Entities for Caller to start the stream
      handleVideoCall(true);
    } catch (error) {
      return toast.error('Please allow audio and video permission.');
    }

    // * CHeck If User online in BackEnd MAP
    try {
      console.log('CHECK IF USER IS ONLINE IN BE:: ');

      let isReceiverOnline = await socket?.emitWithAck(CALL_INITIATED, {
        caller: user,
        receiver: selectedChat?.isGroupChat
          ? selectedChat.users.filter(otherUser => otherUser._id !== user?._id).map((user) => user._id)
          : [otherUser._id],
        roomId: selectedChat?._id,
        callType: 'Video',
        ...(selectedChat?.isGroupChat ? { groupName: selectedChat.name }: {}),
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
        return toast.error(
          selectedChat?.isGroupChat
            ? 'None of the group members are online'
            : otherUser.name + ' is not online'
        );
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
    handlePeer();

    // * Required Entities for Caller
    handleIsCaller(true);
    handleCaller({
      caller: user!,
      roomId: selectedChat?._id as string,
      callType: 'Video',
      ...(selectedChat?.isGroupChat ? { groupName: selectedChat.name } : {})
    });
    handleReceiver(otherUser);
    if(selectedChat?.isGroupChat) {
      handleIsGroupCall(true);
    }
  };

  // * Video Call
  const onAudioCall = async () => {
    // * Check IF User online Locally
    if (!selectedChat?.isGroupChat) {
      if (!isUserOnline) return toast.error(otherUser.name + ' is not online');
    }

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
        receiver: selectedChat?.isGroupChat
          ? selectedChat.users
              .filter((otherUser) => otherUser._id !== user?._id)
              .map((user) => user._id)
          : [otherUser._id],
        roomId: selectedChat?._id,
        callType: 'Audio',
        ...(selectedChat?.isGroupChat ? { groupName: selectedChat.name } : {}),
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
        return toast.error(
          selectedChat?.isGroupChat
            ? 'None of the group members are online'
            : otherUser.name + ' is not online'
        );
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
    handlePeer();

    // * Required Entities for Caller
    handleIsCaller(true);
    handleCaller({
      caller: user!,
      roomId: selectedChat?._id as string,
      callType: 'Audio',
      ...(selectedChat?.isGroupChat ? { groupName: selectedChat.name } : {}),
    });
    handleReceiver(otherUser);
    if (selectedChat?.isGroupChat) {
      handleIsGroupCall(true);
    }
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
        icon={<FaPhone className="text-3xl text-accent" />}
        clickHandler={onAudioCall}
        classes="ml-auto mr-3 btn-lg bg-transparent border-none outline-none shadow-none hover:bg-gray-400 rounded-lg px-4 h-[3rem] min-h-[3rem]"
      />
      <CustomBtn
        icon={<FaVideo className="text-3xl text-accent" />}
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
            <ChatDetails />
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

ChatHeader = React.memo(ChatHeader);

export default ChatHeader;
