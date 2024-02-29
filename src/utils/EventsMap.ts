export const CONNECTED_EVENT = 'connected';

export const DISCONNECT_EVENT = 'disconnected';

export const JOIN_CHAT_EVENT = 'joinChat';

export const DELETE_CHAT_EVENT = 'deleteChat';
// ? when admin updates a group name
export const UPDATE_GROUP_NAME_EVENT = 'updateGroupName';
// ? when new message is received
export const MESSAGE_RECEIVED_EVENT = 'messageReceived';
// ? when there is new one on one chat, new group chat or user gets added in the group
export const NEW_CHAT_EVENT = 'newChat';
// ? when there is an error in socket
export const SOCKET_ERROR_EVENT = 'socketError';
// ? when participant stops typing
export const STOP_TYPING_EVENT = 'stopTyping';
// ? when participant starts typing
export const TYPING_EVENT = 'typing';
// ? when admin remove a particpant
export const REMOVE_FROM_GROUP_EVENT = 'removeFromGroup';
// ? when friend gets disconnected
export const USER_DISCONNECTED = 'userDisconnected';
// ? when friend gets disconnected
export const USER_CONNECTED = 'userConnected';


// ! Call Events
// ? Call Initialted
export const CALL_INITIATED = "callInitiated"

// ? Call Request Received
export const CALL_OFFER_RECEIVED = "callOfferReceived"

// ? Join Call Room
export const JOIN_CALL_ROOM = 'callJoined';

// ? NEW USER JOINED THE CALL
export const CALL_CONNECTED = "callConnected"

// ? NEW USER REJECTED THE CALL
export const CALL_REJECTED = "callRejected"

// ? User Toggle the Audio
export const TOGGLE_AUDIO = "toggleAudio"

// ? User Toggle the Video
export const TOGGLE_VIDEO = "toggleVideo"

// ? User Hangsup the Call
export const USER_HANG_UP = "userHangUp"