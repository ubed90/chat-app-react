export const CONNECTED_EVENT = 'connected';

export const DISCONNECT_EVENT = 'disconnected';

export const JOIN_CHAT_EVENT = 'joinChat';

export const LEAVE_CHAT_EVENT = 'leaveChat';
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

// type CHAT_EVENTS =  {
  // [CONNECTED_EVENT]: () => void,
  // [DISCONNECT_EVENT]: () => void,
  // [JOIN_CHAT_EVENT]: string,
  // leaveChat: string,
  // updateGroupName: string,
  // onMessage: string,
  // newChat: string,
  // error: string,
  // stopTyping: string,
  // startTyping: string,
// }

// export default CHAT_EVENTS;
