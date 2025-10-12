"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import RrhhAreasPage from '@/components/rrhh/RrhhAreasPage';

export default function AreasPage() {
  const { token, ready } = useAuth();

  // El layout ya maneja la autenticación y loading states
  // Solo necesitamos verificar que tenemos el token
  if (!ready || !token) {
    return null; // El layout se encarga del loading y redirección
  }

  return <RrhhAreasPage token={token} />;
}
