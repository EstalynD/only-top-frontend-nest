import { requestJSON } from '@/lib/utils/fetcher';

// ========== TIPOS ==========

export interface EndowmentCategory {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EndowmentItem {
  _id: string;
  name: string;
  description: string;
  categoryId: EndowmentCategory;
  brand?: string;
  model?: string;
  serialNumber?: string;
  estimatedValue?: {
    monto: number;
    moneda: string;
  };
  condition?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EndowmentTracking {
  _id: string;
  empleadoId: {
    _id: string;
    nombre: string;
    apellido: string;
    correoElectronico: string;
    areaId: {
      _id: string;
      name: string;
      code: string;
    };
    cargoId: {
      _id: string;
      name: string;
      code: string;
    };
  };
  itemId: {
    _id: string;
    name: string;
    description: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    estimatedValue?: {
      monto: number;
      moneda: string;
    };
  };
  categoryId: {
    _id: string;
    name: string;
    description: string;
    icon?: string;
    color?: string;
  };
  action: 'ENTREGA' | 'DEVOLUCION' | 'MANTENIMIENTO' | 'REPARACION' | 'REEMPLAZO';
  actionDate: string;
  observations?: string;
  condition?: string;
  location?: string;
  processedBy?: {
    _id: string;
    username: string;
    displayName: string;
  };
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EndowmentSummary {
  totalEntregas: number;
  totalDevoluciones: number;
  totalMantenimientos: number;
  totalReparaciones: number;
  totalReemplazos: number;
  itemsActivos: number;
  categorias: string[];
  valorTotalEstimado: number;
}

// ========== SERVICIOS ==========

export const dotacionApi = {
  // Obtener historial de dotación por empleado
  async getEmpleadoHistorial(empleadoId: string, token: string): Promise<EndowmentTracking[]> {
    return await requestJSON<EndowmentTracking[]>(`/api/rrhh/endowment/tracking/empleado/${empleadoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Obtener items activos del empleado
  async getEmpleadoItemsActivos(empleadoId: string, token: string): Promise<EndowmentTracking[]> {
    return await requestJSON<EndowmentTracking[]>(`/api/rrhh/endowment/empleados/${empleadoId}/items-activos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Obtener resumen de dotación del empleado
  async getEmpleadoResumen(empleadoId: string, token: string): Promise<EndowmentSummary> {
    return await requestJSON<EndowmentSummary>(`/api/rrhh/endowment/empleados/${empleadoId}/resumen`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Obtener todas las categorías
  async getCategorias(token: string): Promise<EndowmentCategory[]> {
    return await requestJSON<EndowmentCategory[]>('/api/rrhh/endowment/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Obtener todos los items
  async getItems(token: string, categoryId?: string): Promise<EndowmentItem[]> {
    const url = categoryId ? `/api/rrhh/endowment/items?categoryId=${categoryId}` : '/api/rrhh/endowment/items';
    return await requestJSON<EndowmentItem[]>(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Crear nuevo seguimiento
  async createTracking(data: {
    empleadoId: string;
    itemId: string;
    action: 'ENTREGA' | 'DEVOLUCION' | 'MANTENIMIENTO' | 'REPARACION' | 'REEMPLAZO';
    actionDate: string;
    observations?: string;
    condition?: string;
    location?: string;
  }, token: string): Promise<EndowmentTracking> {
    return await requestJSON<EndowmentTracking>('/api/rrhh/endowment/tracking', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  },

  // Actualizar seguimiento
  async updateTracking(id: string, data: {
    action?: 'ENTREGA' | 'DEVOLUCION' | 'MANTENIMIENTO' | 'REPARACION' | 'REEMPLAZO';
    actionDate?: string;
    observations?: string;
    condition?: string;
    location?: string;
  }, token: string): Promise<EndowmentTracking> {
    return await requestJSON<EndowmentTracking>(`/api/rrhh/endowment/tracking/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  },

  // Eliminar seguimiento
  async deleteTracking(id: string, token: string): Promise<void> {
    await requestJSON<void>(`/api/rrhh/endowment/tracking/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// ========== UTILIDADES ==========

export const formatCurrency = (monto: number, moneda: string): string => {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: moneda === 'COP' ? 'COP' : moneda === 'USD' ? 'USD' : 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return formatter.format(monto);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getActionColor = (action: string): string => {
  switch (action) {
    case 'ENTREGA':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'DEVOLUCION':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    case 'MANTENIMIENTO':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    case 'REPARACION':
      return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
    case 'REEMPLAZO':
      return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
  }
};

export const getActionIcon = (action: string): string => {
  switch (action) {
    case 'ENTREGA':
      return '📦';
    case 'DEVOLUCION':
      return '↩️';
    case 'MANTENIMIENTO':
      return '🔧';
    case 'REPARACION':
      return '🛠️';
    case 'REEMPLAZO':
      return '🔄';
    default:
      return '📋';
  }
};

