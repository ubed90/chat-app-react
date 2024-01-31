import { HiUserGroup } from 'react-icons/hi2';
import Modal from './Modal/Modal';
import { useState } from 'react';

const CreateGroupChat = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <li onClick={handleToggle} className="chat-menu-item cursor-pointer">
        <p className="text-xl md:text-2xl">Create Group</p>
        <button className="btn btn-circle btn-outline btn-accent btn-lg">
          <HiUserGroup className="text-4xl" />
        </button>
      </li>

      <Modal id="create-group-chat" isOpen={isOpen} onClose={handleToggle}>
        <Modal.Header onClose={handleToggle}>Create Group Chat</Modal.Header>
        <Modal.Body>Create Group Chat Body</Modal.Body>
        <Modal.Footer>Create Group Chat Footer</Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateGroupChat;
