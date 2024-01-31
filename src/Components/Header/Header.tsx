import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import avatar from "../../assets/avatar.jpg";
import Logo from '../Logo';
import { Themes } from '../../utils/localStorage';
import { logoutUser, toggleTheme } from '../../features/user';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';

const Header = () => {
    const { user, theme } = useSelector((state: RootState) => state.user);

    const dispatch = useAppDispatch();

    const navigate = useNavigate();
    

    const handleLogout = async () => {
      try {
        await customFetch.post('/auth/logout');
        dispatch(logoutUser({ msg: 'Logout Successful 🚀' }));
        return navigate('/login');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log(error);
        toast.error(error.response.data.message)
      }
    }

  return (
    <header>
      <nav className="navbar bg-neutral min-h-0 h-full px-4 py-4 sm:px-6">
        <section className="navbar-start">
          <Logo />
        </section>
        {/* <section className="navbar-center">
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              isActive
                ? `btn ${
                    theme === Themes.LIGHT
                      ? 'btn-primary bg-slate-50 bg-opacity-30'
                      : 'btn-ghost'
                  } rounded-md btn-md sm:btn-lg !text-2xl ml-2 btn-active`
                : `btn ${
                    theme === Themes.LIGHT ? 'btn-primary' : 'btn-ghost'
                  } rounded-md btn-md sm:btn-lg !text-2xl ml-2`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive
                ? `btn ${
                    theme === Themes.LIGHT
                      ? 'btn-primary bg-slate-50 bg-opacity-30'
                      : 'btn-ghost'
                  } rounded-md btn-md sm:btn-lg !text-2xl ml-2 btn-active`
                : `btn ${
                    theme === Themes.LIGHT ? 'btn-primary' : 'btn-ghost'
                  } rounded-md btn-md sm:btn-lg !text-2xl ml-2`
            }
          >
            Search
          </NavLink>
        </section> */}
        <section className="navbar-end flex items-center justify-end gap-4">
          <div className="dropdown dropdown-end">
            <button
              className={`btn ${
                theme === Themes.LIGHT ? 'btn-primary' : 'btn-ghost'
              } btn-md sm:btn-lg btn-circle`}
            >
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 md:w-10 md:h-10"
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
                <span className="badge badge-xs badge-success rounded-full indicator-item"></span>
              </div>
            </button>
            <ul
              tabIndex={0}
              className="mt-7 z-[1] shadow menu menu-lg dropdown-content bg-neutral rounded-xl w-max"
            >
              <li className="text-white text-lg sm:text-xl p-2 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-600">
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
              className="mt-6 z-[1] p-4 shadow menu menu-lg !text-2xl dropdown-content bg-neutral rounded-xl w-64 gap-2 text-white"
            >
              <li>
                <NavLink
                  to="/profile"
                  className="justify-between !text-xl sm:!text-2xl rounded-xl"
                >
                  Profile
                  <span className="badge badge-lg rounded-xl">New</span>
                </NavLink>
              </li>
              {/* <li>
                <a>Settings</a>
              </li> */}
              <li>
                <label
                  role="button"
                  onClick={() => dispatch(toggleTheme())}
                  className="inline-flex justify-between items-center"
                >
                  {/* this hidden checkbox controls the state */}
                  <span>{theme === Themes.LIGHT ? 'Dark Mode' : 'Light Mode'}</span>
                  {/* sun icon */}
                  {theme === Themes.LIGHT && (
                    <svg
                      className="fill-white w-10 h-10"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                    </svg>
                  )}

                  {/* moon icon */}
                  {theme === Themes.DARK && (
                    <svg
                      className="fill-white w-10 h-10"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                    </svg>
                  )}
                </label>
              </li>
              <li>
                <button onClick={handleLogout} className="!text-xl sm:!text-2xl bg-red-400 text-white font-bold sm:bg-transparent sm:text-current hover:bg-red-400 hover:text-black rounded-xl">
                  Logout
                </button>
              </li>
            </ul>
          </details>
        </section>
      </nav>
    </header>
  );
}

export default Header