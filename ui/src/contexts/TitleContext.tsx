import React, { createContext, useState, useContext, ReactNode } from "react";

interface TitleContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
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
  const [headerTitle, setheaderTitle] = useState("");

  return (
    <TitleContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        headerTitle,
        setHeaderTitle: setheaderTitle,
      }}
    >
      {children}
    </TitleContext.Provider>
  );
};
