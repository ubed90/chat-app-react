import { Store } from '@reduxjs/toolkit';
import { CustomForm, FormInput } from '../../Components';
import { RootState } from '../../Store';
import { ActionFunction, Link } from 'react-router-dom';

export const loginAction =
  (store: Store<RootState>): ActionFunction =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    console.log(data);
    return null;
  };

const Login = () => {
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
        <h4 className="text-xl md:text-2xl text-center mt-7">
          Don't have an account yet ? <Link className='text-primary underline underline-offset-4' to="/register">Register Now</Link>
        </h4>
      </section>
    </main>
  );
};

export default Login;
