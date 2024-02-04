import './App.scss';

// TODO Make Login, Register, Profile Pages Lazy Load

// * RQ
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
  VerfiyEmail,
  ForgotPassword,
  ResetPassword,
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
// import { chatsLoader } from "./Pages/ChatsContainer/ChatsContainer";

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
        // loader: chatsLoader(queryClient),
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
    element: <VerfiyEmail />,
    errorElement: <Error />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    errorElement: <Error />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
