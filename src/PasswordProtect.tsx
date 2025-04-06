import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { PasswordProtectProps } from "./types";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: white;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 300px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

const PasswordProtect: React.FC<PasswordProtectProps> = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "outline") {
      if (onLogin) {
        onLogin(true);
      }
      navigate("/dashboard");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <Section>
      <Title>OUTLINE</Title>
      <form onSubmit={handleSubmit}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
        />
        <Button type="submit">로그인</Button>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Section>
  );
};

export default PasswordProtect; 