import {
  RefetchOptions,
  QueryObserverResult,
  useQuery,
} from '@tanstack/react-query';
import { IChat, IChatResponse } from '../../models/chat.model';
import { PropsWithChildren, createContext, useContext } from 'react';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';

const chatsQuery = {
  queryKey: ['all-chats'],
  queryFn: async () => {
    const { data } = await customFetch.get<IChatResponse>('/chats');

    return data.chats;
  },
};

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
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    error,
    refetch: fetchChats,
  } = useQuery(chatsQuery);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if(isError && (error as any)?.response?.data?.statusCode === 401) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toast.warning(`${(error as any)?.response?.data?.message || error.message}`);
    return <Navigate to='/login' />
  }

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
