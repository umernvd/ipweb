"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  fullName: string;
  updateFullName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [fullName, setFullName] = useState("Sarah Jenkins");

  const updateFullName = (name: string) => {
    setFullName(name);
  };

  return (
    <UserContext.Provider value={{ fullName, updateFullName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
