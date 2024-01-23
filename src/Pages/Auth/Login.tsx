import { Store } from '@reduxjs/toolkit';
import { CustomForm, FormInput } from '../../Components';
import { RootState } from '../../Store';
import { ActionFunction, Link, useNavigate } from 'react-router-dom';
import { loginUserAPI } from '../../features/user';
import { useSelector } from 'react-redux';

export const loginAction =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (store: Store<RootState , any>): ActionFunction =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    store.dispatch(
      loginUserAPI({
        email: data.email as string,
        password: data.password as string,
      })
    );

    return null;
  };

const Login = () => {
  const { user } = useSelector((state: RootState) => state.user)

  const navigate = useNavigate();

  if(user) navigate('/')

  return (
    <main className="app-container">
      <section className="card w-full p-9 bg-primary bg-opacity-10 rounded-xl">
        <h1 className="card-title text-5xl lg:text-7xl">Login</h1>
        <div className="divider divider-primary"></div>
        <CustomForm method="POST" buttonText="Login" className="grid">
          {() => (
            <>
              <FormInput
                name="email"
                placeholder="Enter your email"
                type="email"
                label="Email"
                size="input-md md:input-lg"
                borderRadius="rounded-full"
                required
              />
              <FormInput
                name="password"
                placeholder="Enter password"
                type="password"
                label="Password"
                size="input-md md:input-lg"
                borderRadius="rounded-full"
                required
              />
            </>
          )}
        </CustomForm>
        <footer className="mt-5 flex flex-col-reverse gap-y-2 md:flex-row w-full justify-between items-center">
          <h4 className="text-xl md:text-2xl">
            Don't have an account yet ?{' '}
            <Link
              className="text-primary underline underline-offset-4"
              to="/register"
            >
              Register Now
            </Link>
          </h4>
          <Link
            className="text-xl md:text-2xl text-accent hover:underline underline-offset-4 transition-all"
            to="/forgot-password"
          >
            Forgot Password ?
          </Link>
        </footer>
      </section>
    </main>
  );
};

export default Login;
