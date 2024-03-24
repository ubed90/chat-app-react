import { ReactNode, useRef, useState } from 'react';
import { Form } from 'react-router-dom';
import CustomBtn from '../CustomBtn';

type ChildrenProps = {
  errors: { [key: string]: string };
};

export type ValidatorProps = {
  formValues: {
    [key: string]: string;
  }
};

type ICustomFormProps = {
  buttonText: string;
  className: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  children(props: ChildrenProps): ReactNode;
  validate?(props: ValidatorProps): {
    [key: string]: string;
  };
};

const CustomForm: React.FC<ICustomFormProps> = ({
  buttonText,
  className,
  method,
  children,
  validate,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getFormValues = () => {
    const formData = new FormData(formRef.current!);
    const data = Object.fromEntries(formData) as { [key: string]: string };

    return data;
  };

  return (
    <Form ref={formRef} className={className} method={method}>
      {children({ errors })}
      <CustomBtn
        type="submit"
        classes="btn-accent rounded-full flex-1 mt-2 btn-md md:btn-lg !text-2xl"
        text={buttonText}
        clickHandler={() => {
          if(!validate) return;
          const errors = validate({ formValues: getFormValues() })
          setErrors(errors);
        }}
      />
    </Form>
  );
};

export default CustomForm;
