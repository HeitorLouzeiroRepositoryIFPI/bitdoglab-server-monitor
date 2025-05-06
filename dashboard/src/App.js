import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import './App.css';
import ServerStatusPanel from './components/ServerStatusPanel';
import JoystickVisualizer from './components/JoystickVisualizer';
import ButtonStatusPanel from './components/ButtonStatusPanel';
import Header from './components/Header';

// Estilização do container principal
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

function App() {
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar dados da API
  const fetchData = async () => {
    try {
      // URL da API Django
      const response = await axios.get('http://127.0.0.1:8000/api/status/latest/');
      if (response.data && response.data.length > 0) {
        setServerStatus(response.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
      setLoading(false);
    }
  };

  // Buscar dados na primeira renderização e depois a cada 2 segundos
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading-container">Carregando dados do servidor...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="App">
      <Header />
      
      <DashboardContainer>
        <ServerStatusPanel serverStatus={serverStatus} />
        <JoystickVisualizer 
          joystickX={serverStatus?.joystick_x} 
          joystickY={serverStatus?.joystick_y}
          direction={serverStatus?.direction} 
        />
        <ButtonStatusPanel 
          buttonOne={serverStatus?.button_one} 
          buttonTwo={serverStatus?.button_two} 
        />
      </DashboardContainer>
    </div>
  );
}

export default App;
