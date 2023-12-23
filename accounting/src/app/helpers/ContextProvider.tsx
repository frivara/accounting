"use client";
import React, { ReactNode, useState, useEffect, useContext, FC } from "react";
import { db } from "../db/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MyContext } from "./context";

interface CoaTemplate {
  id: string;
  templateName: string;
  isDefault: boolean;
  accounts: any[];
}

interface Organization {
  id: string;
  firestoreId: string;
  name: string;
  accountingPlan: string;
}

interface GlobalState {
  user?: {
    name: string;
    email: string;
  };
  chartOfAccountsTemplates?: {
    defaultTemplates: CoaTemplate[];
    customTemplates: CoaTemplate[];
  };
  organizations?: Organization[];
}

interface ContextProviderProps {
  children: ReactNode;
}

const ContextProvider: FC<ContextProviderProps> = ({ children }) => {
  const getUserFromLocalStorage = () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        // Handle the error or clear the invalid localStorage item
        localStorage.removeItem("user");
      }
    }
    return null;
  };

  const [globalState, setGlobalState] = useState<GlobalState>({
    chartOfAccountsTemplates: {
      defaultTemplates: [],
      customTemplates: [],
    },
    organizations: [],
    user: getUserFromLocalStorage(),
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      const defaultTemplatesQuery = query(
        collection(db, "chartOfAccountsTemplates"),
        where("isDefault", "==", true)
      );

      const customTemplatesQuery = query(
        collection(db, "chartOfAccountsTemplates"),
        where("isDefault", "==", false)
      );

      try {
        const [defaultTemplatesSnapshot, customTemplatesSnapshot] =
          await Promise.all([
            getDocs(defaultTemplatesQuery),
            getDocs(customTemplatesQuery),
          ]);

        const defaultTemplates = defaultTemplatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const customTemplates = customTemplatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setGlobalState((prevState: any) => ({
          ...prevState,
          chartOfAccountsTemplates: {
            defaultTemplates,
            customTemplates,
          },
        }));
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Handle error appropriately
      }
    };

    fetchTemplates();

    const fetchOrganizations = async () => {
      const organizationsSnapshot = await getDocs(
        collection(db, "organisations")
      );
      const organizations = organizationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGlobalState((prevState: any) => ({
        ...prevState,
        organizations,
      }));
    };

    fetchOrganizations();
  }, []);

  const login = (email: string, password: string) => {
    // Placeholder authentication logic
    if (email === "admin@example.com" && password === "password") {
      const userData = { name: email, email };
      setGlobalState((prevState) => ({ ...prevState, user: userData }));
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    setGlobalState((prevState: any) => ({ ...prevState, user: null }));
    localStorage.removeItem("user");
  };

  const updateGlobalState = (newState: Partial<GlobalState>) => {
    setGlobalState((prevState: any) => ({
      ...prevState,
      ...newState,
    }));
  };

  const contextValue = {
    globalState,
    updateGlobalState,
    login,
    logout,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};

export default ContextProvider;
