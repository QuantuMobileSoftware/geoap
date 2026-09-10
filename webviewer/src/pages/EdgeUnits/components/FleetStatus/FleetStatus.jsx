import React from 'react';
import { getFleetStatusCopy } from 'hooks';
import { Container, Dot, StatusText } from './FleetStatus.styles';

export const FleetStatus = ({ fleetStatus }) => (
  <Container>
    <Dot $state={fleetStatus.worstState} />
    <StatusText>{getFleetStatusCopy(fleetStatus)}</StatusText>
  </Container>
);
