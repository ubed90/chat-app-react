import React, { HTMLAttributes, PropsWithChildren, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CustomBtn } from '..';
import { IoClose } from 'react-icons/io5';
import './Modal.scss';
import useMountTransition from '../../utils/hooks/useMountTransition';

type ModalHelperComponents = {
  Header: React.FC<{
    children?: React.ReactNode;
    onClose?(): void;
  }>;
  Body: React.FC<{
    className?: string;
    children?: React.ReactNode;
  } & HTMLAttributes<HTMLDivElement>>;
  Footer: React.FC<{
    className?: string;
    children?: React.ReactNode;
  }>;
};

function createPortalRoot(id: string) {
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', `modal-root_${id}`);

  return modalRoot;
}

type ModalProps = {
  id: string;
  isOpen: boolean;
  onClose(): void;
  className?: string;
  closeOnBackdrop?: boolean;
  disableCloseOnEscape?: boolean;
};

const Modal: React.FC<ModalProps & PropsWithChildren> &
  ModalHelperComponents = ({
  id = 'common',
  isOpen,
  onClose,
  children,
  className,
  closeOnBackdrop = true,
  disableCloseOnEscape = false
}) => {
  const bodyRef = useRef<HTMLBodyElement>(document.querySelector('body')!);
  const portalExists = useRef(document.getElementById('modal-root'));
  const portalRootRef = useRef(
    document.getElementById(`modal-root_${id}`) || createPortalRoot(id)
  );

  const isTransitioning = useMountTransition({
    isMounted: isOpen,
    mountDelay: 500,
  });

  //* Append portal root on mount
  // * Delete Portal root on unmount as well
  useEffect(() => {
    !portalExists.current && bodyRef.current.appendChild(portalRootRef.current);

    const bodyEl = bodyRef.current;

    const portalRoolEL = portalRootRef.current;

    return () => {
      bodyEl.style.overflow = '';
      bodyEl.removeChild(portalRoolEL);
    };
  }, [portalExists]);

  // * Prevent page scrolling when the drawer is open
  useEffect(() => {
    const updatePageScroll = () => {
      if (isOpen) {
        bodyRef.current.style.overflow = 'hidden';
      } else {
        bodyRef.current.style.overflow = '';
      }
    };

    updatePageScroll();
  }, [isOpen]);

  // * Enable Drawer to get closed with Escape
  useEffect(() => {
    if(disableCloseOnEscape) return;

    const onKeyPress = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) window.addEventListener('keyup', onKeyPress);

    return () => {
      window.removeEventListener('keyup', onKeyPress);
    };
  }, [disableCloseOnEscape, isOpen, onClose]);

  if (!isTransitioning && !isOpen) return null;

  return ReactDOM.createPortal(
    <section
      aria-hidden={isOpen ? 'false' : 'true'}
      className={`custom-modal ${isTransitioning ? 'in' : ''} ${
        isOpen ? 'open' : ''
      }`}
    >
      <div onClick={() => {
        if(!closeOnBackdrop) return;

        onClose();
      }} className="custom-modal-backdrop"></div>
      <div
        className={`custom-modal-content border-[1px] border-white rounded-xl p-4 ${
          className && className
        }`}
      >
        {children}
      </div>
    </section>,
    portalRootRef.current
  );
};

const ModalHeader: React.FC<{ onClose?(): void } & PropsWithChildren> = ({
  children,
  onClose,
}) => {
  return (
    <header className="custom-modal-header w-full flex justify-between items-center pb-4 border-b-[1px] border-b-white border-opacity-30">
      <h2 className="text-4xl text-white truncate">{children}</h2>
      <CustomBtn
        type="button"
        classes="btn-outline btn-white border-white text-white hover:bg-white hover:text-black hover:border-transparent rounded-lg"
        icon={<IoClose className="text-4xl" />}
        clickHandler={onClose && onClose}
      />
    </header>
  );
};

const ModalBody: React.FC<{ className?: string } & PropsWithChildren & HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={`custom-modal-body ${className && className}`} {...rest}>
      {children}
    </div>
  );
};

const ModalFooter: React.FC<{ className?: string } & PropsWithChildren> = ({
  className,
  children,
}) => {
  return (
    <footer className={`custom-modal-footer ${className && className}`}>
      {children}
    </footer>
  );
};

Modal.Header = ModalHeader;

Modal.Body = ModalBody;

Modal.Footer = ModalFooter;

export default Modal;
