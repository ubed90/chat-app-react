import { useSelector } from 'react-redux';
import Logo from '../../Components/Logo';
import { RootState } from '../../Store';
import { Link } from 'react-router-dom';
import { IoLogInSharp } from 'react-icons/io5';
import { LuUserPlus } from 'react-icons/lu';
import { FaRegUserCircle } from 'react-icons/fa';
import "./Home.scss";

const Header = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <header className="fixed w-full py-2">
      <nav className="flex items-center">
        <Logo url="/" isNameRequired={false} />
        <ul className="nav-links ml-auto flex items-center gap-2 md:gap-4">
          {user ? (
            <li>
              <Link
                className="flex items-center gap-2 text-2xl px-4 py-3 transition rounded-lg bg-[#1db8ab] text-white bg-opacity-20"
                to="/chats"
              >
                <FaRegUserCircle className="text-3xl text-[#1db8ab]" />{' '}
                {user.name}
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link
                  className="flex items-center gap-2 text-2xl px-4 py-3 transition rounded-lg hover:bg-[#1db8ab] text-white hover:bg-opacity-20"
                  to="/login"
                >
                  <IoLogInSharp className="text-3xl text-[#1db8ab]" /> Login
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 text-2xl px-4 py-3 rounded-lg bg-[#1db8ab] text-white bg-opacity-20"
                  to="/register"
                >
                  <LuUserPlus className="text-3xl text-[#1db8ab]" /> Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
