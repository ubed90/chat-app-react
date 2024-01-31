import { RiChatNewFill } from 'react-icons/ri';
import Modal from './Modal/Modal';
import { useState } from 'react';

const CreateChat = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <li onClick={handleToggle} className="chat-menu-item cursor-pointer">
        <p className="text-xl md:text-2xl">Create Chat</p>
        <button className="btn btn-circle btn-outline btn-accent btn-lg">
          <RiChatNewFill className="text-4xl" />
        </button>
      </li>

      <Modal id="create-chat" isOpen={isOpen} onClose={handleToggle}>
        <Modal.Header onClose={handleToggle}>Create Chat</Modal.Header>
        <Modal.Body>Create Chat Body</Modal.Body>
        <Modal.Footer>Create Chat Footer</Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateChat;
