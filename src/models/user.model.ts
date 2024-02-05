export type IUser = {
  user: IUserData | null;
  theme: string;
}

export type IUserData = {
  _id: string;
  email: string;
  name: string;
  username: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profilePicture?: any;
  phoneNumber?: string;
  token?: string;
};


export interface IUsersResponse {
  status: string;
  message: string;
  users: IUserData[];
}