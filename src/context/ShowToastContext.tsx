import React, { createContext, useState, ReactNode } from "react";

interface ShowToastContextProps {
  showToastMsg: string | null;
  setShowToastMsg: (msg: string | null) => void;
}

export const ShowToastContext = createContext<ShowToastContextProps | undefined>(undefined);

export const ShowToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showToastMsg, setShowToastMsg] = useState<string | null>(null);

  return (
    <ShowToastContext.Provider value={{ showToastMsg, setShowToastMsg }}>
      {children}
    </ShowToastContext.Provider>
  );
}; 