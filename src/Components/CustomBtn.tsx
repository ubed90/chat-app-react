import React from 'react';

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
}

const CustomBtn: React.FC<CustomBtnProps> = ({
  clickHandler = () => {},
  text = 'Submit',
  classes,
  isLoading = false,
  loadingText = 'Sending...',
  type = 'button',
  isDisabled = false
}) => {
  const navigation = useNavigation();

  const isSubmitting: boolean = type === 'submit' && navigation.state === 'submitting';

  return (
    <button
      type={type}
      className={`btn ${classes}`}
      disabled={isDisabled || isSubmitting || isLoading}
      onClick={clickHandler}
    >
      {isSubmitting || isLoading ? (
        <>
          <span className={`loading loading-spinner`}></span>
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default CustomBtn;
