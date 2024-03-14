import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../Store';
import { CustomBtn, FormInput } from '..';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import { IChat, IChatCreation } from '../../models/chat.model';
import { toast } from 'react-toastify';
import { IoSave } from 'react-icons/io5';
import { setSelectedChat } from '../../features/chat';

type EditGroupNameProps = {
    onSuccess?: () => void;
}

let EditGroupName: React.FC<EditGroupNameProps> = ({ onSuccess }) => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const [groupName, setGroupName] = useState<string>(
    selectedChat?.name as string
  );

  const dispatch = useAppDispatch();

  const handleChange = ({ value }: { value: string }) => {
    setGroupName(value);
  };

  // * Mutation to Change Group Name Req
  const { mutate: changeGroupName, isPending } = useMutation({
    mutationKey: ['edit-group-name'],
    mutationFn: (name: string) =>
      customFetch.patch<IChatCreation>('/chats/group', {
        name,
        groupId: selectedChat?._id,
      }),
  });

//   * QueryClient to Change Group name on Local cache
  const queryClient = useQueryClient();

  const handleSubmit = () => {
    changeGroupName(groupName, {
        onSuccess({ data }) {
            if(data.status !== 'success') return;

            queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
              const newChats: IChat[] = structuredClone(chats);

              const chat = newChats.find(
                (chat) => chat._id === data.chat._id
              );

              if (!chat) return newChats;

              chat['name'] = data.chat.name;

              dispatch(setSelectedChat(chat));

              return newChats;
            });

            toast.success(data.message + ' 🚀')
            onSuccess && onSuccess();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError(error: any) {
            return toast.error(error?.response?.data?.message || error.message);
        }
    });
  }

  return (
    <section className="edit-group-name flex flex-col gap-4 md:flex-row md:items-end">
      <FormInput
        type="text"
        name="name"
        label="New Group Name"
        required
        placeholder="Enter Group Name..."
        value={groupName}
        handleChange={handleChange}
        marginRequired={false}
      />
      <CustomBtn 
        type='button'
        text='Save'
        className='btn btn-accent text-xl rounded-lg md:w-52 md:text-2xl'
        icon={<IoSave className='text-2xl' />}
        isLoading={isPending}
        isDisabled={isPending || !groupName || groupName === selectedChat?.name}
        clickHandler={handleSubmit}
      />
    </section>
  );
};

EditGroupName = React.memo(EditGroupName);

export default EditGroupName;
