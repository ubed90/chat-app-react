/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RefetchOptions,
  QueryObserverResult,
  useQuery,
} from '@tanstack/react-query';
import { IChat, IChatResponse } from '../models/chat.model';
import { PropsWithChildren, createContext, useContext, useEffect } from 'react';
import customFetch from '../utils/customFetch';
import { RootState, useAppDispatch } from '../Store';
import { logoutUser } from '../features/user';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const chatsQuery = (userId: string | undefined) => ({
  queryKey: ['all-chats', userId],
  queryFn: async () => {
    const { data } = await customFetch.get<IChatResponse>('/chats');

    return data.chats;
  },
});

type ChatsContext = {
  chats: IChat[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  fetchChats?: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<IChat[], Error>>;
};

const ChatsContext = createContext<ChatsContext>({
  chats: [],
  error: null,
  isError: false,
  isLoading: false,
  isRefetching: false,
});

export const ChatsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const userId = useSelector((state: RootState) => state.user.user?._id)

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    error,
    refetch: fetchChats,
  } = useQuery(chatsQuery(userId));

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if(isError && (error as any)?.response?.data?.statusCode === 401) {
      // toast.warning((error as any)?.response?.data?.message)
      dispatch(logoutUser((error as any)?.response?.data?.message));
      navigate('/login')
    }
  }, [dispatch, error, isError, navigate])

  return (
    <ChatsContext.Provider
      value={{
        chats: data || [],
        error,
        isError,
        isLoading,
        isRefetching,
        fetchChats,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChatsContext = () => useContext(ChatsContext);
