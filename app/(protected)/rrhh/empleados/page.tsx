"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import RrhhEmpleadosPage from '@/components/rrhh/RrhhEmpleadosPage';

export default function EmpleadosPage() {
  const { token, ready } = useAuth();

  // El layout ya maneja la autenticación y loading states
  // Solo necesitamos verificar que tenemos el token
  if (!ready || !token) {
    return null; // El layout se encarga del loading y redirección
  }

  return <RrhhEmpleadosPage token={token} />;
}
