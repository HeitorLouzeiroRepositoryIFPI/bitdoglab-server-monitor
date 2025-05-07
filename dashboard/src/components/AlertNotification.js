import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Animação de entrada do alerta
const slideIn = keyframes`
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Animação de saída do alerta
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Container do alerta com estilização responsiva
const AlertContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 300px;
  max-width: 90%;
  padding: 16px 20px;
  border-radius: 8px;
  background-color: ${props => props.type === 'error' ? props.theme.danger : 
                            props.type === 'warning' ? props.theme.warning : props.theme.success};
  color: white;
  box-shadow: ${props => props.theme.shadow};
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${props => props.isClosing ? fadeOut : slideIn} 0.5s ease forwards;

  @media (max-width: 768px) {
    min-width: 250px;
    max-width: 95%;
    padding: 12px 16px;
  }
`;

// Ícone do alerta
const AlertIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
`;

// Texto do alerta
const AlertText = styled.div`
  flex: 1;
  font-weight: 500;
`;

// Botão para fechar o alerta
const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-left: 12px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const AlertNotification = ({ 
  message, 
  type = 'error', 
  duration = 5000, 
  onClose = () => {} 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  
  // Ícone baseado no tipo de alerta
  const getIcon = () => {
    switch(type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };
  
  // Fechamento do alerta
  const closeAlert = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 500); // Corresponde à duração da animação
  };
  
  // Auto-fechamento após a duração especificada
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => closeAlert(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, closeAlert]); // Adicionando closeAlert como dependência
  
  if (!isVisible) return null;
  
  return (
    <AlertContainer type={type} isClosing={isClosing}>
      <AlertIcon>{getIcon()}</AlertIcon>
      <AlertText>{message}</AlertText>
      <CloseButton onClick={closeAlert}>&times;</CloseButton>
    </AlertContainer>
  );
};

export default AlertNotification;