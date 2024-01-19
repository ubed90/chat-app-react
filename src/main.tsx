import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'normalize-css';
import './index.scss'

// * React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import { Provider } from 'react-redux';
import { store } from './Store.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
    <ToastContainer position="top-center" />
  </Provider>
);
