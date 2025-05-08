import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const StatItem = styled.div`
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

const LabelIcon = styled.span`
  margin-right: 5px;
  font-size: 1rem;
`;

// Formata o tempo de duração em horas:minutos:segundos
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SystemStatsPanel = ({ startTime, totalReadings }) => {
  const [uptime, setUptime] = useState(0);
  
  // Atualiza o uptime a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const secondsElapsed = Math.floor((now - startTime) / 1000);
      setUptime(secondsElapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  const statsItems = [
    { 
      label: 'Tempo de Execução', 
      icon: '⏱️', 
      value: formatDuration(uptime), 
      highlighted: true 
    },
    { 
      label: 'Total de Leituras', 
      icon: '📊', 
      value: totalReadings, 
      highlighted: false 
    },
    { 
      label: 'Leituras por Minuto', 
      icon: '📈', 
      value: uptime > 0 ? Math.round((totalReadings / (uptime / 60)) * 10) / 10 : 0, 
      highlighted: false 
    },
    { 
      label: 'Status', 
      icon: '🟢', 
      value: 'Online', 
      highlighted: false 
    }
  ];

  return (
    <Panel>
      <PanelHeader>
        <PanelIcon>📈</PanelIcon>
        <PanelTitle>Estatísticas do Sistema</PanelTitle>
      </PanelHeader>
      
      <StatsGrid>
        {statsItems.map((item, index) => (
          <StatItem key={index} index={index}>
            <Label>
              <LabelIcon>{item.icon}</LabelIcon>
              {item.label}
            </Label>
            <Value highlighted={item.highlighted}>
              {item.value}
            </Value>
          </StatItem>
        ))}
      </StatsGrid>
    </Panel>
  );
};

export default SystemStatsPanel;