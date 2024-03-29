import './Chats.scss'
import { ChatListItem, ChatMenu, FormInput } from '../../Components';
import { useChatsContext } from '../../Context/ChatsContext';
import { RxCross2 } from 'react-icons/rx';
import { useMemo, useState } from 'react';
import { getOtherUserDetails } from '../../utils/getOtherUser';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';


const Chats = () => {
  const { chats, isLoading, isRefetching } = useChatsContext();

  const user = useSelector((state: RootState) => state.user.user)

  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) => {
        if (chat.isGroupChat)
          return chat.name.toLowerCase().includes(searchTerm.toLowerCase());

        const otherUser = getOtherUserDetails(user!, chat.users);

        return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
      }),
    [chats, searchTerm, user]
  );

  const handleChange = ({ value }: { key: string; value: string }) => {
    setSearchTerm(value);
  };

  const handleReset = () => setSearchTerm('');
  
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
    <section className="chats-list-container md:border-r-[1px] md:border-r-primary md:border-opacity-30 h-full">
      {chats.length > 0 && (
        <div className="search-box flex items-center relative border-b-[1px] border-accent border-opacity-20">
          <FormInput
            name="search-users"
            type="search"
            hideLabel
            customClasses="!w-auto border-opacity-50"
            containerClasses='px-4'
            placeholder="Search For Users..."
            marginRequired={false}
            disabled={isLoading || isRefetching}
            value={searchTerm}
            handleChange={handleChange}
          />
          {!isLoading && !isRefetching && searchTerm && (
            <RxCross2
              onClick={handleReset}
              className="text-4xl text-primary absolute top-1/2 right-6 -translate-y-1/2 cursor-pointer"
            />
          )}
        </div>
      )}
      <ul
        className={`chats-list ${
          filteredChats.length === 0 && 'place-items-center auto-rows-auto'
        }`}
      >
        {filteredChats.length > 0 &&
          filteredChats.map((chat) => (
            <ChatListItem {...chat} key={chat._id} />
          ))}
        {chats.length === 0 && (
          <li className="text-2xl md:text-3xl text-accent opacity-30 text-center">
            Click on below <span className="text-3xl md:text-5xl">+</span> icon
            to start a new chat.
          </li>
        )}
        {chats.length !== 0 && filteredChats.length === 0 && (
          <li className="text-2xl md:text-3xl text-accent opacity-30 text-center">
            No Chat Found
          </li>
        )}
      </ul>
      <ChatMenu position="bottom-right" />
    </section>
  );
}

export default Chats