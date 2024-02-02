/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from 'react'
import debounce from '../utils/debounce';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useChatsContext } from '../Pages/ChatsContainer/ChatsContext';
import { useAppDispatch } from '../Store';
import { IChatCreation } from '../models/chat.model';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';
import { setSelectedChat } from '../features/chat';

type CreateChatHOCProps = {
  loadOptions: (searchType: {
    label: string;
    value: string;
}) => (inputValue: string, callback: any) => void
  createGroup: boolean;
};

const createChatHOC = <T, E>({ loadOptions, createGroup }: CreateChatHOCProps) => (WrappedComponent: React.FC<any>) => {
  return () => {
    const searchTypes = [
      {
        label: 'Name',
        value: 'name',
      },
      {
        label: 'Email',
        value: 'email',
      },
      {
        label: 'User Name',
        value: 'username',
      },
      {
        label: 'Phone Number',
        value: 'phoneNumber',
      },
    ];
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchType, setSearchType] = useState<(typeof searchTypes)[0]>(
      searchTypes[0]
    );
    const [data, setData] = useState<T | null>(null);
    const [name, setName] = useState<string>('')

    const handleSearchType = (searchType: (typeof searchTypes)[0]) => {
      setSearchType(searchType);
    };

    const handleName = (value: string) => {
        setName(value);
    }

    const handleToggle = () => {
      setIsOpen(!isOpen);
    };

    const handleSelect = (data: T) => {
      setData(data);
    };

    // * Context for getting Refetch Chats Function
    const { fetchChats } = useChatsContext();
    const queryClient = useQueryClient();

    // * Dispatch and Navigate for Checking If user is on a Particular Chat then redirect it to new one
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // * Mutation for Adding Chat
    const { mutate: createNewChat, isPending } = useMutation({
      mutationKey: ['add-chat'],
      mutationFn: (variables: E) =>
        customFetch.post<IChatCreation>('/chats', variables),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const loadOptions = (inputValue: string, callback: any): void => {
    //   customFetch
    //     .get<IUsersResponse>('/chats/users', {
    //       params: {
    //         type: searchType.value,
    //         search: inputValue,
    //       },
    //     })
    //     .then(({ data }) => {
    //       const users = data.users.map((user) => {
    //         return {
    //           ...user,
    //           label: user[searchType.value as keyof IUserData] || user.name,
    //           value: user._id,
    //         };
    //       });

    //       callback(users);
    //     });
    // };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadOptionsDebounced = useCallback(debounce(loadOptions(searchType)), [
      searchType,
    ]);

    // * Add Chat Click Handler
    // TODO: Need to Handle the edge when API returns successful for trying to create an existing chat again
    const handleAddChat = () => {
      if (!data) {
        toast.error('Please select a user.');
        return;
      }

      createNewChat(
        !createGroup
          ? { receiverId: (data as any)._id } as E
          : { name, participants: (data as any).map((user: any) => user._id) } as E,
        {
          onSuccess({ data }) {
            handleToggle();
            queryClient.invalidateQueries({ queryKey: ['all-chats'] });
            fetchChats && fetchChats();
            dispatch(setSelectedChat(data.chat));
            toast.success(data.message + ' 🚀');
            navigate(`/chats/${data.chat._id}`);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError(error: any) {
            toast.error(error?.response?.data?.message || error.message);
          },
        }
      );
    };

    // * Cancel Handler
    const handleCancel = () => {
      handleSearchType(searchTypes[0]);
      setData(null);
      handleToggle();
    };

    const props = {
      searchTypes,
      isOpen,
      handleToggle,
      searchType,
      loadOptionsDebounced,
      handleSelect,
      handleSearchType,
      handleCancel,
      handleAddChat,
      isPending,
      name,
      handleName
    };

    return <WrappedComponent {...props}  />;
  }
}

export default createChatHOC