import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.8;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Title>BitDogLab Server Monitor</Title>
      <Subtitle>Monitoramento em Tempo Real do Servidor Pico W</Subtitle>
    </HeaderContainer>
  );
};

export default Header;