import { HiUserGroup } from 'react-icons/hi2';
import Modal from './Modal/Modal';
import createChatHOC, { CreateChatProps, loadOptions } from './createChatHOC';
import { IUserData } from '../models/user.model';
import CustomSelect from './CustomSelect';
import { CustomBtn, FormInput } from '.';
import { ImCross } from 'react-icons/im';
import { IoIosAdd } from 'react-icons/io';

export type GroupChatCreationVariables = {
  name: string;
  participants: string[];
};

const CreateGroupChat: React.FC<CreateChatProps<IUserData[]>> = ({
  isOpen,
  handleToggle,
  searchType,
  loadOptionsDebounced,
  handleSelect,
  handleSearchType,
  searchTypes,
  name,
  handleName,
  handleAddChat,
  handleCancel,
  isPending
}) => {
  return (
    <>
      <li onClick={handleToggle} className="chat-menu-item cursor-pointer">
        <p className="text-xl md:text-2xl">Create Group</p>
        <button className="btn btn-circle btn-outline btn-accent btn-lg">
          <HiUserGroup className="text-4xl" />
        </button>
      </li>

      <Modal id="create-group-chat" isOpen={isOpen} onClose={handleToggle}>
        <Modal.Header onClose={handleToggle}>Create Group Chat</Modal.Header>
        <Modal.Body className="mt-4 grid gap-4 md:grid-cols-3 md:items-end pb-4 border-b-[1px] border-b-white border-opacity-30">
          <FormInput
            type="text"
            name="name"
            label="Group Name"
            placeholder="Enter Group Name..."
            required
            value={name}
            handleChange={handleName}
            marginRequired={false}
            customClasses="!input-bordered focus:outline-white bg-accent bg-opacity-10 !text-xl input-lg"
          />
          <CustomSelect
            key={JSON.stringify(searchType)}
            placeholder="Search User..."
            isAsync
            isMulti
            loadOptions={loadOptionsDebounced}
            setValues={handleSelect}
            containerClasses="col-span-full order-1 md:col-span-2"
            isClearable
          />
          <div className="flex flex-col justify-self-start md:justify-self-auto gap-2">
            <label className="label py-0">Search Using :</label>
            <CustomSelect
              placeholder="Search For..."
              setValues={handleSearchType}
              options={searchTypes}
              defaultValue={searchType}
              containerClasses="md:w-full"
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

export default createChatHOC<IUserData[]>({ loadOptions, isGroupChat: true })(CreateGroupChat);
