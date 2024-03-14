/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from 'react-redux';
import './Profile.scss';
import { RootState, useAppDispatch } from '../../Store';
import { Form } from 'react-router-dom';
import { CustomBtn, FormInput } from '../../Components';
import { RxReset } from 'react-icons/rx';
import { RxUpdate } from 'react-icons/rx';
import { FaEdit, FaRegSave, FaTrashAlt } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import { useState } from 'react';
import Modal from '../../Components/Modal/Modal';
import { toast } from 'react-toastify';
import { IUserData } from '../../models/user.model';
import { updateUser } from '../../features/user';
import { ImCross } from 'react-icons/im';

const SUPPORTED_FILE_TYPES = ['jpg', 'jpeg', 'png'];

type ProfileResponse = {
  status: string,
  message: string,
  user: IUserData,
}


const Profile = () => {
  const { user } = useSelector((state: RootState) => state.user);
  
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // const [profileState, setProfileState] = useState<IUserData>(user as IUserData);

  // * Profile Update Mutation
  const { mutate: updateProfile, isPending } = useMutation({
    mutationKey: ['update-profile', user?._id],
    mutationFn: (data: {
      name: string;
      enail: string;
      username: string;
      phoneNumber: string
    }) =>
      customFetch.patch<ProfileResponse>(
        `/auth/update-profile/${user?._id}`,
        data
      ),
  });

  // * Picture Delete Mutation
  const { mutate: deleteProfilePicture, isPending: isProfileDeleting } = useMutation({
    mutationKey: ['delete-profile-picture'],
    mutationFn: (id: string) =>
      customFetch.delete<ProfileResponse>(
        `/auth/update-profile/${id}`
      ),
  });

  const handleDeleteProfilePicture = () => {
    deleteProfilePicture(user?._id as string, {
      onSuccess({ data }) {
        dispatch(updateUser({ user: data.user }));
        toast.success(data.message + ' 🚀')
      },
      onError(error) {
        toast.error(error.message);
      }
    })
  }

  // * Update Profile Picture
  const { mutate: updateProfilePicture, isPending: isProfileUpdating } =
    useMutation({
      mutationKey: ['update-profile-picture'],
      mutationFn: (data: FormData) =>
        customFetch.post<ProfileResponse>(`/auth/update-profile/${user?._id}`, data),
    });

  const handleUpdateProfilePicture = () => {
    if(!file) return toast.error('Please upload a file');

    const formData = new FormData();
    formData.append('profilePicture', file);

    updateProfilePicture(formData, {
      onSuccess({ data }) {
        dispatch(updateUser({ user: data.user }));
        toast.success(data.message + ' 🚀');
        setFile(null);
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  }

  const handleUpdateCancel = () => {
    if(file) setFile(null);

    handleToggle();
  }

  // * Dispatch For Updating User state in Redux
  const dispatch = useAppDispatch();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const processedData = Object.fromEntries(data.entries())

    updateProfile(processedData as any, {
      onSuccess({ data }) {
        dispatch(updateUser({ user: data.user }))
        toast.success('Profile Update Successfully 🚀')
      },
      onError(error: any) {
        console.log(error);
        toast.error(error?.response?.data?.message || error.message);
      }
    })
  }

  // * Image Upload
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(!event.target.files) return;
    const uploadedFile = event.target.files[0];

    if(!uploadedFile.type.startsWith('image/') && !SUPPORTED_FILE_TYPES.includes(uploadedFile.type.replace('Image/', ''))) {
      return toast.error('Only jpg / jpeg / png files are supported')
    }

    const maxSize = 1024 * 1024 * 2;

    if(uploadedFile.size > maxSize) {
      return toast.error('Max Image size is 2MB');
    }

    setFile(uploadedFile);
  };

  return (
    <section className="profile mx-auto mt-10">
      <div className="profile-card border-[1px] border-neutral border-opacity-70 rounded-xl overflow-hidden">
        <header className="profile-card-header bg-neutral relative">
          {user?.profilePicture ? (
            <div className="avatar absolute top-full left-2/4 -translate-x-2/4 -translate-y-2/4">
              <div className="w-52 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={user.profilePicture} className="!object-contain" />
              </div>
            </div>
          ) : (
            <div className="avatar absolute top-full left-2/4 -translate-x-2/4 -translate-y-2/4 placeholder">
              <div className="bg-secondary text-neutral-content rounded-full w-52 ring ring-accent ring-offset-base-100 ring-offset-2">
                <span className="text-6xl uppercase">
                  {user?.name.substring(0, 2)}
                </span>
              </div>
            </div>
          )}

          <div className="profile-card-header-action absolute right-5 top-5">
            <CustomBtn
              type="button"
              classes="btn-circle btn-accent btn-lg"
              icon={<FaEdit className="text-3xl" />}
              clickHandler={handleToggle}
            />

            <Modal
              id="edit-profile-picture"
              isOpen={isOpen}
              onClose={handleToggle}
            >
              <Modal.Header onClose={handleToggle}>
                Edit Profile Picture
              </Modal.Header>
              <Modal.Body className="pt-6 flex flex-col items-center gap-8">
                {user?.profilePicture ? (
                  <div className="avatar">
                    <div className="w-52 rounded-full">
                      <img src={user.profilePicture} />
                    </div>
                  </div>
                ) : (
                  <label
                    className="avatar placeholder cursor-pointer"
                    htmlFor="profile-picture-upload"
                  >
                    <div className="bg-secondary text-neutral-content rounded-full w-52 ring ring-accent ring-offset-base-100 ring-offset-2">
                      <span className="text-6xl uppercase">
                        {user?.name.substring(0, 2)}
                      </span>
                    </div>
                  </label>
                )}
                <div className="actions flex flex-col-reverse sm:flex-row gap-4">
                  <CustomBtn
                    type="button"
                    text="Delete Profile Picture"
                    clickHandler={handleDeleteProfilePicture}
                    icon={<FaTrashAlt />}
                    classes="btn-outline btn-error rounded-lg text-xl"
                    isDisabled={!user?.profilePicture || isProfileDeleting}
                    isLoading={isProfileDeleting}
                    loadingText="Deleting..."
                  />
                  <input
                    id="profile-picture-upload"
                    type="file"
                    className="file-input file-input-bordered rounded-lg w-full max-w-xs"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={isProfileDeleting}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex mt-4 justify-end gap-4">
                  <CustomBtn
                    type="reset"
                    clickHandler={handleUpdateCancel}
                    classes="btn btn-outline btn-white rounded-md text-xl"
                    text="Cancel"
                    icon={<ImCross />}
                    isDisabled={isProfileUpdating}
                  />
                  <CustomBtn
                    type="button"
                    classes="btn btn-accent rounded-md text-xl"
                    clickHandler={handleUpdateProfilePicture}
                    text="Update"
                    icon={<FaRegSave className="text-4xl" />}
                    loadingText="Updating..."
                    isLoading={isProfileUpdating}
                    isDisabled={!file}
                  />
                </div>
              </Modal.Footer>
            </Modal>
          </div>
        </header>

        <div className="profile-card-body px-4 mt-28">
          <Form id="profile-form" method="POST" onSubmit={handleSubmit}>
            <FormInput
              type="text"
              name="name"
              label="Name"
              required
              placeholder="eg. John Doe"
              customClasses="!text-xl md:input-lg !input-bordered focus:outline-accent !py-6"
              defaultValue={user?.name}
            />
            <FormInput
              type="email"
              name="email"
              label="email"
              required
              placeholder="eg. johnDoe@gmail.com"
              customClasses="!text-xl md:input-lg !input-bordered focus:outline-accent !py-6"
              defaultValue={user?.email}
            />
            <FormInput
              type="text"
              name="username"
              label="username"
              required
              placeholder="eg. johndoe123"
              customClasses="!text-xl md:input-lg !input-bordered focus:outline-accent !py-6"
              defaultValue={user?.username}
            />
            <FormInput
              type="text"
              name="phoneNumber"
              label="Phone Number"
              maxLength={10}
              minLength={10}
              placeholder="eg. 8987876543"
              customClasses="!text-xl md:input-lg !input-bordered focus:outline-accent !py-6"
              defaultValue={user?.phoneNumber}
            />
          </Form>
        </div>

        <footer className="profile-card-footer p-4 flex gap-4">
          <CustomBtn
            classes="btn-outline btn-accent rounded-xl text-2xl btn-lg flex-1"
            text="Reset"
            icon={<RxReset />}
            type="reset"
            form="profile-form"
            isLoading={isPending}
            loadingText="Updating..."
          />
          <CustomBtn
            classes="btn-accent rounded-xl text-2xl btn-lg flex-1"
            text="Update"
            icon={<RxUpdate />}
            type="submit"
            form="profile-form"
            isLoading={isPending}
            loadingText="Updating..."
          />
        </footer>
      </div>
    </section>
  );
};

export default Profile;
