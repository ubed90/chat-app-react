import { RxReset, RxUpdate } from 'react-icons/rx';
import { CustomBtn, FormInput } from '../../Components';
import { Form } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import { useState } from 'react';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const {
    mutate: changePassword,
    isPending,
  } = useMutation<
    { message: string; status?: string },
    AxiosError<{ message: string; status?: string }>,
    { password: string; newPassword: string }
  >({
    mutationKey: ['change-password'],
    mutationFn: async ({ password, newPassword }) => {
      const { data } = await customFetch.post<{
        message: string;
        status?: string;
      }>('/auth/change-password', { password, newPassword });

      return data;
    },
  });

  const [changePasswordState, setChangePasswordState] = useState({
    password: '',
    newPassword: '',
  });

  const handleChange = ({ key, value }: { key: string; value: string }) => {
    setChangePasswordState({ ...changePasswordState, [key]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    changePassword(
      {
        password: changePasswordState.password,
        newPassword: changePasswordState.newPassword,
      },
      {
        onSuccess(data) {
          setChangePasswordState({ password: '', newPassword: '' });
          toast.success(data.message);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError(error: any) {
          toast.error(error?.response?.data?.message || error.message);
        },
      }
    );
  };

  return (
    <section className="profile mx-auto mt-10">
      <div className="border-[1px] border-neutral border-opacity-70 rounded-xl px-4">
        <h2 className="text-3 md:text-5xl text-accent xl pt-4">Change Password</h2>

        <div className="divider m-0"></div>

        <div className="profile-card-body pt-4">
          <Form id="change-password-form" method="POST" onSubmit={handleSubmit}>
            <FormInput
              type="password"
              name="password"
              label="Password"
              required
              placeholder="eg. Password@123"
              customClasses="!text-xl md:input-lg !input-bordered focus:outline-accent !py-6"
              value={changePasswordState.password}
              handleChange={handleChange}
            />
            <FormInput
              type="password"
              name="newPassword"
              label="New Password"
              required
              placeholder="eg. Password@123"
              customClasses="!text-xl md:input-lg !input-bordered focus:outline-accent !py-6"
              value={changePasswordState.newPassword}
              handleChange={handleChange}
            />
          </Form>
        </div>

        <footer className="profile-card-footer flex gap-4 pb-4">
          <CustomBtn
            classes="btn-outline btn-accent rounded-xl text-2xl btn-lg flex-1"
            text="Reset"
            icon={<RxReset />}
            type="reset"
            form="change-password-form"
            isLoading={isPending}
            onClick={() => setChangePasswordState({ password: '', newPassword: '' })}
          />
          <CustomBtn
            classes="btn-accent rounded-xl text-2xl btn-lg flex-1"
            text="Update"
            icon={<RxUpdate />}
            type="submit"
            form="change-password-form"
            isLoading={isPending}
            isDisabled={
              isPending ||
              !changePasswordState.password ||
              !changePasswordState.newPassword ||
              changePasswordState.password === changePasswordState.newPassword
            }
            loadingText="Updating..."
          />
        </footer>
      </div>
    </section>
  );
};

export default ChangePassword;
