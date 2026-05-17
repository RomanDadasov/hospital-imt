import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { scheduleRefresh, stopRefresh } from "./utils/axios";
import useTokenStore from "./stores/tokenStore";

function App() {
  const { accessToken } = useTokenStore();

  useEffect(() => {
    if (accessToken) {
      scheduleRefresh(accessToken);
    }

    return () => stopRefresh();
  }, [accessToken]);

  return <AppRouter />;
}

export default App;