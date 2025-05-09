import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import axios from 'axios';
import './App.css';
import ServerStatusPanel from './components/ServerStatusPanel';
import JoystickVisualizer from './components/JoystickVisualizer';
import ButtonStatusPanel from './components/ButtonStatusPanel';
import Header from './components/Header';
import TemperatureDisplay from './components/TemperatureDisplay';
import AlertNotification from './components/AlertNotification';

// Environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001';

// Temas claro e escuro
const lightTheme = {
  background: '#f5f7fa',
  cardBg: '#ffffff',
  textPrimary: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#3498db',
  success: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f39c12',
  border: '#eee',
  shadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  headerBg: 'linear-gradient(90deg, #3498db, #2c3e50)',
  chartGrid: '#eee'
};

const darkTheme = {
  background: '#1a1a2e',
  cardBg: '#16213e',
  textPrimary: '#e6e6e6',
  textSecondary: '#b3b3b3',
  accent: '#4d9de0',
  success: '#4cd137',
  danger: '#ff5252',
  warning: '#ffb142',
  border: '#444',
  shadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  headerBg: 'linear-gradient(90deg, #0f3460, #1a1a2e)',
  chartGrid: '#444'
};

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.textPrimary};
    transition: all 0.3s ease;
    margin: 0;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .loading-container, .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.textPrimary};
    flex-direction: column;
  }
  
  .error-container {
    color: ${props => props.theme.danger};
  }
`;

// Estilização do container principal com grid areas para layout mais flexível
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto;
  grid-template-areas: 
    "server server server server joystick joystick joystick joystick button button button button"
    "temp temp temp temp temp temp temp temp temp temp temp temp";
  gap: 20px;
  
  @media (max-width: 992px) {
    grid-template-areas: 
      "server server server server joystick joystick joystick joystick button button button button"
      "temp temp temp temp temp temp temp temp temp temp temp temp";
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "server"
      "joystick"
      "button"
      "temp";
  }
`;

const ServerStatusArea = styled.div`
  grid-area: server;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const JoystickArea = styled.div`
  grid-area: joystick;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const ButtonArea = styled.div`
  grid-area: button;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const TemperatureArea = styled.div`
  grid-area: temp;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
  animation-delay: 0.3s;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ThemeToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.theme.cardBg};
  color: ${props => props.theme.accent};
  border: none;
  box-shadow: ${props => props.theme.shadow};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 100;
  transition: all 0.3s ease;
  
  &:hover {
    transform: rotate(30deg) scale(1.1);
  }
`;

// Spinner para carregamento
const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${props => props.theme.accent};
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function App() {
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ visible: false, message: '', type: 'error' });

  // Função para fechar o alerta
  const handleCloseAlert = () => {
    setAlertInfo({ ...alertInfo, visible: false });
  };

  // Função para mostrar um alerta
  const showAlert = (message, type = 'error') => {
    setAlertInfo({ visible: true, message, type });
  };

  // Função para buscar dados da API
  const fetchData = async () => {
    try {
      // URL da API Django
      const response = await axios.get(`${API_URL}/api/status/latest/`);
      if (response.data && response.data.length > 0) {
        setServerStatus(response.data[0]);
        setConnectionStatus(true);
      }
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      // Usando o alerta personalizado em vez do alert() padrão
      showAlert('Não foi possível conectar ao servidor. Verifique se a API está rodando.', 'error');
      setConnectionStatus(false);
      // Keep using the last server status we had
      setLoading(false);
    }
  };

  // Alternar entre tema claro e escuro
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Buscar dados na primeira renderização e depois a cada 5 segundos
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(interval);
  }, []); // Removida a dependência fetchData para evitar loops desnecessários

  if (loading) {
    return (
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <div className="loading-container">
          <Spinner />
          <p>Carregando dados do servidor...</p>
        </div>
      </ThemeProvider>
    );
  }

  // Remove the error condition check so we always show the dashboard

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <div className="App">
        <Header 
          darkMode={darkMode} 
          connectionStatus={connectionStatus}
        />
        
        {/* Renderiza o alerta personalizado quando visível */}
        {alertInfo.visible && (
          <AlertNotification 
            message={alertInfo.message}
            type={alertInfo.type}
            onClose={handleCloseAlert}
          />
        )}
        
        <DashboardContainer>
          <ServerStatusArea>
            <ServerStatusPanel serverStatus={serverStatus} />
          </ServerStatusArea>
          
          <JoystickArea>
            <JoystickVisualizer 
              joystickX={serverStatus?.joystick_x} 
              joystickY={serverStatus?.joystick_y}
              direction={serverStatus?.direction} 
            />
          </JoystickArea>
          
          <ButtonArea>
            <ButtonStatusPanel 
              buttonOne={serverStatus?.button_one} 
              buttonTwo={serverStatus?.button_two} 
            />
          </ButtonArea>
          
          <TemperatureArea>
            <TemperatureDisplay />
          </TemperatureArea>
        </DashboardContainer>
        
        <ThemeToggleButton onClick={toggleTheme}>
          {darkMode ? '☀️' : '🌙'}
        </ThemeToggleButton>
      </div>
    </ThemeProvider>
  );
}

export default App;
