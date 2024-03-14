import React, { useState } from 'react';
import { FormInput } from '..';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';

let ViewParticipants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { selectedChat } = useSelector((state: RootState) => state.chat);

  const handleChange = ({ value }: { value: string }) => {
    setSearchTerm(value);
  };

  const filteredUsers = searchTerm ? selectedChat!.users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : selectedChat!.users;

  return (
    <section className="view-participants flex flex-col gap-4">
      <FormInput
        type="text"
        name="search"
        label="Search"
        required
        placeholder="Search for Name..."
        customClasses='input-lg !text-xl'
        value={searchTerm}
        handleChange={handleChange}
        marginRequired={false}
      />

      <ul className="view-participants-list menu menu-lg bg-neutral flex-nowrap rounded-lg py-4 text-2xl max-h-[10.5rem] overflow-hidden overflow-y-auto">
        {filteredUsers.length === 0 && <li>No User Found</li>}
        {filteredUsers.length > 0 &&
          filteredUsers.map((user) => (
            <li
              className="view-participants-list-item capitalize p-2 text-white hover:bg-gray-400 cursor-pointer rounded-md"
              key={user._id}
            >
              {user.name}
            </li>
          ))}
      </ul>
    </section>
  );
};

ViewParticipants = React.memo(ViewParticipants);

export default ViewParticipants;
