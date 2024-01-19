import './App.scss';

// * RQ
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
    },
  },
});

//* RR 6+
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { HomeLayout, Login, Register, Error } from './Pages';
import { AuthGuard } from './Components';
import { store } from './Store';

// * Actions
import { loginAction } from './Pages/Auth/Login';
import { registerAction } from './Pages/Auth/Register';

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
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <Error />,
    action: loginAction(store),
  },
  {
    path: '/register',
    element: <Register />,
    errorElement: <Error />,
    action: registerAction
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
