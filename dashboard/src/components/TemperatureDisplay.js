import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import socketService from '../services/websocket';

// Container principal com efeito de vidro
const TemperatureContainer = styled.div`
  background: ${props => `linear-gradient(135deg, ${props.theme.cardBg}80, ${props.theme.cardBg}40)`};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadow};
  border: 1px solid ${props => `${props.theme.border}40`};
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
`;

const TemperatureHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: ${props => props.theme.textPrimary};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
  }
`;

const TemperatureValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const CurrentTemp = styled.div`
  font-size: 3.5rem;
  font-weight: bold;
  color: ${props => {
    // Cor condicional baseada na temperatura
    if (props.value >= 30) return props.theme.danger;
    if (props.value >= 25) return props.theme.warning;
    return props.theme.accent;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  
  span {
    font-size: 1.8rem;
    margin-left: 5px;
  }
`;

const TemperatureInfo = styled.div`
  text-align: center;
  margin-bottom: 10px;
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
`;

const ChartContainer = styled.div`
  flex-grow: 1;
  min-height: 200px;
`;

const TemperatureIcon = ({ temperature }) => {
  // Ícone dinâmico baseado na temperatura
  if (temperature >= 30) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3V7M12 21V17M21 12H17M7 12H3M18.364 18.364L15.536 15.536M8.464 8.464L5.636 5.636M18.364 5.636L15.536 8.464M8.464 15.536L5.636 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  } else if (temperature >= 25) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    );
  } else {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 17.5C10 18.8807 11.1193 20 12.5 20C13.8807 20 15 18.8807 15 17.5C15 16.5193 14.4064 15.6595 13.5 15.2366V5C13.5 4.17157 12.8284 3.5 12 3.5C11.1716 3.5 10.5 4.17157 10.5 5V15.2366C9.59357 15.6595 9 16.5193 9 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
};

const TemperatureDisplay = () => {
  const [currentTemp, setCurrentTemp] = useState(null);
  const [tempHistory, setTempHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  // Buscar dados de temperatura (usado apenas como fallback)
  const fetchTemperatureData = async () => {
    try {
      // Buscar temperatura atual
      const currentResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001'}/api/temperature/latest/`);
      if (currentResponse.data && currentResponse.data.length > 0) {
        setCurrentTemp(currentResponse.data[0]);
      }
      
      // Buscar histórico de temperatura
      const historyResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001'}/api/temperature/history/`);
      if (historyResponse.data && historyResponse.data.length > 0) {
        setTempHistory(historyResponse.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados de temperatura:', err);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Buscar dados iniciais como fallback
    fetchTemperatureData();
    
    // Adicionar listener para atualizações de temperatura via WebSocket
    const temperatureListener = socketService.addListener('temperature', (data) => {
      if (data) {
        // Atualizar temperatura atual
        setCurrentTemp(data);
        
        // Adicionar à lista de histórico (mantendo os últimos 20 itens)
        setTempHistory(prevHistory => {
          const newHistory = [...prevHistory];
          // Verificar se já existe um item com o mesmo ID
          const existingIndex = newHistory.findIndex(item => item.id === data.id);
          
          if (existingIndex >= 0) {
            // Substituir o item existente
            newHistory[existingIndex] = data;
          } else {
            // Adicionar novo item
            newHistory.push(data);
          }
          
          // Ordenar por data e manter apenas os últimos 20 itens
          return newHistory
            .sort((a, b) => new Date(a.data_received) - new Date(b.data_received))
            .slice(-20);
        });
        
        setLoading(false);
      }
    });
    
    // Limpeza quando o componente é desmontado
    return () => {
      temperatureListener();
    };
  }, []);
  
  // Configuração do gráfico
  const getChartOptions = () => {
    return {
      chart: {
        type: 'area',
        height: 250,
        fontFamily: 'Poppins, sans-serif',
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
        background: 'transparent'
      },
      colors: [theme.accent],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100]
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      grid: {
        borderColor: theme.chartGrid,
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: true
          }
        }
      },
      markers: {
        size: 4,
        colors: [theme.cardBg],
        strokeColors: theme.accent,
        strokeWidth: 2,
        hover: {
          size: 6
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: theme.textSecondary
          },
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM',
            day: 'dd',
            hour: 'HH:mm'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: theme.textSecondary
          },
          formatter: function(val) {
            return val.toFixed(1) + '°C';
          }
        }
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy HH:mm'
        },
        theme: theme.background === '#1a1a2e' ? 'dark' : 'light'
      }
    };
  };
  
  // Preparar dados para o gráfico
  const getChartSeries = () => {
    if (tempHistory.length === 0) return [];
    
    const data = tempHistory.map(item => ({
      x: new Date(item.data_received).getTime(),
      y: item.temperature
    })).sort((a, b) => a.x - b.x);
    
    return [{
      name: 'Temperatura',
      data: data
    }];
  };
  
  // Formatação de data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <TemperatureContainer>
        <Title>
          <TemperatureIcon temperature={0} />
          Monitoramento de Temperatura
        </Title>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: '30px', height: '30px', border: `3px solid ${theme.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </TemperatureContainer>
    );
  }

  return (
    <TemperatureContainer>
      <TemperatureHeader>
        <Title>
          <TemperatureIcon temperature={currentTemp?.temperature || 0} />
          Monitoramento de Temperatura
        </Title>
      </TemperatureHeader>
      
      <TemperatureValue>
        <CurrentTemp value={currentTemp?.temperature || 0}>
          {currentTemp ? currentTemp.temperature.toFixed(1) : '--'}<span>°C</span>
        </CurrentTemp>
      </TemperatureValue>
      
      <TemperatureInfo>
        {currentTemp 
          ? `Última atualização: ${formatDate(currentTemp.data_received)}`
          : 'Sem dados de temperatura disponíveis'
        }
      </TemperatureInfo>
      
      <ChartContainer>
        {tempHistory.length > 0 ? (
          <ReactApexChart 
            options={getChartOptions()}
            series={getChartSeries()}
            type="area"
            height="100%"
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: theme.textSecondary }}>
            Sem histórico de temperatura disponível
          </div>
        )}
      </ChartContainer>
    </TemperatureContainer>
  );
};

export default TemperatureDisplay;