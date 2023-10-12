'use client'
import React, { useState } from 'react';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = () => {
    // Clear previous error messages
    setError(null);

    // Check against hard-coded credentials
    if (email === 'admin@example.com' && password === 'password') {
      // Set login status to true
      setIsLoggedIn(true);
      console.log("Logged in!");
    } else {
      // Set login status to false
      setIsLoggedIn(false);
      // Show error message
      setError('Invalid email or password');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <input
          data-cy="email"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={error ? 'is-invalid' : ''}
        />
        <input
          data-cy="password"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={error ? 'is-invalid' : ''}
        />
        <button data-cy="submit" type="submit">
          Login
        </button>
        {error && <div data-cy="error-message" className="error-message">{error}</div>}
      </form>

      {isLoggedIn && <p className='successful-login'>Login successful!</p>}
    </div>
  );
};

export default LoginPage;
