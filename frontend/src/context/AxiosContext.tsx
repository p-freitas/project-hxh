import React, { createContext, useContext, ReactNode } from "react";
import axiosInstance from "../helpers/axiosInstance";

const AxiosContext = createContext(axiosInstance);

interface AxiosProviderProps {
  children: ReactNode;
}

export const AxiosProvider: React.FC<AxiosProviderProps> = ({ children }) => {
  return (
    <AxiosContext.Provider value={axiosInstance}>
      {children}
    </AxiosContext.Provider>
  );
};

export const useAxios = () => useContext(AxiosContext);
