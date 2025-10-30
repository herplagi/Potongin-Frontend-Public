// src/context/AuthContext.js - FIXED VERSION
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

        // ✅ FIXED: Fetch full user data from API
        fetchUserData();
      }
    }
    setLoading(false);
  }, []);

  // ✅ NEW: Function to fetch complete user data
  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/profile");
      const userData = response.data;
      
      setUser({
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        phone_number: userData.phone_number, // ✅ TAMBAHKAN INI
        role: userData.role,
        is_customer: userData.is_customer,
        is_owner: userData.is_owner,
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Jika gagal fetch, gunakan data dari token
      const tokenFromStorage = localStorage.getItem("token");
      if (tokenFromStorage) {
        const decodedToken = jwtDecode(tokenFromStorage);
        setUser({
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          phone_number: decodedToken.phone_number || "", // ✅ FALLBACK
          role: decodedToken.role,
          is_customer: decodedToken.is_customer,
          is_owner: decodedToken.is_owner,
        });
      }
    }
  };

  const login = useCallback(async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: receivedToken } = response.data;
    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
    
    // ✅ FIXED: Fetch full user data setelah login
    await fetchUserData();
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }, []);

  const value = { user, setUser, token, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);