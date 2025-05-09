import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(46, 204, 113, 0.6); }
  50% { box-shadow: 0 0 20px rgba(46, 204, 113, 0.9); }
  100% { box-shadow: 0 0 5px rgba(46, 204, 113, 0.6); }
`;

const Panel = styled.div`
  background-color: ${props => props.theme.cardBg};
  border-radius: 15px;
  padding: 25px;
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme.border};
  transition: all 0.3s ease;
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 20px;
  padding-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PanelIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 10px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.textPrimary};
  font-size: 1.5rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 30px;
`;

const ButtonItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 120px;
  
  @media (max-width: 480px) {
    min-width: 100px;
  }
`;

const ButtonLabel = styled.div`
  margin-bottom: 15px;
  font-weight: bold;
  color: ${props => props.theme.textPrimary};
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  
  span {
    background-color: ${props => props.theme.background};
    border-radius: 5px;
    padding: 3px 8px;
    margin-left: 8px;
    font-size: 0.8rem;
    color: ${props => props.theme.textSecondary};
  }
`;

const ButtonContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const ButtonCircle = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${props => props.theme.background};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const ButtonOverlay = styled.div`
  position: absolute;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  top: 5%;
  left: 5%;
  background-color: ${props => props.pressed ? props.theme.success : props.theme.danger};
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform: ${props => props.pressed ? 'scale(0.9)' : 'scale(1)'};
  box-shadow: ${props => props.pressed 
    ? '0 4px 15px rgba(46, 204, 113, 0.5), inset 0 -4px 0 rgba(0, 0, 0, 0.1)' 
    : '0 8px 15px rgba(231, 76, 60, 0.2), inset 0 -8px 0 rgba(0, 0, 0, 0.1)'};
  
  ${props => props.pressed && css`
    animation: ${glow} 2s infinite;
  `}
`;

const ButtonText = styled.div`
  color: white;
  font-weight: bold;
  font-size: 1.4rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  ${props => props.pressed && css`
    animation: ${pulse} 2s infinite;
  `}
`;

const ButtonStatus = styled.div`
  margin-top: 15px;
  font-size: 0.9rem;
  color: ${props => props.pressed ? props.theme.success : props.theme.danger};
  font-weight: bold;
  background-color: ${props => props.theme.background};
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
`;

const ButtonRipple = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 3px solid ${props => props.pressed ? props.theme.success : 'transparent'};
  z-index: 3;
  
  ${props => props.pressed && css`
    animation: ripple 1s infinite;
    @keyframes ripple {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(1.2);
        opacity: 0;
      }
    }
  `}
`;

const ButtonStatusPanel = ({ buttonOne, buttonTwo }) => {
  // Verifica se os botões estão pressionados (valor '0' significa pressionado)
  const isButtonOnePressed = buttonOne === '0';
  const isButtonTwoPressed = buttonTwo === '0';

  return (
    <Panel>
      <PanelHeader>
        <PanelIcon>🔘</PanelIcon>
        <PanelTitle>Status dos Botões</PanelTitle>
      </PanelHeader>
      
      <ButtonsContainer>
        <ButtonItem>
          <ButtonLabel>
            Botão 1 <span>Digital</span>
          </ButtonLabel>
          <ButtonContainer>
            <ButtonCircle />
            <ButtonOverlay pressed={isButtonOnePressed}>
              <ButtonText pressed={isButtonOnePressed}>B1</ButtonText>
            </ButtonOverlay>
            <ButtonRipple pressed={isButtonOnePressed} />
          </ButtonContainer>
          <ButtonStatus pressed={isButtonOnePressed}>
            {isButtonOnePressed ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
          </ButtonStatus>
        </ButtonItem>
        
        <ButtonItem>
          <ButtonLabel>
            Botão 2 <span>Digital</span>
          </ButtonLabel>
          <ButtonContainer>
            <ButtonCircle />
            <ButtonOverlay pressed={isButtonTwoPressed}>
              <ButtonText pressed={isButtonTwoPressed}>B2</ButtonText>
            </ButtonOverlay>
            <ButtonRipple pressed={isButtonTwoPressed} />
          </ButtonContainer>
          <ButtonStatus pressed={isButtonTwoPressed}>
            {isButtonTwoPressed ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
          </ButtonStatus>
        </ButtonItem>
      </ButtonsContainer>
    </Panel>
  );
};

export default ButtonStatusPanel;