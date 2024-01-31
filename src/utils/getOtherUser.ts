import { IUserData } from "../models/user.model";

export const getOtherUserDetails = (currentUser: IUserData, users: IUserData[]) => {
    return currentUser._id === users[0]._id ? users[1] : users[0];
}