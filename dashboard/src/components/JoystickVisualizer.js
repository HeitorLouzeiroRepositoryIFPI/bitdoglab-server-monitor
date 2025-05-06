import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const glowingAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(52, 152, 219, 0.5); }
  50% { box-shadow: 0 0 15px rgba(52, 152, 219, 0.8); }
  100% { box-shadow: 0 0 5px rgba(52, 152, 219, 0.5); }
`;

const Panel = styled.div`
  background-color: ${props => props.theme.cardBg};
  border-radius: 15px;
  padding: 25px;
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme.border};
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 20px;
  padding-bottom: 15px;
  text-align: center;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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

const JoystickContainer = styled.div`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: ${props => `radial-gradient(circle, ${props.theme.cardBg} 0%, ${props.theme.background} 100%)`};
  position: relative;
  margin: 20px 0;
  border: 2px solid ${props => props.theme.border};
  animation: ${glowingAnimation} 3s ease-in-out infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &::before {
    content: "";
    position: absolute;
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: 1px dashed ${props => props.theme.border};
  }
  
  &::after {
    content: "";
    position: absolute;
    width: 40%;
    height: 40%;
    border-radius: 50%;
    border: 1px dashed ${props => props.theme.border};
  }
`;

const JoystickCenter = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.theme.border};
  opacity: 0.5;
  position: absolute;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
`;

const JoystickPoint = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.accent}, ${props => props.theme.success});
  position: absolute;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;
  
  &::after {
    content: "";
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1));
    position: absolute;
    top: 15%;
    left: 15%;
  }
`;

const JoystickLine = styled.div`
  position: absolute;
  width: 2px;
  background-color: ${props => props.theme.accent};
  transform-origin: top center;
  opacity: 0.5;
  pointer-events: none;
  top: 50%;
  left: 50%;
  z-index: 5;
`;

const DirectionIndicators = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const AxisLabel = styled.div`
  position: absolute;
  font-weight: bold;
  font-size: 0.8rem;
  color: ${props => props.theme.textSecondary};
`;

const DirectionMarker = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.active ? props.theme.accent : props.theme.border};
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  opacity: ${props => props.active ? 1 : 0.4};
  box-shadow: ${props => props.active ? '0 0 10px rgba(52, 152, 219, 0.8)' : 'none'};
`;

const JoystickInfo = styled.div`
  margin-top: 25px;
  text-align: center;
  background-color: ${props => props.theme.background};
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  border: 1px solid ${props => props.theme.border};
`;

const DirectionLabel = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.theme.accent};
  margin-bottom: 10px;
  
  span {
    display: inline-block;
    animation: ${props => props.moving ? 'pulse 1s infinite' : 'none'};
  }
`;

const CoordinatesLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.textSecondary};
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const CoordValue = styled.span`
  background-color: ${props => props.theme.cardBg};
  padding: 5px 10px;
  border-radius: 5px;
  color: ${props => props.theme.textPrimary};
  font-family: 'Courier New', monospace;
  font-weight: bold;
`;

const JoystickVisualizer = ({ joystickX, joystickY, direction }) => {
  // Referência para o elemento linha entre o centro e o ponto do joystick
  const lineRef = useRef(null);
  
  // Valores padrão se não houver dados
  const x = joystickX ?? 2000;
  const y = joystickY ?? 2000;
  const dir = direction ?? 'Centro';
  
  // Normalizar valores do joystick de 0-4095 para porcentagens na tela (10-90%)
  const normalizePosition = (val) => {
    // Converte a faixa 0-4095 para 10-90%
    const percent = 10 + ((val / 4095) * 80);
    return Math.min(Math.max(percent, 10), 90);
  };
  
  // Calcular a posição do ponto no círculo
  const posX = normalizePosition(x);
  const posY = normalizePosition(4095 - y); // Inverter eixo Y para corresponder à direção correta
  
  // Atualizar a linha que conecta o centro ao ponto do joystick
  useEffect(() => {
    if (lineRef.current) {
      // Calcular o comprimento e o ângulo da linha
      const centerX = 50;
      const centerY = 50;
      
      // Distância entre os pontos
      const deltaX = posX - centerX;
      const deltaY = posY - centerY;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Ângulo em radianos e depois convertido para graus
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      // Atualizar as propriedades da linha
      lineRef.current.style.height = `${length}%`;
      lineRef.current.style.transform = `rotate(${angle + 90}deg)`;
    }
  }, [posX, posY]);
  
  // Verificar se o joystick está em movimento (não no centro)
  const isMoving = Math.abs(x - 2048) > 100 || Math.abs(y - 2048) > 100;
  
  // Determinar quais direções estão ativas com base no valor da direção
  const isActive = (targetDir) => {
    return dir.includes(targetDir);
  };
  
  return (
    <Panel>
      <PanelHeader>
        <PanelIcon>🕹️</PanelIcon>
        <PanelTitle>Visualização do Joystick</PanelTitle>
      </PanelHeader>
      
      <JoystickContainer>
        <JoystickCenter />
        <JoystickLine ref={lineRef} />
        <JoystickPoint 
          style={{ 
            left: `${posX}%`, 
            top: `${posY}%` 
          }}
        />
        
        <DirectionIndicators>
          {/* Labels dos eixos */}
          <AxisLabel style={{ top: '5%', left: '50%', transform: 'translateX(-50%)' }}>N</AxisLabel>
          <AxisLabel style={{ top: '95%', left: '50%', transform: 'translateX(-50%)' }}>S</AxisLabel>
          <AxisLabel style={{ top: '50%', left: '5%', transform: 'translateY(-50%)' }}>O</AxisLabel>
          <AxisLabel style={{ top: '50%', left: '95%', transform: 'translateY(-50%)' }}>L</AxisLabel>
          
          {/* Marcadores de direção */}
          <DirectionMarker style={{ top: '10%', left: '50%' }} active={isActive('Norte')} />
          <DirectionMarker style={{ top: '10%', left: '30%' }} active={isActive('Noroeste')} />
          <DirectionMarker style={{ top: '10%', left: '70%' }} active={isActive('Nordeste')} />
          <DirectionMarker style={{ top: '90%', left: '50%' }} active={isActive('Sul')} />
          <DirectionMarker style={{ top: '90%', left: '30%' }} active={isActive('Sudoeste')} />
          <DirectionMarker style={{ top: '90%', left: '70%' }} active={isActive('Sudeste')} />
          <DirectionMarker style={{ top: '50%', left: '10%' }} active={isActive('Oeste')} />
          <DirectionMarker style={{ top: '50%', left: '90%' }} active={isActive('Leste')} />
        </DirectionIndicators>
      </JoystickContainer>
      
      <JoystickInfo>
        <DirectionLabel moving={isMoving}>
          Direção: <span>{dir}</span>
        </DirectionLabel>
        <CoordinatesLabel>
          <span>X: <CoordValue>{x}</CoordValue></span>
          <span>Y: <CoordValue>{y}</CoordValue></span>
        </CoordinatesLabel>
      </JoystickInfo>
    </Panel>
  );
};

export default JoystickVisualizer;