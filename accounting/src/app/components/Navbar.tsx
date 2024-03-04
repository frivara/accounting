"use client";
import React from "react";
import {
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import { NAVBAR_WIDTH } from "../helpers/layoutConstants";

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuItems = [
    { text: "Home", path: "/" },
    { text: "Bokföring", path: "/accounting" },
    { text: "Kontoplaner", path: "/accounting/chartofaccounts" },
    { text: "Skapa faktura", path: "/accounting/invoice" },
    { text: "Rapporter", path: "/accounting/reports" },
  ];

  return (
    <Drawer
      sx={{
        width: NAVBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: NAVBAR_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#333",
          color: "white",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Typography variant="h6" sx={{ padding: 2 }}>
        Bokföring 2.0
      </Typography>
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={item.text}
            selected={pathname === item.path}
            onClick={() => router.push(item.path)}
            sx={{
              "&.Mui-selected": {
                textDecoration: "underline",
              },
              "&.MuiListItem-button:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <IconButton
        edge="end"
        aria-label="logout"
        onClick={handleLogout}
        sx={{
          color: "white",
          margin: 1,
        }}
      >
        <LogoutIcon />
      </IconButton>
    </Drawer>
  );
};

export default Navbar;
