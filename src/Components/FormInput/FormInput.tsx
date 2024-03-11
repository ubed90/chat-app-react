import React, { InputHTMLAttributes, useRef } from 'react';
import './FormInput.scss';

type FormInputProps = {
  name: string;
  type: string;
  placeholder?: string;
  borderRadius?: string;
  errors?: { [key: string]: string };
  required?: boolean;
  label?: string;
  defaultValue?: string;
  value?: string;
  hideLabel?: boolean;
  customClasses?: string;
  handleChange?(handleChangeProps: { key: string; value: string }): void;
  marginRequired?: boolean;
};

const Input: React.FC<FormInputProps & InputHTMLAttributes<HTMLInputElement>> = ({
  name,
  type = 'text',
  defaultValue,
  value,
  label,
  placeholder,
  errors,
  borderRadius = 'rounded-lg',
  customClasses = '',
  required = false,
  hideLabel = false,
  handleChange = () => {},
  marginRequired = true,
  ...rest
}) => {
  const ref = useRef<HTMLInputElement | null>(null);

  if (errors) {
    const { invalidPassword, confirmPassword } = errors;

    if (invalidPassword) ref.current?.setCustomValidity(invalidPassword);

    if (confirmPassword) ref.current?.setCustomValidity(confirmPassword);
  }

  return (
    <div
      className={`form-control w-full relative md:col-span-full ${marginRequired && 'mb-7'} ${
        type === 'hidden' ? 'hidden' : ''
      }`}
    >
      {!hideLabel && (
        <label
          htmlFor={name}
          className="label text-2xl p-0 pb-1 capitalize justify-start gap-x-2"
        >
          {label || name}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={`input w-full input-primary !text-lg md:!text-2xl form-input ${borderRadius} ${customClasses}`}
        defaultValue={defaultValue}
        value={value}
        required={required}
        onChange={(event) =>
          handleChange({ key: event.target.name, value: event.target.value })
        }
        autoComplete="off"
        {...rest}
      />
      {type === 'email' && (
        <div className="label p-0 py-1 absolute -bottom-9 left-4">
          <span className="label-text-alt text-lg text-red-500">
            Invalid Email.
          </span>
        </div>
      )}
      {name === 'password' && errors && errors['invalidPassword'] && (
        <div className="label p-0 py-1 absolute -bottom-9 left-4">
          <span className="label-text-alt text-lg text-red-500">
            {errors['invalidPassword']}
          </span>
        </div>
      )}
      {name === 'confirmPassword' && errors && errors['confirmPassword'] && (
        <div className="label p-0 py-1 absolute -bottom-9 left-4">
          <span className="label-text-alt text-lg text-red-500">
            {errors['confirmPassword']}
          </span>
        </div>
      )}
    </div>
  );
};

const FormInput = React.memo(Input);

export default FormInput
