import { useSelector } from "react-redux"
import { RootState, useAppDispatch } from "../../Store"
import CustomSelect from "../CustomSelect";
import { useState } from "react";
import { IUserData } from "../../models/user.model";
import { CustomBtn } from "..";
import { IoRemoveCircle } from 'react-icons/io5';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customFetch from "../../utils/customFetch";
import { toast } from "react-toastify";
import { IChat, IChatCreation } from "../../models/chat.model";
import { setSelectedChat } from "../../features/chat";

type RemoveUserFromGroupProps = {
    onSuccess?: () => void;
}

const RemoveUserFromGroup: React.FC<RemoveUserFromGroupProps> = ({ onSuccess }) => {
    const { selectedChat } = useSelector((state: RootState) => state.chat);
    
    const [selectedUser, setselectedUser] = useState<IUserData | null>(null)

    const handleSelect = (user: IUserData) => {
        setselectedUser(user);
    }

    // * Dispatch to set the new Updated the group as selected chat
    const dispatch = useAppDispatch()

    // * QueryCLient to update the cache with the latest updated group details
    const queryClient = useQueryClient();

    const users = selectedChat?.users.map(user => {
        return {
            ...user,
            label: user.name,
            value: user._id
        }
    })

    // * Remove User From Group Mutation
    const { mutate: removeUserFromGroup, isPending } = useMutation({
        mutationKey: ['remove-user-from-group'],
        mutationFn: (userId: string) => customFetch.delete<IChatCreation>(`/chats/group/${selectedChat?._id}`, {
            data: { userId }
        })
    })

    // TODO: Need to Avoid the Group Admin Entry to be visible in the List to be Removed or add a Badge;

    // * Helper Function
    const handleRemove = () => {
        if (!selectedUser) {
          toast.error('Please select user first.');
          return;
        }

        removeUserFromGroup(selectedUser._id, {
          onSuccess({ data }) {
            if (data.status !== 'success') return;

            queryClient.setQueryData(['all-chats'], (chats: IChat[]) => {
              console.log(chats);

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

        onSuccess && onSuccess();
    }
    

  return (
    <section className="remove-user-from-group flex flex-col gap-4">
        <CustomSelect
            isClearable
            placeholder="Search For Name..."
            options={users}
            setValues={handleSelect}
        />
        <CustomBtn 
            type="button"
            text="Remove"
            classes="btn btn-error text-xl rounded-xl"
            icon={<IoRemoveCircle className="text-2xl" />}
            isLoading={isPending}
            isDisabled={isPending}
            clickHandler={handleRemove}
        />
    </section>
  )
}

export default RemoveUserFromGroup