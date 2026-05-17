import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import useTokenStore from "../stores/tokenStore";
import { getChatHistory, uploadChatFile } from "../api/chatApi";

export const useChat = (roomId) => {
  const { accessToken } = useTokenStore();
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploading, setUploading] = useState(false);
  const connectionRef = useRef(null);
  const currentRoomRef = useRef(null);
  const roomIdRef = useRef(roomId); 

 
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    setLoadingHistory(true);
    setMessages([]);
    getChatHistory(roomId)
      .then((res) => setMessages(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [roomId]);

  
  useEffect(() => {
    if (!accessToken) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5171/hubs/chat", {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    connection.on("ReceiveMessage", (msg) => {
      setMessages((prev) => {
       
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    connection.onreconnected(async () => {
      setConnected(true);
      if (currentRoomRef.current) {
        await connection.invoke("JoinRoom", currentRoomRef.current).catch(() => {});
      }
    });

    connection.onclose(() => setConnected(false));

    connection.start()
      .then(async () => {
        setConnected(true);
      
        if (roomIdRef.current) {
          await connection.invoke("JoinRoom", roomIdRef.current).catch(() => {});
          currentRoomRef.current = roomIdRef.current;
        }
      })
      .catch(console.error);

    connectionRef.current = connection;

    return () => {
      connection.stop();
      setConnected(false);
    };
  }, [accessToken]);

  
  useEffect(() => {
    if (!roomId) return;

    const switchRoom = async () => {
      const conn = connectionRef.current;
      if (!conn) return;

     
      if (conn.state !== signalR.HubConnectionState.Connected) {
       
        const interval = setInterval(async () => {
          if (conn.state === signalR.HubConnectionState.Connected) {
            clearInterval(interval);
            if (currentRoomRef.current && currentRoomRef.current !== roomId) {
              await conn.invoke("LeaveRoom", currentRoomRef.current).catch(() => {});
            }
            await conn.invoke("JoinRoom", roomId).catch(() => {});
            currentRoomRef.current = roomId;
          }
        }, 200);

    
        setTimeout(() => clearInterval(interval), 5000);
        return;
      }

      if (currentRoomRef.current && currentRoomRef.current !== roomId) {
        await conn.invoke("LeaveRoom", currentRoomRef.current).catch(() => {});
      }

      await conn.invoke("JoinRoom", roomId).catch(() => {});
      currentRoomRef.current = roomId;
    };

    switchRoom();
  }, [roomId]);

  const sendMessage = useCallback(async (message) => {
    if (!connectionRef.current || !message.trim()) return;
    await connectionRef.current.invoke("SendMessage", roomId, message);
  }, [roomId]);

  const sendFile = useCallback(async (file, caption = "") => {
    if (!connectionRef.current || !file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadChatFile(formData);
      const { url, fileName, contentType } = res.data.data;
      await connectionRef.current.invoke("SendFileMessage", roomId, caption, url, fileName, contentType);
    } finally {
      setUploading(false);
    }
  }, [roomId]);

  return { messages, setMessages, sendMessage, sendFile, connected, loadingHistory, uploading };
};