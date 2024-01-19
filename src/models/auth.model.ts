import { IUserData } from "./user.model";

export type AuthData = {
    username: string;
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
}

export type AuthResponse = {
    user: IUserData;
    token: string;
}