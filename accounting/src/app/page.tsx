"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  Grid,
} from "@mui/material";

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(user);
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <Grid container style={{ paddingLeft: 240 }}>
      {" "}
      {/* Adjusted for navbar width */}
      <Grid item xs={12}>
        <Container>
          <Typography variant="h3" gutterBottom>
            Bokföring 2.0 - The ReBokföringengeance ft. Tails
          </Typography>
          <Typography variant="h4" gutterBottom>
            Welcome, {user}!
          </Typography>
          <Typography variant="h5" gutterBottom>
            Please use the navbar to navigate this web app and have a wonderful
            day!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Developer&apos;s note: Perhaps put the organisation/fiscal year that
            the user last worked on here as a link?
          </Typography>
        </Container>
      </Grid>
    </Grid>
  );
};

export default HomePage;
