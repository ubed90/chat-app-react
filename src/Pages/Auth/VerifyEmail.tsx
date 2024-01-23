import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import customFetch from '../../utils/customFetch';
import { ImSad2 } from 'react-icons/im';
import { MdVerified } from 'react-icons/md';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const { email, token } = Object.fromEntries(searchParams.entries());

  const {
    data: response,
    error,
    isError,
    isLoading,
  } = useQuery<{ status: string; message: string }>({
    queryKey: ['verify-email'],
    queryFn: () =>
      customFetch.post('/auth/verify-email', null, {
        params: { email, token },
      }),
  });

  if (isLoading)
    return (
      <section className="px-4 w-full h-full flex flex-col gap-y-8 items-center justify-center">
        <span className="loading loading-bars loading-lg text-accent"></span>
        <h5 className="text-2xl md:text-4xl text-accent">
          Please wait you account is being activated...
        </h5>
      </section>
    );

  if (isError)
    return (
      <section className="px-4 w-full h-full flex flex-col gap-y-8 items-center justify-center">
        <ImSad2 className="text-7xl" />
        <h5 className="text-2xl md:text-4xl text-accent">
          {response?.message ||
            error.message ||
            'There was some error verifying your account...'}
        </h5>
        <p className="text-lg md:text-2xl tracking-wider">{error.message}</p>
      </section>
    );

  return (
    <section className="px-4 w-full h-full flex flex-col gap-y-8 items-center justify-center">
      <MdVerified className="text-7xl text-accent" />
      <h5 className="text-2xl md:text-4xl text-accent">
        {response?.message || 'Voila your account activated successfully.'}
      </h5>
      <Link
        to="/login"
        className="btn btn-lg btn-outline btn-secondary rounded-xl text-2xl"
      >
        Login
      </Link>
    </section>
  );
};

export default VerifyEmail;
