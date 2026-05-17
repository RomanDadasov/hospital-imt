import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import useTokenStore from "../stores/tokenStore";

const STORAGE_KEY = "mhc_notifications";

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveToStorage = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch { }
};

export const useNotifications = () => {
  const { accessToken, role } = useTokenStore();
  const [notifications, setNotifications] = useState(() => loadFromStorage());
  const connectionRef = useRef(null);

  
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  useEffect(() => {
    if (!accessToken) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5171/hubs/notification", {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (notification) => {
      setNotifications((prev) => {
        const updated = [{ ...notification, id: Date.now() }, ...prev.slice(0, 19)];
        saveToStorage(updated);
        return updated;
      });
    });

    connection
      .start()
      .then(async () => {
        if (role) await connection.invoke("JoinGroup", role);
      })
      .catch(console.error);

    connectionRef.current = connection;
    return () => { connection.stop(); };
  }, [accessToken, role]);

  const addNotification = (notification) => {
    setNotifications((prev) => {
      const updated = [{ ...notification, id: Date.now() }, ...prev.slice(0, 19)];
      saveToStorage(updated);
      return updated;
    });
  };

  const clearNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { notifications, clearNotification, clearAll, addNotification };
};