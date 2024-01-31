import { PropsWithChildren, useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import './ChatMenu.scss';
import CreateChat from '../CreateChat';
import CreateGroupChat from '../CreateGroupChat';

type ChatMenuPosition = 'bottom-left' | 'bottom-right'

type ChatMenuProps = {
    position: ChatMenuPosition
}

const ChatMenu: React.FC<ChatMenuProps & PropsWithChildren> = ({ position }) => {
  const [open, setIsOpen] = useState<boolean>(false)

  const handleToggle = () => {
    setIsOpen(!open)
  }

  return (
    <ul className={`chat-menu absolute ${position} ${open && 'open'}`}>
      <CreateGroupChat />
      <CreateChat />
      <li className="chat-menu-item">
        <button onClick={handleToggle} className="btn btn-circle btn-outline btn-accent btn-lg">
          <IoMdAdd className="text-4xl" />
        </button>
      </li>
    </ul>
  );
}

export default ChatMenu