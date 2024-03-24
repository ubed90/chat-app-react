import React, { useCallback, useState } from 'react';
import { IUserData, IUsersResponse } from '../../models/user.model';
import customFetch from '../../utils/customFetch';
import debounce from '../../utils/debounce';
import CustomSelect from '../CustomSelect';
import { CustomBtn } from '..';
import { HiUserAdd } from 'react-icons/hi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import { IChat, IChatCreation } from '../../models/chat.model';
import { setSelectedChat } from '../../features/chat';
import { toast } from 'react-toastify';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadOptions = (inputValue: string, callback: any): void => {
  customFetch
    .get<IUsersResponse>('/chats/users', {
      params: {
        type: 'username',
        search: inputValue,
      },
    })
    .then(({ data }) => {
      const users = data.users.map((user) => {
        return {
          ...user,
          label: user['username'] || user.name,
          value: user._id,
        };
      });

      callback(users);
    });
};

type Props = {
    onSuccess?: () => void;
}

let AddUserToGroup: React.FC<Props> = ({ onSuccess }) => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const [selectedUser, setselectedUser] = useState<IUserData | null>(null);

  const handleSelect = (user: IUserData) => {
    setselectedUser(user);
  };

  const loadOptionsDebounced = useCallback(debounce(loadOptions), []);

  // * Dispatch to set the new Updated the group as selected chat
  const dispatch = useAppDispatch();

  // * QueryCLient to update the cache with the latest updated group details
  const queryClient = useQueryClient();

  //   * Mutation to add user to group
  const { mutate: addUserToGroup, isPending } = useMutation({
    mutationKey: ['add-user'],
    mutationFn: (userId: string) =>
      customFetch.patch<IChatCreation>(`/chats/group/${selectedChat?._id}`, {
        userId,
      }),
  });

  // * Helper Func
  const handleSubmit = () => {
    addUserToGroup(selectedUser?._id as string, {
      onSuccess({ data }) {
        if (data.status !== 'success') return;

        queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
          const newChats: IChat[] = structuredClone(chats);

          const chat = newChats.find((chat) => chat._id === data.chat._id);

          if (!chat) return newChats;

          chat['users'] = data.chat.users;

          dispatch(setSelectedChat(chat));

          return newChats;
        });

        toast.success(data.message + ' 🚀');
        onSuccess && onSuccess();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError(error: any) {
        return toast.error(error?.response?.data?.message || error.message);
      },
    });
  };

  return (
    <section className="add-user flex flex-col gap-4">
      <CustomSelect
        isAsync
        isClearable
        setValues={handleSelect}
        loadOptions={loadOptionsDebounced}
        placeholder="Search Username..."
      />
      <CustomBtn
        type="button"
        text="Add"
        classes="btn-success text-xl rounded-md"
        icon={<HiUserAdd className="text-2xl" />}
        isLoading={isPending}
        isDisabled={isPending || !selectedUser}
        clickHandler={handleSubmit}
      />
    </section>
  );
};

AddUserToGroup = React.memo(AddUserToGroup);

export default AddUserToGroup;
