import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser, IUserData } from '../../models/user.model';
import { getThemeFromLocalStorage, getUserFromLocalStorage, Themes } from '../../utils/localStorage';
import { toast } from 'react-toastify';

const initialState: IUser = {
  user: getUserFromLocalStorage(),
  theme: getThemeFromLocalStorage(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, { payload }: PayloadAction<{ user: IUserData, token: string }>) => {
      const { token, user } = payload;
      state.user = { ...user, token: token ? token : state.user?.token };
      userSlice.caseReducers.performActionOnLocalStorage(state, {
        payload: { action: 'SAVE', key: 'user' },
      });
    },
    performActionOnLocalStorage: (
      state,
      { payload }: { payload: { key: keyof IUser; action: string } }
    ) => {
      const { action, key } = payload;

      action === 'SAVE'
        ? localStorage.setItem(key, JSON.stringify(state[key]))
        : localStorage.removeItem(key);
    },
    logoutUser: (state, { payload }: PayloadAction<{ msg?: string }>) => {
      state.user = null;
      userSlice.caseReducers.performActionOnLocalStorage(state, {
        payload: { action: 'REMOVE', key: 'user' },
      });

      if(payload.msg) {
        toast.success(payload.msg);
      }
    },
    toggleTheme: (state) => {
        state.theme = state.theme === Themes.LIGHT ? Themes.DARK : Themes.LIGHT;
        document.documentElement.setAttribute('data-theme', state.theme);
        userSlice.caseReducers.performActionOnLocalStorage(state, {
            payload: {
                action: 'SAVE',
                key: 'theme'
            }
        })
    },

  },
});

export const { loginUser, logoutUser, toggleTheme } = userSlice.actions;

export default userSlice.reducer;
