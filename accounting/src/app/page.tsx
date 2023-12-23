"use client";
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Grid } from "@mui/material";
import { MyContext } from "./helpers/context";

const HomePage = () => {
  const router = useRouter();
  const { globalState } = useContext<any>(MyContext);
  const { user } = globalState;

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <Grid container style={{ paddingLeft: 240 }}>
      <Grid item xs={12}>
        <Container>
          <Typography variant="h3" gutterBottom>
            Bokföring 2.0 - The ReBokföringengeance ft. Tails
          </Typography>
          <Typography variant="h4" gutterBottom>
            Välkommen hit, {user.name}!
          </Typography>
          {/* Consider dynamically displaying the last accessed organization/fiscal year here */}
          <Typography variant="h6" gutterBottom>
            {/* Place for dynamic content */}
          </Typography>
        </Container>
      </Grid>
    </Grid>
  );
};

export default HomePage;
