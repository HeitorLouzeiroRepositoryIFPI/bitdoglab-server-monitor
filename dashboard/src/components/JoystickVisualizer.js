import React from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
  padding-bottom: 10px;
  text-align: center;
  width: 100%;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const JoystickContainer = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #ecf0f1;
  position: relative;
  margin: 20px 0;
  border: 3px solid #bdc3c7;
`;

const JoystickPoint = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e74c3c;
  position: absolute;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const JoystickInfo = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const DirectionLabel = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 10px;
`;

const CoordinatesLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const JoystickVisualizer = ({ joystickX, joystickY, direction }) => {
  // Valores padrão se não houver dados
  const x = joystickX ?? 2000;
  const y = joystickY ?? 2000;
  const dir = direction ?? 'Centro';
  
  // Normalizar valores do joystick de 0-4095 para porcentagens na tela
  // Assumindo que 2000 é o centro (50%)
  const normalizePosition = (val) => {
    // Converte a faixa 0-4095 para 0-100%
    const percent = (val / 4095) * 100;
    // Limita entre 10% e 90% para que o ponto não saia do círculo
    return Math.min(Math.max(percent, 10), 90);
  };
  
  // Calcular a posição do ponto no círculo
  const posX = normalizePosition(x);
  const posY = normalizePosition(4095 - y); // Inverter eixo Y para corresponder à direção correta
  
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Visualização do Joystick</PanelTitle>
      </PanelHeader>
      
      <JoystickContainer>
        <JoystickPoint 
          style={{ 
            left: `${posX}%`, 
            top: `${posY}%` 
          }} 
        />
      </JoystickContainer>
      
      <JoystickInfo>
        <DirectionLabel>Direção: {dir}</DirectionLabel>
        <CoordinatesLabel>X: {x}, Y: {y}</CoordinatesLabel>
      </JoystickInfo>
    </Panel>
  );
};

export default JoystickVisualizer;