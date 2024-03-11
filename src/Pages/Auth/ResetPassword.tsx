import { useMutation } from '@tanstack/react-query';
import { Form, Link, useSearchParams } from 'react-router-dom';
import customFetch from '../../utils/customFetch';
import { MdVerified } from 'react-icons/md';
import { AxiosError } from 'axios';
import { FormInput, CustomBtn } from '../../Components';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();

  const { email, token } = Object.fromEntries(searchParams.entries());

  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
    data: response,
  } = useMutation<
    { message: string; status?: string },
    AxiosError<{ message: string; status?: string }>,
    { password: string; email: string; token: string }
  >({
    mutationKey: ['reset-password'],
    mutationFn: async ({ password }) => {
      const { data } = await customFetch.post<{
        message: string;
        status?: string;
      }>('/auth/reset-password', { password, email, token });

      return data;
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const { password } = data;

    if (!password || String(password).trim() === '')
      return toast.error('Password cannot be empty.');

    resetPassword(
      {
        password: password as string,
        email,
        token
      },
      {
        onError: (error) => {
          toast.error(error.response?.data.message);
        },
      }
    );
  };

  if (isPending)
    return (
      <section className="px-4 w-full h-full flex flex-col gap-y-8 items-center justify-center">
        <span className="loading loading-bars loading-lg text-accent"></span>
        <h5 className="text-2xl md:text-4xl text-accent">
          Please wait your request is being processed...
        </h5>
      </section>
    );

  if (isSuccess)
    return (
      <section className="px-4 w-full h-full flex flex-col gap-y-6 items-center justify-center">
        <MdVerified className="text-7xl text-accent" />
        <h5 className="text-2xl md:text-4xl text-accent">
          {response.message || 'Voila! Your password is reset suucessfully.'}
        </h5>
        <Link
          to="/login"
          className="btn btn-lg btn-outline btn-wide btn-secondary rounded-xl text-2xl"
        >
          Login
        </Link>
      </section>
    );

  return (
    <main className="app-container">
      <section className="card w-full p-9 bg-primary bg-opacity-10 rounded-xl">
        <h1 className="card-title text-5xl lg:text-7xl">Reset Password</h1>
        <div className="divider divider-primary"></div>
        <Form method="POST" onSubmit={handleSubmit}>
          <FormInput
            name="password"
            type="password"
            placeholder="eg. Password@1234"
            label="New Password"
            customClasses="input-md md:input-lg"
            borderRadius="rounded-xl"
            required
          />
          <CustomBtn
            loadingText="loading..."
            classes="btn-secondary btn-lg btn-block text-xl md:text-2xl mt-5"
            text="Reset Password"
            type="submit"
          />
        </Form>
      </section>
    </main>
  );
};

export default ResetPassword;
