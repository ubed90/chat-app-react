import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import Logo from '../Logo';
import { Themes } from '../../utils/localStorage';
import { logoutUser, toggleTheme } from '../../features/user';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';
import { IMessage } from '../../models/message.model';
import {
  NotificationData,
  deleteNotification,
  setSelectedChat,
} from '../../features/chat';
import { useQueryClient } from '@tanstack/react-query';
import { IChat } from '../../models/chat.model';

const Header = () => {
  const { user, theme } = useSelector((state: RootState) => state.user);
  const { notification } = useSelector((state: RootState) => state.chat);

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const handleNotifyClick = async (key: string, notification: NotificationData) => {
    switch (notification.action) {
      case 'NEW_CHAT':
      case 'NEW_MESSAGE': {
        queryClient.setQueryData(['all-chats', user?._id], (chats: IChat[]) => {
          const newChats: IChat[] = structuredClone(chats);

          const existingChat = newChats.find((chat) => chat._id === key);

          if (!existingChat) return chats;

          existingChat.notify = undefined;

          dispatch(setSelectedChat(existingChat));

          return newChats;
        });
        dispatch(deleteNotification({ key }));
        queryClient.invalidateQueries({ queryKey: ['chat', key] });
        // if(notification.isGroupChat) {
        //   await queryClient.refetchQueries({ queryKey: ['chat', key] })
        // }
        return navigate(`/chats/${key}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await customFetch.post('/auth/logout');
      return dispatch(logoutUser({ msg: 'Logout Successful 🚀' }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <header className="border-b border-base-300">
      <nav className="navbar bg-neutral min-h-0 h-full px-4 py-4 sm:px-6">
        <section className="navbar-start">
          <Logo url='/chats' />
        </section>
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
                {notification && Object.keys(notification).length > 0 && (
                  <span className="badge badge-success indicator-item text-base rounded-full">
                    {Object.keys(notification).length}
                  </span>
                )}
              </div>
            </button>
            <ul
              tabIndex={0}
              className="mt-6 z-[1] shadow menu menu-lg dropdown-content bg-neutral rounded-xl w-max"
            >
              {notification &&
                Object.keys(notification).map((key) => {
                  const notify = notification[key];

                  const isMessageNotification =
                    notify.action === 'NEW_MESSAGE' &&
                    Array.isArray(notify.value);

                  return isMessageNotification ? (
                    <li
                      key={key}
                      className="text-white text-lg sm:text-xl p-2 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-600"
                      onClick={() => handleNotifyClick(key, notify)}
                    >
                      You got{' '}
                      {notify.value.length > 1 ? notify.value.length : 'a'} new
                      message{notify.value.length > 1 ? 's' : ''}{' '}
                      {notify.isGroupChat
                        ? `in ${notify.chatName}`
                        : `from ${(notify.value[0] as IMessage).sender.name}`}
                    </li>
                  ) : (
                    <li
                      key={key}
                      className="text-white text-lg sm:text-xl p-2 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-600"
                      onClick={() => handleNotifyClick(key, notify)}
                    >
                      {notify.value as string}
                    </li>
                  );
                })}
              {(!notification || Object.keys(notification).length === 0) && (
                <li className="text-white text-lg sm:text-xl p-2 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-600">
                  You have 0 notifications.
                </li>
              )}
            </ul>
          </div>
          <div className="dropdown dropdown-end flex">
            <button className="btn btn-ghost btn-circle">
              {user?.profilePicture ? (
                <div
                  className={`avatar w-12 aspect-square rounded-full overflow-hidden ring-primary ring-1 ${
                    theme === Themes.LIGHT ? 'ring-white ring-2' : ''
                  }`}
                >
                  <img
                    src={user.profilePicture || user.profilePicture?.url}
                    className="!object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="avatar placeholder">
                  <div className="bg-accent text-neutral-content rounded-full w-12">
                    <span className="text-xl uppercase">
                      {user?.name.substring(0, 2)}
                    </span>
                  </div>
                </div>
              )}
            </button>
            <ul
              tabIndex={0}
              className="mt-20 z-[5] p-4 shadow menu menu-lg !text-2xl dropdown-content bg-neutral rounded-xl w-64 gap-2 text-white"
            >
              <li>
                <NavLink
                  to="profile"
                  relative="path"
                  className="justify-between !text-xl sm:!text-2xl rounded-xl p-3"
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="change-password"
                  relative="path"
                  className="justify-between !text-xl sm:!text-2xl rounded-xl p-3"
                >
                  Change Password
                </NavLink>
              </li>
              {/* <li>
                <a>Settings</a>
              </li> */}
              <li>
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="inline-flex justify-between items-center rounded-xl p-3"
                >
                  {/* this hidden checkbox controls the state */}
                  <span className="!text-xl sm:!text-2xl text-white rounded-xl">
                    {theme === Themes.LIGHT ? 'Dark Mode' : 'Light Mode'}
                  </span>
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
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="!text-xl sm:!text-2xl bg-red-400 text-white font-bold sm:hover:bg-red-400/80 sm:text-current rounded-xl p-3"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </section>
      </nav>
    </header>
  );
};

export default Header;
