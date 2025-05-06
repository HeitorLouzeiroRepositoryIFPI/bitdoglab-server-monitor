import React from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
  padding-bottom: 10px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
`;

const ButtonItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonLabel = styled.div`
  margin-bottom: 10px;
  font-weight: bold;
  color: #2c3e50;
`;

const ButtonVisual = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: ${props => props.pressed ? '#2ecc71' : '#e74c3c'};
`;

const ButtonStatus = styled.div`
  margin-top: 10px;
  font-size: 0.9rem;
  color: ${props => props.pressed ? '#2ecc71' : '#e74c3c'};
`;

const ButtonStatusPanel = ({ buttonOne, buttonTwo }) => {
  // Verifica se os botões estão pressionados (valor '0' significa pressionado)
  const isButtonOnePressed = buttonOne === '0';
  const isButtonTwoPressed = buttonTwo === '0';

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Status dos Botões</PanelTitle>
      </PanelHeader>
      
      <ButtonsContainer>
        <ButtonItem>
          <ButtonLabel>Botão 1</ButtonLabel>
          <ButtonVisual pressed={isButtonOnePressed}>
            B1
          </ButtonVisual>
          <ButtonStatus pressed={isButtonOnePressed}>
            {isButtonOnePressed ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
          </ButtonStatus>
        </ButtonItem>
        
        <ButtonItem>
          <ButtonLabel>Botão 2</ButtonLabel>
          <ButtonVisual pressed={isButtonTwoPressed}>
            B2
          </ButtonVisual>
          <ButtonStatus pressed={isButtonTwoPressed}>
            {isButtonTwoPressed ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
          </ButtonStatus>
        </ButtonItem>
      </ButtonsContainer>
    </Panel>
  );
};

export default ButtonStatusPanel;