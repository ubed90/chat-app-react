const askVideoCallPermission = () => {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
};

export default askVideoCallPermission;
