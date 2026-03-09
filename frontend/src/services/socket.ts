import { io } from "socket.io-client";

const API_BASE = typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_URL 
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "") 
  : "";

const URL = API_BASE ? API_BASE : (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

export const socket = io(URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
