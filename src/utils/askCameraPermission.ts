const askRequiredPermission = (isVideoCall: boolean) => {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    ...(isVideoCall ? {video: true} : {})
  });
};

export default askRequiredPermission;
