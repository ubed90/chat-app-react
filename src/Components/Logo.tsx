import logo from '../assets/chatsup_logo.png';

const Logo = () => {
  return (
    <div className="logo inline-flex items-center btn btn-ghost min-h-[initial] h-[initial] rounded-lg sm:pl-0 py-2">
      <img
        src={logo}
        alt="logo"
        className="w-12 sm:w-16 aspect-square object-contain"
      />
      <h1 className="text-2xl md:text-3xl tracking-widest text-accent items-center -ml-2 hidden sm:inline-flex">
        Chats
        <span className="text-3xl md:text-4xl font-bold italic">UP</span>
      </h1>
    </div>
  );
};

export default Logo;
