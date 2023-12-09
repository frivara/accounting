"use client";
import React, { ReactNode, useState, useEffect, FC } from "react";
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
  const [globalState, setGlobalState] = useState<any>({
    chartOfAccountsTemplates: {
      defaultTemplates: [],
      customTemplates: [],
      organizations: [],
    },
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

  const updateGlobalState = (newState: Partial<GlobalState>) => {
    setGlobalState((prevState: any) => ({
      ...prevState,
      ...newState,
    }));
  };

  const contextValue = {
    globalState,
    updateGlobalState,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};

export default ContextProvider;
