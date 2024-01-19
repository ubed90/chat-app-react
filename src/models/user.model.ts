export type IUser = {
  user: IUserData | null;
  theme: string;
}

export type IUserData = {
  id: string;
  email: string;
  name: string;
  username: string;
  token?: string;
}
