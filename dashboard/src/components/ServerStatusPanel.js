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

const StatusItem = styled.div`
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span`
  font-weight: bold;
  color: #7f8c8d;
`;

const Value = styled.span`
  color: #2c3e50;
  font-weight: 500;
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
          <PanelTitle>Status do Servidor</PanelTitle>
        </PanelHeader>
        <div>Sem dados disponíveis</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Status do Servidor</PanelTitle>
      </PanelHeader>
      
      <StatusItem>
        <Label>ID:</Label>
        <Value>{serverStatus.id}</Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Direção:</Label>
        <Value>{serverStatus.direction}</Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Joystick X:</Label>
        <Value>{serverStatus.joystick_x}</Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Joystick Y:</Label>
        <Value>{serverStatus.joystick_y}</Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Botão 1:</Label>
        <Value>
          {serverStatus.button_one === '0' ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
        </Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Botão 2:</Label>
        <Value>
          {serverStatus.button_two === '0' ? 'PRESSIONADO' : 'NÃO PRESSIONADO'}
        </Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Última atualização:</Label>
        <Value>{formatDate(serverStatus.data_received)}</Value>
      </StatusItem>
    </Panel>
  );
};

export default ServerStatusPanel;