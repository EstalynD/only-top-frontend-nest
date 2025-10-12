import type { Area, Cargo, AreaWithCargos } from './types';
import type { Empleado } from './empleados-types';
import { AREA_COLORS } from './constants';

export function normalizeAreaCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z_]/g, '');
}

export function normalizeCargoCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z_]/g, '');
}

export function getRandomAreaColor(): string {
  return AREA_COLORS[Math.floor(Math.random() * AREA_COLORS.length)];
}


export function getHierarchyLevelLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Ejecutivo',
    2: 'Gerencial', 
    3: 'Supervisión',
    4: 'Operativo',
    5: 'Apoyo'
  };
  
  return labels[level] || `Nivel ${level}`;
}

export function sortAreasByOrder<T extends Area>(areas: T[]): T[] {
  return [...areas].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.name.localeCompare(b.name);
  });
}

export function sortCargosByHierarchy(cargos: Cargo[]): Cargo[] {
  return [...cargos].sort((a, b) => {
    if (a.hierarchyLevel !== b.hierarchyLevel) {
      return a.hierarchyLevel - b.hierarchyLevel;
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.name.localeCompare(b.name);
  });
}

export function filterActiveItems<T extends { isActive: boolean }>(items: T[]): T[] {
  return items.filter(item => item.isActive);
}

export function searchAreas<T extends Area>(areas: T[], query: string): T[] {
  if (!query.trim()) return areas;
  
  const searchTerm = query.toLowerCase().trim();
  return areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm) ||
    area.code.toLowerCase().includes(searchTerm) ||
    area.description?.toLowerCase().includes(searchTerm)
  );
}

export function searchCargos(cargos: Cargo[], query: string): Cargo[] {
  if (!query.trim()) return cargos;
  
  const searchTerm = query.toLowerCase().trim();
  return cargos.filter(cargo => 
    cargo.name.toLowerCase().includes(searchTerm) ||
    cargo.code.toLowerCase().includes(searchTerm) ||
    cargo.description?.toLowerCase().includes(searchTerm)
  );
}

export function getAreaStats(area: AreaWithCargos) {
  const activeCargos = filterActiveItems(area.cargos);
  const inactiveCargos = area.cargos.filter(c => !c.isActive);
  
  return {
    totalCargos: area.cargos.length,
    activeCargos: activeCargos.length,
    inactiveCargos: inactiveCargos.length,
    hierarchyLevels: new Set(activeCargos.map(c => c.hierarchyLevel)).size,
  };
}

// ========== EMPLEADOS HELPERS ==========

export function searchEmpleados(empleados: Empleado[], query: string): Empleado[] {
  if (!query.trim()) return empleados;
  
  const searchTerm = query.toLowerCase().trim();
  return empleados.filter(empleado => 
    empleado.nombre.toLowerCase().includes(searchTerm) ||
    empleado.apellido.toLowerCase().includes(searchTerm) ||
    empleado.correoElectronico.toLowerCase().includes(searchTerm) ||
    empleado.numeroIdentificacion.toLowerCase().includes(searchTerm) ||
    empleado.telefono.toLowerCase().includes(searchTerm) ||
    (typeof empleado.areaId !== 'string' && empleado.areaId.name.toLowerCase().includes(searchTerm)) ||
    (typeof empleado.cargoId !== 'string' && empleado.cargoId.name.toLowerCase().includes(searchTerm))
  );
}

export function getEmpleadoFullName(empleado: Empleado): string {
  return `${empleado.nombre} ${empleado.apellido}`;
}

export function getEmpleadoInitials(empleado: Empleado): string {
  return `${empleado.nombre.charAt(0)}${empleado.apellido.charAt(0)}`.toUpperCase();
}

export function formatEmpleadoId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}

export function getContratoStatusColor(estado: string): string {
  switch (estado) {
    case 'EN_REVISION': return '#f59e0b';
    case 'APROBADO': return '#10b981';
    case 'RECHAZADO': return '#ef4444';
    case 'TERMINADO': return '#6b7280';
    default: return '#6b7280';
  }
}

export function getContratoStatusLabel(estado: string): string {
  switch (estado) {
    case 'EN_REVISION': return 'En Revisión';
    case 'APROBADO': return 'Aprobado';
    case 'RECHAZADO': return 'Rechazado';
    case 'TERMINADO': return 'Terminado';
    default: return estado;
  }
}

export function validateEmpleadoData(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Los datos del empleado son inválidos');
    return { isValid: false, errors };
  }

  const empleado = data as Record<string, unknown>;

  if (!empleado.nombre || typeof empleado.nombre !== 'string' || empleado.nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!empleado.apellido || typeof empleado.apellido !== 'string' || empleado.apellido.trim().length < 2) {
    errors.push('El apellido debe tener al menos 2 caracteres');
  }

  if (!empleado.correoElectronico || typeof empleado.correoElectronico !== 'string' || !empleado.correoElectronico.includes('@')) {
    errors.push('El correo electrónico es obligatorio y debe ser válido');
  }

  if (!empleado.telefono || typeof empleado.telefono !== 'string' || empleado.telefono.trim().length < 7) {
    errors.push('El teléfono debe tener al menos 7 caracteres');
  }

  if (!empleado.numeroIdentificacion || typeof empleado.numeroIdentificacion !== 'string' || empleado.numeroIdentificacion.trim().length < 6) {
    errors.push('El número de identificación debe tener al menos 6 caracteres');
  }

  if (!empleado.areaId) {
    errors.push('Debe seleccionar un área');
  }

  if (!empleado.cargoId) {
    errors.push('Debe seleccionar un cargo');
  }

  if (!empleado.fechaInicio) {
    errors.push('La fecha de inicio es obligatoria');
  }

  const salario = empleado.salario as Record<string, unknown>;
  if (!salario || typeof salario.monto !== 'number' || salario.monto <= 0) {
    errors.push('El salario debe ser mayor a 0');
  }

  const contactoEmergencia = empleado.contactoEmergencia as Record<string, unknown>;
  if (!contactoEmergencia?.nombre || typeof contactoEmergencia.nombre !== 'string' || contactoEmergencia.nombre.trim().length < 2) {
    errors.push('El nombre del contacto de emergencia es obligatorio');
  }

  if (!contactoEmergencia?.telefono || typeof contactoEmergencia.telefono !== 'string' || contactoEmergencia.telefono.trim().length < 7) {
    errors.push('El teléfono del contacto de emergencia es obligatorio');
  }

  const informacionBancaria = empleado.informacionBancaria as Record<string, unknown>;
  if (!informacionBancaria?.nombreBanco || typeof informacionBancaria.nombreBanco !== 'string' || informacionBancaria.nombreBanco.trim().length < 2) {
    errors.push('El nombre del banco es obligatorio');
  }

  if (!informacionBancaria?.numeroCuenta || typeof informacionBancaria.numeroCuenta !== 'string' || informacionBancaria.numeroCuenta.trim().length < 8) {
    errors.push('El número de cuenta debe tener al menos 8 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ========== Endowment (Dotación) ==========
export function formatEndowmentAction(action: string): string {
  switch (action) {
    case 'ENTREGA': return 'Entrega';
    case 'DEVOLUCION': return 'Devolución';
    case 'MANTENIMIENTO': return 'Mantenimiento';
    case 'REPARACION': return 'Reparación';
    case 'REEMPLAZO': return 'Reemplazo';
    default: return action;
  }
}

export function sumEstimatedValue(items: Array<{ estimatedValue?: { monto: number } | null }>): number {
  return items.reduce((acc, it) => acc + (it.estimatedValue?.monto ?? 0), 0);
}