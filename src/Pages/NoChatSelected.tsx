import { MdChat } from 'react-icons/md';

const NoChatSelected = () => {
  return <div className="w-full h-full grid place-items-center">
    <div className="content flex flex-col items-center gap-4">
        <MdChat className='text-7xl text-accent opacity-30' />
        <h4 className="text-xl md:text-3xl text-accent opacity-30">Click on a chat to begin</h4>
    </div>
  </div>;
};

export default NoChatSelected;
