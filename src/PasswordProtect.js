import React, { useState } from "react";
import styled from "styled-components";
import Dashboard from "./Dashboard";

const PasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: "SF Pro", sans-serif;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 300px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }
`;

const Error = styled.p`
  color: red;
  margin-top: 10px;
`;

function PasswordProtect() {
  const [inputPassword, setInputPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  const correctPassword = process.env.REACT_APP_PASSWORD;

  const handleLogin = () => {
    if (inputPassword === correctPassword) {
      setIsAuthorized(true);
    } else {
      setError("Incorrect password. Please try again.");
      setInputPassword("");
    }
  };

  if (isAuthorized) {
    return <Dashboard />;
  }

  return (
    <PasswordContainer>
      <h1>Enter Password to Access Dashboard</h1>
      <Input
        type="password"
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
        placeholder="Enter password"
      />
      <Button onClick={handleLogin}>Login</Button>
      {error && <Error>{error}</Error>}
    </PasswordContainer>
  );
}

export default PasswordProtect;
