import { IUserData } from "../models/user.model";

enum Themes {
  LIGHT = 'lofi',
  DARK = 'forest',
}

const getThemeFromLocalStorage = (): string => {
  const theme =
    localStorage.getItem('theme') ? JSON.parse(localStorage.getItem('theme')!) :
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? Themes.DARK
      : Themes.LIGHT;
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
};

const getUserFromLocalStorage = (): IUserData | null => {
  const user = localStorage.getItem('user');

  if(!user || !JSON.parse(user).token) return null;

  return JSON.parse(user);
};

export { getThemeFromLocalStorage, getUserFromLocalStorage, Themes }