// Navbar.tsx
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import "./css/navbar.css";


const Navbar: React.FC = () => {
    return (
        <AppBar position="static" className="navbar">
            <Toolbar>
                <Typography variant="h6" component="div">
                    My Navbar
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
