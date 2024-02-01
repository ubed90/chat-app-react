export type IUser = {
  user: IUserData | null;
  theme: string;
}

export type IUserData = {
  _id: string;
  email: string;
  name: string;
  username: string;
  profilePicture?: string;
  token?: string;
};


export interface IUsersResponse {
  status: string;
  message: string;
  users: IUserData[];
}