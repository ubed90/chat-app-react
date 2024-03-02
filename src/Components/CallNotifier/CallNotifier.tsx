import React from 'react';
import { useSocket } from '../../Context/SocketContext';
import { CALL_REJECTED, JOIN_CALL_ROOM } from '../../utils/EventsMap';
import { IUserData } from '../../models/user.model';
import { usePeer } from '../../Context/PeerContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { toast } from 'react-toastify'
import "./CallNotifier.scss";
import askRequiredPermission from '../../utils/askCameraPermission';

const CallNotifier = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const { socket } = useSocket();

  const { handlePeer, handleVideoCall, handleAudioCall, stream, handleStream, caller, handleIncomingCall, handleCaller, isGroupCall, handleIsGroupCall } =
    usePeer();

  const handleDecline = () => {
    socket?.emit(CALL_REJECTED, {
      callerId: caller?.caller._id,
      reason: 'Call declined',
    });
    handleIsGroupCall(false)
    handleIncomingCall(false);
    handleCaller(null);
    toast.dismiss(user?._id);
  }

  const handleAccepted = async () => {
    if (!stream) {
      try {
        const mediaStream = await askRequiredPermission(caller?.callType === 'Video');
        const peerId = handlePeer();
        handleStream(mediaStream);
        console.log(
          'EVENT EMITETD TO JOIN THE ROOM :: ',
          caller?.roomId,
          user?._id
        );
        socket?.emit(JOIN_CALL_ROOM, { roomId: caller?.roomId, user, peerId });
        if(caller?.callType === 'Audio') {
          handleAudioCall(true)
        } else {
          handleVideoCall(true);
        }
      } catch (error) {
        toast.error('Please allow audio and video permission');
        console.log('CALL REJECTED (PERMISSION DENIED) :: ');
        socket?.emit(CALL_REJECTED, {
          callerId: caller?.caller._id,
          reason: 'There is some problem at the receiver end. Try again later',
        });
        handleIncomingCall(false);
        handleCaller(null);
      }
    }

    toast.dismiss(user?._id);
    handleIncomingCall(false);
  }

  const handleNotAnswered = () => {
    socket?.emit(CALL_REJECTED, {
      callerId: caller?.caller._id,
      reason: "Receiver didn't answered the call",
    });

    handleIncomingCall(false);
    handleCaller(null);
    handleIsGroupCall(false);
    toast.dismiss(user?._id);
  }

  return toast(<Notify user={caller!.caller} callType={caller?.callType as string} handleDecline={handleDecline} handleAccepted={handleAccepted} handleNotAnswered={handleNotAnswered} isGroupCall={isGroupCall} groupName={caller?.groupName} />, {
      position: 'bottom-right',
      closeButton: false,
      toastId: user?._id,
      autoClose: false,
      theme: 'dark',
      style: {
        padding: 12,
      },
      pauseOnHover: false,
      pauseOnFocusLoss: true,
      draggable: false,
      className: 'border-[1px] border-success',
      progressClassName: '!bg-success',
    });
};

export default CallNotifier;


const Notify: React.FC<{ user: IUserData, callType: string, handleDecline: () => void, handleAccepted: () => void, handleNotAnswered: () => void, isGroupCall: boolean, groupName?: string }> = ({ user, callType, handleDecline, handleAccepted, handleNotAnswered, isGroupCall, groupName }) => {
  return (
    <div className="call-notifier">
      <div
        className={`call-notifier-image avatar ${
          user?.profilePicture ? '' : 'placeholder'
        }`}
      >
        <div className="w-16 rounded-full bg-neutral text-neutral-content !flex justify-center items-center">
          {user?.profilePicture ? (
            <img
              src={user?.profilePicture?.url || user?.profilePicture}
              className="!object-contain"
              alt={user.name}
            />
          ) : (
            <span className="text-2xl uppercase">
              {user.name.substring(0, 2)}
            </span>
          )}
        </div>
      </div>
      <div className="call-notifier-info flex flex-col justify-between">
        <h4 className="text-2xl text-accent">
          {isGroupCall ? groupName?.toUpperCase() : user.name.toUpperCase()} &#183;{' '}
          <span className="text-lg text-slate-600">ChatsUP</span> &#183;{' '}
          <span className="text-lg text-slate-600">now</span>
        </h4>
        <h5 className="text-lg flex items-center gap-2">
          <svg
            fill="#00f068"
            xmlns="http://www.w3.org/2000/svg"
            width="12px"
            height="12px"
            viewBox="0 0 52 52"
            enableBackground="new 0 0 52 52"
            xmlSpace="preserve"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {' '}
              <path d="M48.5,37.9L42.4,33c-1.4-1.1-3.4-1.2-4.8-0.1l-5.2,3.8c-0.6,0.5-1.5,0.4-2.1-0.2l-7.8-7l-7-7.8 c-0.6-0.6-0.6-1.4-0.2-2.1l3.8-5.2c1.1-1.4,1-3.4-0.1-4.8l-4.9-6.1c-1.5-1.8-4.2-2-5.9-0.3L3,8.4c-0.8,0.8-1.2,1.9-1.2,3 c0.5,10.2,5.1,19.9,11.9,26.7S30.2,49.5,40.4,50c1.1,0.1,2.2-0.4,3-1.2l5.2-5.2C50.5,42.1,50.4,39.3,48.5,37.9z"></path>{' '}
              <path d="M29.6,24H45c1,0,1.3-1.1,0.5-1.9l-4.9-5l9-9.1c0.5-0.5,0.5-1.4,0-1.9l-3.7-3.7c-0.5-0.5-1.3-0.5-1.9,0 l-9.1,9.1l-5.1-4.9C29.1,5.7,28,6,28,7v15.3C28,23,28.9,24,29.6,24z"></path>{' '}
            </g>
          </svg>
          Incoming {isGroupCall ? ('Group ' + callType) : callType} {callType} Call
        </h5>
      </div>
      <div className="call-notifier-cta flex gap-2">
        <button
          onClick={handleDecline}
          className="btn btn-error rounded-badge text-lg px-6"
        >
          <svg
            fill="#000000"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {' '}
              <path
                fillRule="evenodd"
                d="M14.4267305,12.3239887 C13.8091494,12.1184418 12.9237465,12.0002 11.9967657,12 C11.0703845,11.9998001 10.1850309,12.1179592 9.56735459,12.323626 C9.29781857,12.4133731 9.10254274,12.5124903 8.99818889,12.5994146 L8.99818886,13.4997844 C8.99830883,14.0560874 8.98526108,14.3378275 8.91482312,14.6766528 C8.76529679,15.3959143 8.36503921,15.9530303 7.5979407,15.9971778 C5.57992549,16.3324217 4.23196922,16.5 3.49954722,16.5 C2.04222339,16.5 1,15.1968274 1,14 L1,12.5 C1,8.77610714 6.02664974,5.99871171 11.9971973,6.00000002 C17.9690798,6.00128863 22.993963,8.77688238 22.9935942,12.4728433 C22.9981103,12.6390833 23.0000363,12.8114009 22.9999995,13.0054528 C22.9999727,13.1468201 22.9992073,13.2587316 22.9969405,13.5090552 C22.9947039,13.7560368 22.993963,13.8651358 22.993963,14 C22.993963,15.1895648 21.9503425,16.5 20.4944157,16.5 C19.7626874,16.5 18.4165903,16.332739 16.4017544,15.9981299 C15.3495506,15.9554142 15.0603932,15.1844357 15.0052983,14.044091 C14.9974219,13.8810653 14.9958289,13.7545264 14.9957743,13.5011312 C14.9956956,12.9832104 14.9956891,12.9405386 14.9957547,12.5995238 C14.8913892,12.5126847 14.6961745,12.4136666 14.4267305,12.3239887 Z M6.99818889,13.5 L6.99818889,12.5 C6.99818889,10.7340787 9.20464625,9.99939745 11.9971973,10 C14.7913808,10.0006029 16.9957741,10.7342819 16.9957741,12.5 C16.9956885,12.9366661 16.9956885,12.9366661 16.995774,13.4997844 C16.995822,13.7225055 16.9971357,13.8268559 17.0029681,13.9475751 C17.0051195,13.992103 17.0078746,14.0335402 17.0110607,14.0715206 C18.7614943,14.3571487 19.9381265,14.5 20.4944157,14.5 C20.7329265,14.5 20.993963,14.1722263 20.993963,14 C20.993963,13.8570865 20.9947313,13.7439632 20.9970225,13.4909448 C20.9992358,13.2465315 20.9999742,13.1385601 20.9999995,13.0050735 C21.0000331,12.8280282 20.998305,12.6734088 20.993963,12.5 C20.993963,10.2010869 17.0111151,8.00108196 11.9967657,7.99999998 C6.98400975,7.99891833 3,10.2002196 3,12.5 L3,14 C3,14.1781726 3.2573842,14.5 3.49954722,14.5 C4.05591217,14.5 5.23278898,14.3571098 6.98361703,14.071404 C6.99451507,13.9374564 6.99824508,13.76066 6.99818889,13.5 Z"
              ></path>{' '}
            </g>
          </svg>
          Decline
        </button>
        <button
          onClick={handleAccepted}
          className="btn btn-success rounded-badge text-lg px-6"
        >
          {callType === 'Video' ? (
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#ffffff"
              strokeWidth="1.2"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M5 18H15C16.1046 18 17 17.1046 17 16V8.57143V8C17 6.89543 16.1046 6 15 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{' '}
                <circle
                  cx="6.5"
                  cy="9.5"
                  r="0.5"
                  stroke="#000000"
                  strokeLinejoin="round"
                ></circle>{' '}
                <path
                  d="M17 10L21 7V17L17 14"
                  stroke="#000000"
                  strokeLinejoin="round"
                ></path>{' '}
              </g>
            </svg>
          ) : (
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {' '}
                <path
                  d="M3 5.5C3 14.0604 9.93959 21 18.5 21C18.8862 21 19.2691 20.9859 19.6483 20.9581C20.0834 20.9262 20.3009 20.9103 20.499 20.7963C20.663 20.7019 20.8185 20.5345 20.9007 20.364C21 20.1582 21 19.9181 21 19.438V16.6207C21 16.2169 21 16.015 20.9335 15.842C20.8749 15.6891 20.7795 15.553 20.6559 15.4456C20.516 15.324 20.3262 15.255 19.9468 15.117L16.74 13.9509C16.2985 13.7904 16.0777 13.7101 15.8683 13.7237C15.6836 13.7357 15.5059 13.7988 15.3549 13.9058C15.1837 14.0271 15.0629 14.2285 14.8212 14.6314L14 16C11.3501 14.7999 9.2019 12.6489 8 10L9.36863 9.17882C9.77145 8.93713 9.97286 8.81628 10.0942 8.64506C10.2012 8.49408 10.2643 8.31637 10.2763 8.1317C10.2899 7.92227 10.2096 7.70153 10.0491 7.26005L8.88299 4.05321C8.745 3.67376 8.67601 3.48403 8.55442 3.3441C8.44701 3.22049 8.31089 3.12515 8.15802 3.06645C7.98496 3 7.78308 3 7.37932 3H4.56201C4.08188 3 3.84181 3 3.63598 3.09925C3.4655 3.18146 3.29814 3.33701 3.2037 3.50103C3.08968 3.69907 3.07375 3.91662 3.04189 4.35173C3.01413 4.73086 3 5.11378 3 5.5Z"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{' '}
              </g>
            </svg>
          )}
          {callType}
        </button>
      </div>
      <div onAnimationEnd={handleNotAnswered} className="progress-bar"></div>
    </div>
  );
}