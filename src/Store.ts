import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

// * Reducers
import userReducer from "./features/user";

export const store = configureStore({
    reducer: {
        user: userReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;

type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>()