/* eslint-disable @typescript-eslint/no-explicit-any */
import { RiChatNewFill } from 'react-icons/ri';
import Modal from './Modal/Modal';
// import { OptionsOrGroups, GroupBase } from 'react-select';
import customFetch from '../utils/customFetch';
import { IUserData, IUsersResponse } from '../models/user.model';
import CustomSelect from './CustomSelect';
import { ImCross } from 'react-icons/im';
import { IoIosAdd } from 'react-icons/io';
import { CustomBtn } from '.';
import createChatHOC from './createChatHOC';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadOptions = (searchType: { label: string; value: string }) => (
  inputValue: string,
  callback: any
): void => {
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

type ChatCreationVariables = {
  receiverId: string;
};

type CreateChatProps<T> = {
  searchTypes: {
    label: string;
    value: string;
  }[];
  isOpen: boolean;
  handleToggle: () => void;
  searchType: {
    label: string;
    value: string;
  };
  loadOptionsDebounced: (...args: any[]) => void;
  handleSelect: (data: T) => void;
  handleSearchType: (searchType: { label: string; value: string }) => void;
  handleCancel: () => void;
  handleAddChat: () => void;
  isPending: boolean;
  name: string;
  handleName: (value: string) => void;
};

const CreateChat: React.FC<CreateChatProps<IUserData>> = ({
  searchTypes,
  searchType,
  handleAddChat,
  handleCancel,
  handleSearchType,
  handleSelect,
  handleToggle,
  isOpen,
  isPending,
  loadOptionsDebounced,
}) => {
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
            setValues={handleSelect}
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
              icon={<IoIosAdd className="text-4xl" />}
              loadingText="Creating New Chat..."
              isLoading={isPending}
            />
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default createChatHOC<IUserData, ChatCreationVariables>({
  createGroup: false,
  loadOptions,
})(CreateChat);
