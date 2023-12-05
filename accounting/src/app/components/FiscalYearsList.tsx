"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Make sure you are importing useRouter from 'next/router'
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../db/firebase";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import React from "react";

export interface FiscalYear {
  id: string;
  firestoreId: string;
  startDate: string;
  endDate: string;
  isClosed: boolean; // Added property to indicate closed status
}

const FiscalYearsList: React.FC = () => {
  const router = useRouter();
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);

  const pathname = usePathname();
  const accountId = pathname.split("/").pop();

  const handleViewFiscalYear = (fiscalYear: FiscalYear) => {
    const id = fiscalYear.firestoreId;
    router.push(`/accounting/${accountId}/fiscalYears/${id}`);
  };

  useEffect(() => {
    if (!accountId || typeof accountId !== "string") {
      return;
    }

    const fiscalYearsQuery = query(
      collection(db, "fiscalYears"),
      where("accountId", "==", accountId)
    );

    const unsubscribe = onSnapshot(fiscalYearsQuery, (querySnapshot) => {
      let itemsArray: FiscalYear[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        itemsArray.push({
          id: data.id,
          firestoreId: doc.id,
          startDate: data.fiscalYearSpan?.start.toDate().toLocaleDateString(),
          endDate: data.fiscalYearSpan?.end.toDate().toLocaleDateString(),
          isClosed: data.isClosed || false, // Assume 'isClosed' is a boolean field in your document
        });
      });

      setFiscalYears(itemsArray);
    });

    return () => unsubscribe();
  }, [accountId]);

  return (
    <div style={{ margin: "1rem" }}>
      <List component="nav" aria-label="fiscal years">
        {fiscalYears.map((fiscalYear: FiscalYear) => (
          <React.Fragment key={fiscalYear.firestoreId}>
            <ListItem
              button
              onClick={() => handleViewFiscalYear(fiscalYear)}
              sx={{ "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" } }}
            >
              <ListItemIcon>
                <EventNoteIcon />
              </ListItemIcon>
              <ListItemText
                primary={`${fiscalYear.startDate} - ${fiscalYear.endDate}`}
                secondary={fiscalYear.isClosed ? "Stängd" : ""}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};

export default FiscalYearsList;
