import './Chats.scss'
import { ChatListItem, ChatMenu } from '../../Components';
import { useChatsContext } from '../ChatsContainer/ChatsContext';

const Chats = () => {
  const { chats, isLoading, isRefetching } = useChatsContext();
  
  if(isLoading || isRefetching) {
    return (
      <ul className="chats-list md:border-r-[1px] md:border-r-primary md:border-opacity-30">
        {Array.from({ length: 14 }, (_, index) => (
          <li key={index}>
            <div className="p-4 flex gap-4 items-center">
              <div className="skeleton bg-secondary bg-opacity-20 w-16 h-16 rounded-full shrink-0"></div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="skeleton bg-secondary bg-opacity-20 h-4 w-1/3"></div>
                <div className="skeleton bg-secondary bg-opacity-20 h-4 w-2/3"></div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }
  

  return (
    <>
      <ul
        className={`chats-list md:border-r-[1px] md:border-r-primary md:border-opacity-30 ${
          chats.length === 0 && 'place-items-center auto-rows-auto'
        }`}
      >
        {chats.length > 0 &&
          chats.map((chat) => <ChatListItem {...chat} key={chat._id} />)}
        {chats.length === 0 && (
          <li className="text-2xl md:text-3xl text-accent opacity-30 text-center">
            Click on below <span className='text-3xl md:text-5xl'>+</span> icon to start a new chat.
          </li>
        )}
      </ul>
      <ChatMenu position="bottom-right" />
    </>
  );
}

export default Chats