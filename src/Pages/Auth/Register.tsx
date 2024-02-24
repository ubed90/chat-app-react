/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionFunction, Link, Navigate, useActionData } from 'react-router-dom';
import { CustomBtn, CustomForm, FormInput } from '../../Components';
import { ValidatorProps } from '../../Components/CustomForm/CustomForm';
import { toast } from 'react-toastify';
import customFetch from '../../utils/customFetch';
import { ImCheckboxChecked } from 'react-icons/im';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../../utils/firebase.config';
import { IUserData } from '../../models/user.model';
import { RootState, useAppDispatch } from '../../Store';
import { loginUser } from '../../features/user';
import { useSelector } from 'react-redux';

// * Register Action
export const registerAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const { data: response } = await customFetch.post<{
      status: string;
      message: string;
    }>('/auth/register', data);

    if (response.status !== 'success') {
      toast.warning(response.message);
      return { isError: true };
    }
    return { isError: false, message: response.message };
  } catch (error: any) {
    toast.error(error.response.data.message);
    return { isError: true };
  }
};

// * Register Custom Validion
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/g;

const customValidator = ({ formValues }: ValidatorProps) => {
  const errors: {
    [key: string]: string;
  } = {};

  if (
    formValues.email === '' ||
    formValues.password === '' ||
    formValues.firstName === '' ||
    formValues.lastName === '' ||
    formValues.confirmPassword === ''
  ) {
    toast.error('Please fill out all fields.');
    return errors;
  }

  const password = formValues.password as string;
  const confirmPassword = formValues.confirmPassword as string;

  if (!passwordRegex.test(password)) {
    errors['invalidPassword'] =
      'Password must contain at least 1 Uppercase, 1 Lowercase and 1 Number';
  }

  if (password !== confirmPassword) {
    errors['confirmPassword'] = 'Passwords do not match.';
  }

  return errors;
};

const Register = () => {
  const data = (useActionData() as { isError: boolean; message?: string }) || {
    isError: true,
  };

  const { user } = useSelector((state: RootState) => state.user)

  const dispatch = useAppDispatch();

  const handleRegisterWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);
      const { data: response } = await customFetch.post<{
        status: string;
        user: IUserData;
        message?: string;
      }>('/auth/register', {
        name: user.displayName,
        email: user.email,
        profilePicture: user.photoURL,
        usingProvider: true,
      });
      
      toast.success(response.message);
      dispatch(loginUser({ user: response.user }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  if(user) return <Navigate to='/chats' />

  return (
    <main className="app-container">
      <section className="card w-full p-9 bg-primary bg-opacity-10 rounded-xl">
        <h1 className="card-title text-5xl lg:text-7xl">Register</h1>
        <div className="divider divider-primary"></div>
        {data && data?.isError ? (
          <CustomForm
            method="POST"
            buttonText="Register"
            className="grid"
            validate={customValidator}
          >
            {({ errors }) => (
              <>
                <FormInput
                  name="name"
                  placeholder="eg. John Doe"
                  type="text"
                  label="name"
                  //@ts-expect-error
                  // Custom Prop size is conflicting with Input Intrinsic Attr
                  // TODO: Need to change the name of the prop size
                  size="input-md md:input-lg"
                  borderRadius="rounded-full"
                  required
                />
                <FormInput
                  name="email"
                  placeholder="eg. johndoe@email.com"
                  type="email"
                  label="Email"
                  //@ts-expect-error
                  // Custom Prop size is conflicting with Input Intrinsic Attr
                  // TODO: Need to change the name of the prop size
                  size="input-md md:input-lg"
                  borderRadius="rounded-full"
                  required
                />
                <FormInput
                  name="username"
                  placeholder="eg. johnDoe123"
                  type="text"
                  label="Username"
                  //@ts-expect-error
                  // Custom Prop size is conflicting with Input Intrinsic Attr
                  // TODO: Need to change the name of the prop size
                  size="input-md md:input-lg"
                  borderRadius="rounded-full"
                  required
                />
                <FormInput
                  name="password"
                  placeholder="Enter password"
                  type="password"
                  label="Password"
                  //@ts-expect-error
                  // Custom Prop size is conflicting with Input Intrinsic Attr
                  // TODO: Need to change the name of the prop size
                  size="input-md md:input-lg"
                  borderRadius="rounded-full"
                  required
                  errors={errors}
                />
                <FormInput
                  name="confirmPassword"
                  placeholder="Re-Enter your password"
                  type="password"
                  label="Confirm Password"
                  //@ts-expect-error
                  // Custom Prop size is conflicting with Input Intrinsic Attr
                  // TODO: Need to change the name of the prop size
                  size="input-md md:input-lg"
                  borderRadius="rounded-full"
                  required
                  errors={errors}
                />
              </>
            )}
          </CustomForm>
        ) : (
          <h6 className="text-xl md:text-2xl text-primary flex items-stretch justify-center gap-x-4">
            <ImCheckboxChecked className="text-4xl md:text-6xl" />
            {data?.message}
          </h6>
        )}
        <h4 className="text-xl md:text-2xl text-center mt-7 inline-block">
          Already Registered ?{' '}
          <Link
            className="text-primary underline underline-offset-4"
            to="/login"
          >
            Login
          </Link>
        </h4>
      </section>
      <div className="divider px-20 md:px-40">OR</div>
      <CustomBtn
        text="Register using Google"
        classes="btn-neutral btn-lg self-center text-2xl rounded-xl flex-row-reverse gap-4"
        icon={<FcGoogle className="text-4xl" />}
        clickHandler={handleRegisterWithGoogle}
      />
    </main>
  );
};

export default Register;
