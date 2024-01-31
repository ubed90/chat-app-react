import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { IChat } from "../../models/chat.model"

type Chat = {
    selectedChat: IChat | undefined
}

const initialState: Chat = {
    selectedChat: undefined
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setSelectedChat: (state, { payload }: PayloadAction<IChat | undefined>) => {
            state.selectedChat = payload;
        }
    }
})

export const { setSelectedChat } = chatSlice.actions;

export default chatSlice.reducer;