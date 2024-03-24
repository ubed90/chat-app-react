/* eslint-disable @typescript-eslint/no-explicit-any */
import { loginUser } from ".";
import { IUserData } from "../../models/user.model";
import customFetch from "../../utils/customFetch";

const loginUserThunk = async (
  payload: { email: string; password: string },
  thunkAPI: any
) => {
    try {
        const { data } = await customFetch.post<{
          status: string;
          user: IUserData;
          message?: string;
        }>('/auth/login', payload);

        if(data.status !== 'success') throw new Error(data.message)

        thunkAPI.dispatch(loginUser({ user: data.user }));

        return data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response.data.message)
    }
};


export { loginUserThunk }