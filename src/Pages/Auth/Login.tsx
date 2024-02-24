/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Store } from '@reduxjs/toolkit';
import { CustomBtn, CustomForm, FormInput } from '../../Components';
import { RootState, useAppDispatch } from '../../Store';
import { ActionFunction, Link, Navigate } from 'react-router-dom';
import { loginUser, loginUserAPI } from '../../features/user';
import { useSelector } from 'react-redux';
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../../utils/firebase.config';
import { toast } from 'react-toastify';
import customFetch from '../../utils/customFetch';
import { IUserData } from '../../models/user.model';

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
  const dispatch = useAppDispatch();

  const handleLoginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);
      const { data } = await customFetch.post<{
        status: string;
        user: IUserData;
        message?: string;
      }>('/auth/auto-login', { email: user.email });
      
      dispatch(loginUser({ user: data.user }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  if(user) return <Navigate to='/chats' />;

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
                //@ts-expect-error
                // Custom Prop size is conflicting with Input Intrinsic Attr
                // TODO: Need to change the name of the prop size
                size="input-md md:input-lg"
                borderRadius="rounded-full"
                required
                autoComplete="off"
              />
              <FormInput
                name="password"
                placeholder="Enter password"
                type="password"
                label="Password"
                //@ts-expect-error
                // Custom Prop size is conflicting with Input Intrinsic Attr
                size="input-md md:input-lg"
                borderRadius="rounded-full"
                required
                autoComplete="off"
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
      <div className="divider px-20 md:px-40">OR</div>
      <CustomBtn
        text="Login with Google"
        classes="btn-neutral btn-lg self-center text-2xl rounded-xl flex-row-reverse gap-4"
        icon={<FcGoogle className="text-4xl" />}
        clickHandler={handleLoginWithGoogle}
      />
    </main>
  );
};

export default Login;
