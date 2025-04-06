import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import cursorImg from "./assets/img/cursor.png";
import appui from "./assets/img/appui.png";
import backmap from "./assets/img/backmap.png";
import Dashboard from "./Dashboard";
import { PasswordProtectProps } from "./types";
import { useNavigate } from "react-router-dom";
import { useAuth } from './context/AuthContext';

const PasswordContainer = styled.div`
  cursor: url(${cursorImg}) 2 2, auto !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  font-family: "SF Pro", sans-serif;
  position: relative;
  background-color: white;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  * {
    cursor: inherit !important;
  }
`;

const Overlay = styled.div`
  cursor: url(${cursorImg}) 2 2, auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const Canvas = styled.canvas`
  cursor: url(${cursorImg}) 2 2, auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
`;

const BackgroundMap = styled.img`
  cursor: url(${cursorImg}) 2 2, auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const BackgroundImg = styled.img`
  cursor: url(${cursorImg}) 2 2, auto;
  position: fixed;
  top: 20%;
  left: 15%;
  width: 40vw;
  z-index: 2;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  margin-top: 0%;
  margin-left: 50%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid black;
  width: 300px;
  margin-bottom: 20px;
  cursor: url(${cursorImg}) 2 2, auto;
  background: white;
  z-index: 2;

  &:focus {
    outline: none;
    border-color: black;
  }
`;

const Title = styled.h3`
  color: white;
  z-index: 2;
  font-size: 36px;
`;

const SubTitle = styled.h3`
  color: white;
  z-index: 2;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: url(${cursorImg}) 2 2, auto;
  background-color: black;
  color: white;
  z-index: 2;

  &:hover {
    background-color: gray;
  }
`;

const Error = styled.p`
  color: red;
  margin-top: 10px;
`;

const PasswordProtect: React.FC<PasswordProtectProps> = ({ onLogin }) => {
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === process.env.REACT_APP_PASSWORD) {
      if (onLogin) {
        onLogin(true);
      }
      login();
      navigate("/dashboard");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setInputPassword("");
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.drawImage(tempCanvas, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = (event: MouseEvent) => {
      if (!canvasRef.current) return;
      if (!lastPosition) {
        setLastPosition({ x: event.clientX, y: event.clientY });
        return;
      }
      ctx.strokeStyle = "#D5FF5D";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(event.clientX, event.clientY);
      ctx.stroke();
      setLastPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", draw);

    return () => {
      window.removeEventListener("mousemove", draw);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [lastPosition]);

  return (
    <PasswordContainer>
      <BackgroundMap src={backmap} alt="background map" />
      <Overlay />
      <Canvas ref={canvasRef} />
      <BackgroundImg src={appui} alt="app ui" />

      <Content>
        <Title>
          OUTLINE<br />내 발걸음을 그림으로.
        </Title>
        <SubTitle>우리 고사리들 늘 화이팅 🪴 -HANI- </SubTitle>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="암호를 대시오"
          />
          <Button type="submit">Login</Button>
        </form>
        {error && <Error>{error}</Error>}
      </Content>
    </PasswordContainer>
  );
};

export default PasswordProtect; 