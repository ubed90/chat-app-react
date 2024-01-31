import { Outlet } from 'react-router-dom'
import Chats from '../Chats/Chats'
import { useSelector } from 'react-redux'
import { RootState } from '../../Store'

const MobileLayout = () => {
  const { selectedChat } = useSelector((state: RootState) => state.chat)

  return (
    <div className="chats-parent">
      <div className={`chats-parent-mobile-layout ${selectedChat ? 'openChat' : ''}`}>
        <div className="left relative">
          <Chats />
        </div>
        <div className="right">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MobileLayout