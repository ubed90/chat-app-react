import React, { ButtonHTMLAttributes, ReactNode } from 'react';

// * Checkg for the State of Whether the form is being submitted or not
import { useNavigation } from 'react-router-dom';

interface CustomBtnProps {
  clickHandler?(): void;
  classes?: string;
  text?: string;
  isLoading?: boolean;
  loadingText?: string;
  type?: 'submit' | 'button' | 'reset';
  isDisabled?: boolean;
  icon?: ReactNode
}

const CustomBtn: React.FC<CustomBtnProps &  ButtonHTMLAttributes<HTMLButtonElement>> = ({
  clickHandler = () => {},
  text,
  classes,
  isLoading = false,
  loadingText = 'Sending...',
  type = 'button',
  isDisabled = false,
  icon,
  ...rest
}) => {
  const navigation = useNavigation();

  const isSubmitting: boolean = type === 'submit' && navigation.state === 'submitting';

  return (
    <button
      type={type}
      className={`btn ${classes}`}
      disabled={isDisabled || isSubmitting || isLoading}
      onClick={clickHandler}
      {...rest}
    >
      {isSubmitting || isLoading ? (
        <>
          <span className={`loading loading-spinner`}></span>
          {loadingText}
        </>
      ) : (
        text
      )}
      {icon && icon}
    </button>
  );
};

export default CustomBtn;
