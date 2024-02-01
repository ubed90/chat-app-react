import { RiChatNewFill } from 'react-icons/ri';
import Modal from './Modal/Modal';
import { useCallback, useState } from 'react';
// import { OptionsOrGroups, GroupBase } from 'react-select';
import customFetch from '../utils/customFetch';
import { IUserData, IUsersResponse } from '../models/user.model';
import debounce from '../utils/debounce';
import CustomSelect from './CustomSelect';
import { ImCross } from 'react-icons/im';
import { IoIosAdd } from 'react-icons/io';
import { CustomBtn } from '.';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IChatCreation } from '../models/chat.model';
import { toast } from 'react-toastify';
import { useChatsContext } from '../Pages/ChatsContainer/ChatsContext';
import { useAppDispatch } from '../Store';
import { setSelectedChat } from '../features/chat';
import { useNavigate } from 'react-router-dom';

const CreateChat = () => {
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
  const [searchType, setSearchType] = useState<typeof searchTypes[0]>(searchTypes[0])
  const [selectedUser, setSelectedUser] = useState<IUserData | null>(null)
  

  const handleSearchType = (searchType: typeof searchTypes[0]) => {
    setSearchType(searchType);
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleUserSelect = (user: IUserData) => {
    setSelectedUser(user);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadOptions = (inputValue: string, callback: any): void => {
    customFetch
      .get<IUsersResponse>('/chats/users', {
        params: {
          type: searchType.value,
          search: inputValue,
        },
      })
      .then(({ data }) => {
        const users = data.users.map((user) => {
          return {
            ...user,
            label: user[searchType.value as keyof IUserData] || user.name,
            value: user._id,
          };
        });

        callback(users);
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadOptionsDebounced = useCallback(debounce(loadOptions), [searchType]);

  // * Context for getting Refetch Chats Function
  const { fetchChats } = useChatsContext();
  const queryClient = useQueryClient();

  // * Dispatch and Navigate for Checking If user is on a Particular Chat then redirect it to new one
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // * Mutation for Adding Chat
  const { mutate: createNewChat, isPending } = useMutation({
    mutationKey: ['add-chat'],
    mutationFn: ({ receiverId }: { receiverId: string }) => customFetch.post<IChatCreation>('/chats', { receiverId })
  })

  // * Add Chat Click Handler
  // TODO: Need to Handle the edge when API returns successful for trying to create an existing chat again
  const handleAddChat = () => {
    if(!selectedUser) return toast.error('Please select a user.')

    createNewChat({ receiverId: selectedUser._id }, {
      onSuccess({ data }) {
        handleToggle()
        queryClient.invalidateQueries({ queryKey: ['all-chats'] });
        fetchChats && fetchChats();
        dispatch(setSelectedChat(data.chat))
        toast.success(data.message + ' 🚀')
        navigate(`/chats/${data.chat._id}`)
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError(error: any) {
        toast.error(error?.response?.data?.message || error.message)
      },
    })
  }

  // * Cancel Handler
  const handleCancel = () => {
    handleSearchType(searchTypes[0]);
    setSelectedUser(null)
    handleToggle();
  }

  return (
    <>
      <li onClick={handleToggle} className="chat-menu-item cursor-pointer">
        <p className="text-xl md:text-2xl">Create Chat</p>
        <button className="btn btn-circle btn-outline btn-accent btn-lg">
          <RiChatNewFill className="text-4xl" />
        </button>
      </li>

      <Modal id="create-chat" isOpen={isOpen} onClose={handleToggle}>
        <Modal.Header onClose={handleToggle}>Create Chat</Modal.Header>
        <Modal.Body className="mt-4 grid gap-4 md:grid-cols-3 md:items-end pb-4 border-b-[1px] border-b-white border-opacity-30">
          <CustomSelect
            key={JSON.stringify(searchType)}
            placeholder="Search User..."
            isAsync
            loadOptions={loadOptionsDebounced}
            setValues={handleUserSelect}
            containerClasses="col-span-full order-1 md:col-span-2"
            isClearable
          />
          <div className="flex md:flex-col justify-self-end md:justify-self-auto items-center md:items-start gap-4 md:gap-2">
            <label className="label py-0">Search Using :</label>
            <CustomSelect
              placeholder="Search For..."
              setValues={handleSearchType}
              options={searchTypes}
              defaultValue={searchType}
              containerClasses="col-span-full md:w-full"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex mt-4 justify-end gap-4">
            <CustomBtn
              type="reset"
              clickHandler={handleCancel}
              classes="btn btn-outline btn-white rounded-md text-xl"
              text="Cancel"
              icon={<ImCross />}
              isDisabled={isPending}
            />
            <CustomBtn
              type="button"
              classes="btn btn-accent rounded-md text-xl"
              clickHandler={handleAddChat}
              text="Add Chat"
              icon={<IoIosAdd className='text-4xl' />}
              loadingText='Creating New Chat...'
              isLoading={isPending}
            />
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateChat;
