import { Outlet } from 'react-router-dom'
import Chats from '../Chats/Chats'
import { useSelector } from 'react-redux'
import { RootState } from '../../Store'

const MobileLayout = () => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);

  /**
   * ! Crafted A Side ABsolute Positioned Layout using CSS
   * ? It will show chat List when no chat is selected
   * ? Else It will show the Chat Page
   * ? Added a smooth Transition for page shift (Check ./ChatsContainer.scss) 
   */
  return (
    <div className="chats-parent">
      <div
        className={`chats-parent-mobile-layout ${
          selectedChat ? 'openChat' : ''
        }`}
      >
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