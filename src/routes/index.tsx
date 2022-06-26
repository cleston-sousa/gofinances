import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { PublicRoutes } from './public.routes';
import { AppRoutes } from './app.routes';

import { useAuth } from '../hooks/auth';

interface Props {
  onReady?: () => void;
}

export function Routes({ onReady }: Props) {
  const { user } = useAuth();
  return <NavigationContainer onReady={onReady}>{user.id ? <AppRoutes /> : <PublicRoutes />}</NavigationContainer>;
}
