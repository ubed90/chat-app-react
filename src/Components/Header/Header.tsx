import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import avatar from "../../assets/avatar.jpg";
import Logo from '../Logo';

const Header = () => {
    const { user } = useSelector((state: RootState) => state.user);

  return (
    <header>
      <nav className="navbar bg-neutral min-h-0 h-full px-4 py-4 sm:px-6">
        <section className="navbar-start">
          <Logo />
        </section>
        <section className="navbar-center">
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              isActive
                ? 'btn btn-ghost rounded-md btn-md sm:btn-lg !text-2xl btn-active'
                : 'btn btn-ghost rounded-md btn-md sm:btn-lg !text-2xl'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive
                ? 'btn btn-ghost rounded-md btn-md sm:btn-lg !text-2xl ml-4 btn-active'
                : 'btn btn-ghost rounded-md btn-md sm:btn-lg !text-2xl ml-4'
            }
          >
            Search
          </NavLink>
        </section>
        <section className="navbar-end flex items-center justify-end gap-4">
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-md sm:btn-lg btn-circle">
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 md:w-10 md:h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <ul
              tabIndex={0}
              className="mt-7 z-[1] shadow menu menu-lg dropdown-content bg-neutral rounded-xl w-max"
            >
              <li className='text-lg sm:text-xl p-2 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-600'>
                You have 0 notifications.
              </li>
            </ul>
          </div>
          <details className="dropdown dropdown-end">
            <summary
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 sm:w-20 rounded-full">
                <img alt="profile-image" src={user?.profilePicture || avatar} />
              </div>
            </summary>
            <ul
              tabIndex={0}
              className="mt-6 z-[1] p-2 shadow menu menu-lg !text-2xl dropdown-content bg-neutral rounded-box w-64"
            >
              <li>
                <Link to="/profile" className="justify-between !text-xl sm:!text-2xl">
                  Profile
                  <span className="badge badge-lg">New</span>
                </Link>
              </li>
              {/* <li>
                <a>Settings</a>
              </li> */}
              <li>
                <a className="!text-xl sm:!text-2xl bg-red-400 text-black sm:bg-transparent sm:text-current hover:bg-red-400 hover:text-black">
                  Logout
                </a>
              </li>
            </ul>
          </details>
        </section>
      </nav>
    </header>
  );
}

export default Header