"use client";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button } from "@mui/material";
import { MyContext } from "../helpers/context";
import "./login.css";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useContext<any>(MyContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <TextField
          data-cy="email"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={error ? "is-invalid" : ""}
        />
        <TextField
          data-cy="password"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={error ? "is-invalid" : ""}
        />
        <Button data-cy="submit" type="submit">
          Login
        </Button>
        {error && (
          <div data-cy="error-message" className="error-message">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
