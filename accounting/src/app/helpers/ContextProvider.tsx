// ContextProvider.tsx
import React, { ReactNode, useState, FC } from "react";
import { MyContext } from "./context";

interface GlobalState {
  user?: {
    name: string;
    email: string;
  };
}

interface ContextProviderProps {
  children: ReactNode;
}

interface ContextValue {
  globalState: GlobalState;
  updateGlobalState: (newState: Partial<GlobalState>) => void;
}

const ContextProvider: FC<ContextProviderProps> = ({ children }) => {
  const [globalState, setGlobalState] = useState<GlobalState>({});

  const updateGlobalState = (newState: Partial<GlobalState>) => {
    setGlobalState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };

  const contextValue: ContextValue = {
    globalState,
    updateGlobalState,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};

export default ContextProvider;
