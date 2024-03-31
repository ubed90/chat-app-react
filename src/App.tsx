import './App.scss';

// * RQ
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      retry: 3,
      retryDelay: 1000,
    },
  },
});

//* RR 6+
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import {
  HomeLayout,
  Error,
  ChatsContainer,
  Chat,
  NoChatSelected,
} from './Pages';
import { AuthGuard, ErrorElement } from './Components';
import { store } from './Store';

// * Actions
import { loginAction } from './Pages/Auth/Login';
import { registerAction } from './Pages/Auth/Register';

// * Loader
import { ChatLoader } from './Pages/Chat/Chat';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/chats" />,
  },
  {
    path: '/chats',
    element: (
      <AuthGuard>
        <HomeLayout />
      </AuthGuard>
    ),
    errorElement: <Error />,
    children: [
      {
        path: '',
        element: <ChatsContainer />,
        errorElement: <ErrorElement />,
        children: [
          {
            path: '',
            element: <NoChatSelected />,
            errorElement: <ErrorElement />,
          },
          {
            path: ':id',
            element: <Chat />,
            errorElement: <ErrorElement />,
            loader: ChatLoader(queryClient, store),
          },
        ],
      },
      {
        path: 'profile',
        lazy: async () => {
          const profileComponent = await import('./Pages/Profile/Profile');

          return { Component: profileComponent.default };
        },
        errorElement: <Error />,
      },
      {
        path: 'change-password',
        lazy: async () => {
          const changePasswordComponent = await import(
            './Pages/Profile/ChangePassword'
          );

          return { Component: changePasswordComponent.default };
        },
        errorElement: <Error />,
      },
    ],
  },
  {
    path: '/login',
    lazy: async () => {
      const loginComponent = await import('./Pages/Auth/Login');

      return { Component: loginComponent.default };
    },
    errorElement: <Error />,
    action: loginAction(store),
  },
  {
    path: '/register',
    lazy: async () => {
      const registerComponent = await import('./Pages/Auth/Register');

      return { Component: registerComponent.default };
    },
    errorElement: <Error />,
    action: registerAction,
  },
  {
    path: '/verify-email',
    lazy: async () => {
      const VerifyEmailComponent = await import('./Pages/Auth/VerifyEmail');

      return { Component: VerifyEmailComponent.default };
    },
    errorElement: <Error />,
  },
  {
    path: '/forgot-password',
    lazy: async () => {
      const ForgotPasswordComponent = await import(
        './Pages/Auth/ForgotPassword'
      );

      return { Component: ForgotPasswordComponent.default };
    },
    errorElement: <Error />,
  },
  {
    path: '/reset-password',
    lazy: async () => {
      const ResetPasswordComponent = await import('./Pages/Auth/ResetPassword');

      return { Component: ResetPasswordComponent.default };
    },
    errorElement: <Error />,
  },
  {
    path: '/*',
    element: <Error />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
    </QueryClientProvider>
  );
}

export default App;
