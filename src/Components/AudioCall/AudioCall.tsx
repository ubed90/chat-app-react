import React, { useState } from 'react';
import CustomBtn from '../CustomBtn';
import { FaPhone } from 'react-icons/fa6';
import Modal from '../Modal/Modal';

const AudioCall = () => {
  const [isCalling, setIsCalling] = useState(false);

  const toggleIsCalling = () => setIsCalling(!isCalling);

  return (
    <>
      <CustomBtn
        icon={<FaPhone className="text-3xl text-accent" />}
        clickHandler={toggleIsCalling}
        classes="ml-auto mr-3 btn-lg bg-transparent border-none outline-none shadow-none hover:bg-gray-400 rounded-lg px-4 h-[3rem] min-h-[3rem]"
      />

      <Modal
        id="audio-call"
        isOpen={isCalling}
        onClose={toggleIsCalling}
        className="border-none"
      >
        <Modal.Body>Modal Body</Modal.Body>
        <Modal.Footer>CTA Buttons</Modal.Footer>
      </Modal>
    </>
  );
};

export default AudioCall;
