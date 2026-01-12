import React, { useState, useEffect, useRef } from "react";

export const useWebSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const processedMessageIds = useRef(new Set());

  const apiBase = process.env.REACT_APP_API_URL;

  useEffect(() => {
    let wsUrl = "";

    // ⭐ If using ngrok or production URL
    if (apiBase && apiBase.startsWith("http")) {
      wsUrl = apiBase.replace("https://", "wss://")
                     .replace("http://", "ws://") + "/ws";
    } 
    else {
      // ⭐ Always use localhost:8080 when in local dev
      wsUrl = "ws://localhost:8080";
    }

    console.log("🔌 Connecting WebSocket →", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
      setSocket(null);

      setTimeout(() => {
        console.log("🔄 Reconnecting...");
      }, 3000);
    };

    return () => ws.close();
  }, [apiBase]);

  // Register user
  useEffect(() => {
    if (socket && isConnected && userId) {
      console.log("📨 Registering user:", userId);
      socket.send(
        JSON.stringify({
          type: "register",
          userId: userId,
        })
      );
    }
  }, [socket, isConnected, userId]);

  return { socket, isConnected, processedMessageIds: processedMessageIds.current };
};
