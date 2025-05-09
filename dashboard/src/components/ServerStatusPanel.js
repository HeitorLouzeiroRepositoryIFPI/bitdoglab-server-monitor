import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Panel = styled.div`
  background-color: ${props => props.theme.cardBg};
  border-radius: 15px;
  padding: 25px;
  box-shadow: ${props => props.theme.shadow};
  border: 1px solid ${props => props.theme.border};
  transition: all 0.3s ease;
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 20px;
  padding-bottom: 15px;
  display: flex;
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
  display: flex;
  align-items: center;
`;

const RefreshIcon = styled.span`
  font-size: 0.9rem;
  margin-left: 10px;
  opacity: 0.6;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 1;
    animation: ${rotateAnimation} 1s linear;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const StatusItem = styled.div`
  background-color: ${props => props.theme.background};
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease forwards;
  animation-delay: ${props => props.index * 0.1}s;
  opacity: 0;
  border: 1px solid ${props => props.theme.border};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const Label = styled.span`
  font-weight: bold;
  color: ${props => props.theme.textSecondary};
  font-size: 0.85rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

const Value = styled.span`
  color: ${props => props.theme.textPrimary};
  font-weight: 500;
  font-size: 1.1rem;
  padding: 5px 10px;
  border-radius: 5px;
  background: ${props => props.highlighted 
    ? `linear-gradient(45deg, ${props.theme.accent}20, transparent)` 
    : 'transparent'};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  background-color: ${props => 
    props.status === 'PRESSIONADO' ? props.theme.success :
    props.status === 'NÃO PRESSIONADO' ? props.theme.danger :
    props.theme.warning};
  color: white;
`;

const LastUpdate = styled.div`
  margin-top: 20px;
  padding: 12px;
  background-color: ${props => props.theme.background};
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: ${props => props.theme.textSecondary};
  border: 1px solid ${props => props.theme.border};
`;

const LastUpdateLabel = styled.span`
  font-weight: bold;
`;

const LastUpdateTime = styled.span`
  color: ${props => props.theme.accent};
  font-family: 'Courier New', monospace;
`;

const LabelIcon = styled.span`
  margin-right: 5px;
  font-size: 1rem;
`;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

const ServerStatusPanel = ({ serverStatus }) => {
  if (!serverStatus) {
    return (
      <Panel>
        <PanelHeader>
          <PanelIcon>📊</PanelIcon>
          <PanelTitle>Status do Servidor</PanelTitle>
        </PanelHeader>
        <div>Sem dados disponíveis</div>
      </Panel>
    );
  }

  // Define ícones para cada tipo de informação
  const statusItems = [
    { label: 'ID', icon: '🆔', value: serverStatus.id, highlighted: false },
    { label: 'Direção', icon: '🧭', value: serverStatus.direction, highlighted: true },
    { label: 'Joystick X', icon: '↔️', value: serverStatus.joystick_x, highlighted: false },
    { label: 'Joystick Y', icon: '↕️', value: serverStatus.joystick_y, highlighted: false },
    { 
      label: 'Botão 1', 
      icon: '🔴', 
      value: <StatusBadge status={serverStatus.button_one === '0' ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}>
        {serverStatus.button_one === '0' ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
      </StatusBadge>, 
      highlighted: false 
    },
    { 
      label: 'Botão 2', 
      icon: '🔵', 
      value: <StatusBadge status={serverStatus.button_two === '0' ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}>
        {serverStatus.button_two === '0' ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
      </StatusBadge>, 
      highlighted: false 
    },
  ];

  return (
    <Panel>
      <PanelHeader>
        <PanelIcon>📊</PanelIcon>
        <PanelTitle>
          Status do Servidor
          <RefreshIcon title="Atualizar">🔄</RefreshIcon>
        </PanelTitle>
      </PanelHeader>
      
      <StatusGrid>
        {statusItems.map((item, index) => (
          <StatusItem key={index} index={index}>
            <Label>
              <LabelIcon>{item.icon}</LabelIcon>
              {item.label}
            </Label>
            <Value highlighted={item.highlighted}>
              {item.value}
            </Value>
          </StatusItem>
        ))}
      </StatusGrid>
      
      <LastUpdate>
        <LastUpdateLabel>Última atualização:</LastUpdateLabel>
        <LastUpdateTime>{formatDate(serverStatus.data_received)}</LastUpdateTime>
      </LastUpdate>
    </Panel>
  );
};

export default ServerStatusPanel;