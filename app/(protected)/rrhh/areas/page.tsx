"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import RrhhAreasPage from '@/components/rrhh/RrhhAreasPage';

export default function AreasPage() {
  const { token, ready } = useAuth();
  const { toast } = useToast();

  if (!ready) {
    return <div>Cargando...</div>;
  }

  if (!token) {
    return <div>No autorizado</div>;
  }

  return <RrhhAreasPage token={token} />;
}
