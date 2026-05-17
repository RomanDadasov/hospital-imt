import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./i18n/index.js";
import { scheduleRefresh } from "./utils/axios";
import useTokenStore from "./stores/tokenStore";
import { ToastProvider } from "./context/ToastContext";

const token = useTokenStore.getState().accessToken;
if (token) scheduleRefresh(token);

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <App />
  </ToastProvider>
)