import { ActionFunction, Link } from 'react-router-dom';
import { CustomForm, FormInput } from '../../Components';
import { ValidatorProps } from '../../Components/CustomForm/CustomForm';
import { toast } from 'react-toastify';
import { Store } from '@reduxjs/toolkit';
import { RootState } from '../../Store';

// * Register Action
export const registerAction =
  (store: Store<RootState>): ActionFunction =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    console.log(data);
    return null;
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
  return (
    <main className="app-container">
      <section className="card w-full p-9 bg-primary bg-opacity-10 rounded-xl">
        <h1 className="card-title text-5xl lg:text-7xl">Register</h1>
        <div className="divider divider-primary"></div>
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
                size="input-md md:input-lg"
                borderRadius="rounded-full"
                required
              />
              <FormInput
                name="email"
                placeholder="eg. johndoe@email.com"
                type="email"
                label="Email"
                size="input-md md:input-lg"
                borderRadius="rounded-full"
                required
              />
              <FormInput
                name="username"
                placeholder="eg. johnDoe123"
                type="text"
                label="Username"
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
                errors={errors}
              />
              <FormInput
                name="confirmPassword"
                placeholder="Re-Enter your password"
                type="password"
                label="Confirm Password"
                size="input-md md:input-lg"
                borderRadius="rounded-full"
                required
                errors={errors}
              />
            </>
          )}
        </CustomForm>
        <h4 className="text-xl md:text-2xl text-center mt-7">
          Already Registered ?{' '}
          <Link
            className="text-primary underline underline-offset-4"
            to="/login"
          >
            Login
          </Link>
        </h4>
      </section>
    </main>
  );
};

export default Register;
