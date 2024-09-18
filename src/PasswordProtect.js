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
  border: 1px solid black;
  width: 300px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: black;
  }
`;
const Title = styled.h3``;
const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: black;
  color: white;

  &:hover {
    background-color: gray;
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
      <Title>보스턴고사리 외 출입금지 🪴</Title>
      <Input
        type="password"
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
        placeholder="암호를 대시오"
      />
      <Button onClick={handleLogin}>Login</Button>
      {error && <Error>{error}</Error>}
    </PasswordContainer>
  );
}

export default PasswordProtect;
