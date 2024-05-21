/* eslint react-refresh/only-export-components: 0 */
import React, { createContext, useState, useContext, ReactNode } from "react";

interface TitleContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export function useTitle() {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error("useTitle must be used within a TitleProvider");
  }
  return context;
}

export const TitleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pageTitle, setPageTitle] = useState("");

  return (
    <TitleContext.Provider
      value={{
        pageTitle,
        setPageTitle,
      }}
    >
      {children}
    </TitleContext.Provider>
  );
};
