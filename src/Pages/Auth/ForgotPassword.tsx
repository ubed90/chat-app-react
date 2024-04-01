import React from 'react';
import { Form, Link } from 'react-router-dom';
import { CustomBtn, FormInput } from '../../Components';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import customFetch from '../../utils/customFetch';
import { MdVerified } from 'react-icons/md';
import { AxiosError } from 'axios';

const ForgotPassword = () => {
  const {
    mutate: sendForgotPasswordRequest,
    isPending,
    isSuccess,
    data: response,
  } = useMutation<
    { message: string; status?: string },
    AxiosError<{ message: string; status?: string }>,
    { email: string }
  >({
    mutationKey: ['forgot-password'],
    mutationFn: async ({ email }) => {
      const { data } = await customFetch.post<{
        message: string;
        status?: string;
      }>('/auth/forgot-password', { email });

      return data;
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const { email } = data;

    if (!email || String(email).trim() === '')
      return toast.error('Please enter valid email');

    sendForgotPasswordRequest(
      {
        email: email as string,
      },
      {
        onError: (error) => {
          toast.error(error.response?.data.message);
        },
      }
    );
  };

  if (isSuccess)
    return (
      <section className="px-4 w-full h-full flex flex-col gap-y-6 items-center justify-center">
        <MdVerified className="text-7xl text-accent" />
        <h5 className="text-2xl md:text-4xl text-accent">
          {response.message || 'Voila! Your request submitted successfully.'}
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
        <h1 className="card-title text-5xl lg:text-7xl">Forgot Password</h1>
        <div className="divider divider-primary"></div>
        <Form method="POST" onSubmit={handleSubmit}>
          <FormInput
            name="email"
            type="email"
            placeholder="eg. johnDoe@email.com"
            label="Email"
            customClasses="input-md md:input-lg"
            borderRadius="rounded-xl"
            required
          />
          <CustomBtn
            loadingText="loading..."
            classes="btn-secondary btn-lg btn-block text-xl md:text-2xl mt-5"
            text="Submit"
            type="submit"
            isLoading={isPending}
            isDisabled={isPending}
          />
        </Form>
      </section>
    </main>
  );
};

export default ForgotPassword;
