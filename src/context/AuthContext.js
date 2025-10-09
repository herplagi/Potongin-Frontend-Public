// src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");

    if (tokenFromStorage) {
      const decodedToken = jwtDecode(tokenFromStorage);
      // Cek apakah token sudah expired
      if (decodedToken.exp * 1000 < Date.now()) {
        // Jika token expired, hapus dari localStorage dan jangan set state.
        localStorage.removeItem("token");
      } else {
        // Jika token masih valid, set state dan siapkan header axios.
        setToken(tokenFromStorage);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenFromStorage}`;
        setUser(decodedToken);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: receivedToken } = response.data;
    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
    setUser(jwtDecode(receivedToken));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }, []);

  const value = { user, token, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
