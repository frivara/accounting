"use client";
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove the logged-in user from the context
    localStorage.removeItem("user");
    // Redirect to the login page
    router.push("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar className="navbar">
        <Typography variant="h6" component="div">
          Accounting Web Application
        </Typography>
        <Link href="/">Home</Link>
        <Link href="/accounting">Accounting</Link>
        <Link href="/accounting/chartofaccounts">Chart of Accounts</Link>
        <button id="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
