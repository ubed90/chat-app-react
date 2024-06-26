import { useSelector } from 'react-redux';
import logo from '../assets/chatsup_logo.png';
import { RootState } from '../Store';
import { Themes } from '../utils/localStorage';
import { Link } from 'react-router-dom';

const Logo = ({ url, isNameRequired = true }: { url: string, isNameRequired?: boolean }) => {
  const { theme } = useSelector((state: RootState) => state.user)

  return (
    <Link
      to={url}
      className="logo inline-flex items-center btn btn-ghost min-h-[initial] h-[initial] rounded-lg px-0 py-2"
    >
      <img
        src={logo}
        alt="logo"
        className="w-12 sm:w-16 aspect-square object-contain"
      />
      {isNameRequired && (
        <h1
          className={`text-2xl md:text-3xl tracking-widest items-center -ml-2 ${
            theme === Themes.LIGHT ? 'text-[#1db8ab]' : 'text-accent'
          }`}
        >
          Chats
          <span className="text-3xl md:text-4xl font-bold italic">UP</span>
        </h1>
      )}
    </Link>
  );
};

export default Logo;
