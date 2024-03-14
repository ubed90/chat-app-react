import React, { useCallback, useMemo, useState } from 'react'
import EditGroupName from './Group/EditGroupName';
import AddUserToGroup from './Group/AddUserToGroup';
import RemoveUserFromGroup from './Group/RemoveUserFromGroup';
import ViewParticipants from './Group/ViewParticipants';
import { CgProfile } from 'react-icons/cg';
import { useSelector } from 'react-redux';
import { getOtherUserDetails } from '../utils/getOtherUser';
import { RootState } from '../Store';
import Modal from './Modal/Modal';
import ProfilePicture from './ProfilePicture';
import CustomBtn from './CustomBtn';
import { CiText } from 'react-icons/ci';
import { IoAddCircle } from 'react-icons/io5';
import { HiUserRemove } from 'react-icons/hi';
import { FaRegEye } from 'react-icons/fa';

type CTA_STATE = 'EDIT' | 'ADD' | 'REMOVE' | 'VIEW' | null;

let ChatDetails: React.FC = () => {
  console.log("RE RENDERED");
  
    const user = useSelector((state: RootState) => state.user.user);
    const { selectedChat } = useSelector((state: RootState) => state.chat);
    const otherUser = getOtherUserDetails(user!, selectedChat!.users);

  // * Profile Modal
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  // * CTA State
  const [ctaState, setCtaState] = useState<CTA_STATE>(null);

  const handleCtaToggle = (state: CTA_STATE) => setCtaState(state);

  // * On SuccessFull Name Change
  const onSuccess = useCallback(() => {
    handleCtaToggle(null);
    handleToggle();
  }, [handleToggle]);

  const CTA = useMemo(() => ({
    EDIT: <EditGroupName onSuccess={onSuccess} />,
    ADD: <AddUserToGroup onSuccess={onSuccess} />,
    REMOVE: <RemoveUserFromGroup onSuccess={onSuccess} />,
    VIEW: <ViewParticipants />,
  }), [onSuccess])

  return (
    <React.Fragment>
      <button
        onClick={handleToggle}
        className="btn btn-ghost content-center rounded-xl text-xl text-white gap-3"
      >
        <CgProfile className="text-3xl" />
        {selectedChat?.isGroupChat ? 'View Group Details' : 'View Profile'}
      </button>

      <Modal id="profile-modal" isOpen={isOpen} onClose={handleToggle}>
        <Modal.Header onClose={handleToggle}>
          {selectedChat?.isGroupChat ? selectedChat.name : otherUser.name}
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
                        handleCtaToggle(ctaState === 'EDIT' ? null : 'EDIT')
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
                        handleCtaToggle(ctaState === 'ADD' ? null : 'ADD')
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
                        handleCtaToggle(ctaState === 'REMOVE' ? null : 'REMOVE')
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
                <div className="profile-modal-action">{CTA[ctaState]}</div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

ChatDetails = React.memo(ChatDetails);

export default ChatDetails