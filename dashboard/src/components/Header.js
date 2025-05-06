import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(46, 204, 113, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
  }
`;

const pulseError = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
`;

const HeaderContainer = styled.header`
  background: ${props => props.theme.headerBg};
  color: white;
  padding: 1.2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadow};
  border-radius: 0 0 15px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #3498db, #2ecc71, #f39c12, #e74c3c);
    opacity: 0.8;
  }
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  margin-right: 15px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TitleContainer = styled.div`
  text-align: left;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(45deg, #ffffff, #e6e6e6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  margin: 0.3rem 0 0;
  font-size: 1rem;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.connected ? props.theme.success : props.theme.danger};
  margin-right: 8px;
  animation: ${props => props.connected ? pulse : pulseError} 2s infinite;
`;

const StatusText = styled.span`
  font-size: 0.9rem;
  color: ${props => props.connected ? props.theme.success : props.theme.danger};
`;

const TimeContainer = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.7;
  align-self: flex-end;
`;

const Header = ({ darkMode, connectionStatus }) => {
  // Data e hora atual
  const currentTime = new Date().toLocaleString('pt-BR');
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoContainer>
          <Logo>🤖</Logo>
          <TitleContainer>
            <Title>BitDogLab Server Monitor</Title>
            <Subtitle>Monitoramento em Tempo Real do Servidor Pico W</Subtitle>
          </TitleContainer>
        </LogoContainer>
        
        <StatusContainer>
          <StatusIndicator connected={connectionStatus} />
          <StatusText connected={connectionStatus}>
            {connectionStatus ? 'Conectado' : 'Desconectado'}
          </StatusText>
        </StatusContainer>
      </HeaderContent>
      
      <TimeContainer>
        Atualizado em: {currentTime}
      </TimeContainer>
    </HeaderContainer>
  );
};

export default Header;