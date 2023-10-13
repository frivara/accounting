'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button } from '@mui/material';
import "./login.css";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    // Clear previous error messages
    setError(null);

    // Check against hard-coded credentials
    if (email === 'admin@example.com' && password === 'password') {
      localStorage.setItem('user', email);
      // Redirect to the home page
      router.push('/');
    } else {
      // Set login status to false
      // Show error message
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form"
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
          className={error ? 'is-invalid' : ''}
        />
        <TextField
          data-cy="password"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={error ? 'is-invalid' : ''}
        />
        <Button data-cy="submit" type="submit">
          Login
        </Button>
        {error && <div data-cy="error-message" className="error-message">{error}</div>}
      </form>

    </div>
  );
};

export default LoginPage;
