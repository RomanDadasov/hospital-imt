import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import useTokenStore from "../stores/tokenStore";

export const useAppointmentRequests = (onNewRequest) => {
  const { accessToken, role } = useTokenStore();
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!accessToken || (role !== "Receptionist" && role !== "Admin")) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5171/hubs/appointment-requests", {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("NewAppointmentRequest", (request) => {
      onNewRequest?.(request);
    });

    connection
      .start()
      .then(async () => {
        await connection.invoke("JoinReceptionistGroup").catch(console.error);
      })
      .catch(console.error);

    connectionRef.current = connection;

    return () => { connection.stop(); };
  }, [accessToken, role]);
};