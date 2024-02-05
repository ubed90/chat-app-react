import React, { HTMLAttributes } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';
import { getOtherUserDetails } from '../utils/getOtherUser';

type ProfilePictureProps = {
    width?: string;
}

const ProfilePicture: React.FC<
  ProfilePictureProps & HTMLAttributes<HTMLDivElement>
> = ({ width = 'w-16', className, ...rest }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const otherUser = getOtherUserDetails(user!, selectedChat!.users);

  return (
    <>
      {selectedChat?.isGroupChat ? (
        <div
          {...rest}
          className={`local-chat-profile-image avatar-group ${className} rtl:space-x-reverse`}
        >
          {selectedChat?.users.slice(0, 3).map((user, index) => (
            <div
              className={`avatar ${user?.profilePicture ? '' : 'placeholder'}`}
              key={index}
            >
              <div className={`bg-neutral text-neutral-content ${width}`}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture.url} alt={user.name} />
                ) : (
                  <span className="uppercase">{user.name.substring(0, 2)}</span>
                )}
              </div>
            </div>
          ))}
          {selectedChat?.users.length > 3 && (
            <div className="avatar placeholder">
              <div
                className={`bg-neutral text-neutral-content rounded-full ${width}`}
              >
                <span className="text-xl">
                  +{selectedChat?.users.length - 3}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div {...rest} className="local-chat-profile-image avatar placeholder">
          <div className="w-16 rounded-full bg-neutral text-neutral-content">
            <span className="text-2xl uppercase">
              {otherUser.name.substring(0, 2)}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePicture;
