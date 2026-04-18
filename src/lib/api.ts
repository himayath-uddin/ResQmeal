import axios from "axios";

const RAILWAY_API_URL = "https://your-railway-backend-url.up.railway.app";
const configuredApiUrl = import.meta.env.VITE_FLASK_API_URL?.trim();
const isLocalApiUrl =
  !!configuredApiUrl &&
  (configuredApiUrl.includes("localhost") || configuredApiUrl.includes("127.0.0.1"));

export const FLASK_API_URL = configuredApiUrl && !isLocalApiUrl ? configuredApiUrl : RAILWAY_API_URL;

export const api = axios.create({
  baseURL: FLASK_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
