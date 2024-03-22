import React from 'react';
import { PlayerProps } from '../utils/hooks/usePlayers';
import ReactPlayer from 'react-player';
import { IoMdMic } from 'react-icons/io';
import { IoMdMicOff } from 'react-icons/io';

let Player: React.FC<PlayerProps> = (props) => {
  return (
    <article
      className={`player w-full h-full relative ${
        props.isCurrentUser ? 'own-stream' : ''
      }`}
    >
      <ReactPlayer
        width="100%"
        height="100%"
        url={props.stream}
        playing={true}
        muted={props.isCurrentUser ? true : props.muted}
      />

      {!props.playing && <Fallback currentUser={props.isCurrentUser} name={props.name} />}

      {!props.isCurrentUser && (
        <span className="absolute bottom-4 right-4">
          {props.muted ? (
            <IoMdMicOff className="text-4xl text-white" />
          ) : (
            <IoMdMic className="text-4xl text-white" />
          )}
        </span>
      )}
    </article>
  );
};

Player = React.memo(Player);

export default Player;

const Fallback = React.memo(({
  currentUser,
  name,
}: {
  currentUser?: boolean;
  name?: string;
}) => (
  <div
    className={`w-full h-full ${
      currentUser ? 'bg-gray-800' : 'bg-gray-600/25'
    } grid place-items-center absolute top-0 left-0`}
  >
    {name ? (
      <div
        className={`avatar placeholder ${currentUser ? 'w-[50%]' : 'w-[30%]'}`}
      >
        <div
          className={`bg-neutral text-neutral-content rounded-full w-full h-full`}
        >
          <span className="text-6xl">{name.substring(0, 2).toUpperCase()}</span>
        </div>
      </div>
    ) : (
      <svg
        className="w-4/5"
        viewBox="0 0 24 24"
        id="user_avatar_square_outline"
        data-name="user avatar square outline"
        xmlns="http://www.w3.org/2000/svg"
        fill="#000000"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {' '}
          <rect id="Rectangle" width="24" height="24" fill="none"></rect>{' '}
          <g
            id="Rectangle_2"
            data-name="Rectangle 2"
            transform="translate(3 3)"
            fill="none"
            stroke="#000000"
            strokeMiterlimit="10"
            strokeWidth="1.5"
          >
            {' '}
            <rect width="18" height="18" rx="2" stroke="none"></rect>{' '}
            <rect
              x="0.75"
              y="0.75"
              width="16.5"
              height="16.5"
              rx="1.25"
              fill="none"
            ></rect>{' '}
          </g>{' '}
          <path
            id="Combined_Shape"
            data-name="Combined Shape"
            d="M0,12C0,8.25,4.5,9,4.5,7.5A2.2,2.2,0,0,0,4.089,6,3.453,3.453,0,0,1,3,3.375,3.2,3.2,0,0,1,6,0,3.2,3.2,0,0,1,9,3.375,3.4,3.4,0,0,1,7.892,6,2.3,2.3,0,0,0,7.5,7.5C7.5,9,12,8.25,12,12"
            transform="translate(6.002 8)"
            fill="none"
            stroke="#000000"
            strokeMiterlimit="10"
            strokeWidth="1.5"
          ></path>{' '}
        </g>
      </svg>
    )}
  </div>
))
