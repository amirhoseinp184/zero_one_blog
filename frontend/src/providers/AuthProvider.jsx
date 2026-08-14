import { createContext, useContext, useState, useEffect, useLayoutEffect } from "react";
import { api } from "../services/api";


const authContext = createContext();

export function useAuth() {
  const ctx = useContext(authContext);

  if (!ctx) {
    throw Error("useAuthContext must be used inside a AuthContextProvider.");
  }
  return ctx;
}

export function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState(undefined);
  const isAuthLoading = authToken === undefined
  const isAuthenticated = (authToken !== undefined) && (authToken !== null)
  
  function logout(){
   setAuthToken(null) 
  }

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await api.post("auth/refresh/");
        setAuthToken(res.data["token"]);
      } catch (err) {
        // console.log("error during fetching auth token.", err);
        setAuthToken(null);
      }
    };

    fetchToken();
  }, []);

  useLayoutEffect(() => {
    const requestInterceptor = (config) => {

      if (authToken && !config._retry) {
        config['headers']["Authorization"] = `Bearer ${authToken}`
      }
            
      return config;
    };

    const responseInterseptor = async (error) => {
      const originalRequest = error.config;
      if (error.response.status_code === 401) {
        try {
          const res = await api.post("auth/refresh/");
          setAuthToken(res.data["token"]);
          originalRequest._retry = true;
          api(originalRequest);
        } catch (err) {
          console.log("error");
        }
      }

      return Promise.reject(error);
    };

    api.interceptors.request.use(requestInterceptor);
    api.interceptors.response.use((response) => response, responseInterseptor);

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterseptor);
    };
  }, [authToken]);

  const context = {
    setAuthToken,
    isAuthLoading,
    isAuthenticated,
    logout
  }

  return <authContext.Provider value={context}>{children}</authContext.Provider>;
}
