export interface Area {
  _id: string;
  name: string;
  code: string;
  description?: string | null;
  color: string;
  isActive: boolean;
  sortOrder: number;
  defaultContractTemplateId?: string | null;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, any>;
}


export interface Cargo {
  _id: string;
  name: string;
  code: string;
  areaId: string | Area;
  description?: string | null;
  hierarchyLevel: number;
  isActive: boolean;
  sortOrder: number;
  contractTemplateId?: string | null;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, any>;
}

export interface AreaWithCargos extends Area {
  cargos: Omit<Cargo, 'areaId'>[];
}

// DTOs para crear/actualizar
export interface CreateAreaDto {
  name: string;
  code: string;
  description?: string | null;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateAreaDto extends Partial<CreateAreaDto> {}

export interface CreateCargoDto {
  name: string;
  code: string;
  areaId: string;
  description?: string | null;
  hierarchyLevel?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCargoDto extends Partial<CreateCargoDto> {}

// Plantillas de Contratos
export interface ContractTemplate {
  templateId: string;
  name: string;
  areaCode: string;
  cargoCode: string;
  description: string;
}

export interface ContractTemplateAssignment {
  areaCode: string;
  cargoCode: string;
  templateId: string;
}

// Información de Contrato Laboral Generado
export interface ContratoLaboralInfo {
  templateId: string;
  templateName: string;
  area: string;
  cargo: string;
  contractNumber: string;
  employeeName: string;
  employeeId: string;
  workSchedule: {
    type: 'FIXED' | 'ROTATING';
    schedule?: any;
    shifts?: any[];
  };
  responsibilities: string[];
  benefits: string[];
  obligations: string[];
  generatedAt: string;
}

// Validación de Plantilla
export interface PlantillaValidation {
  tienePlantilla: boolean;
  templateId?: string;
  templateName?: string;
  areaCode?: string;
  cargoCode?: string;
}

// Respuestas de API
export interface AreasResponse {
  areas: Area[];
}

export interface AreasWithCargosResponse {
  areas: AreaWithCargos[];
}

export interface CargosResponse {
  cargos: Cargo[];
}

// ========== Endowment (Dotación) ==========
export type EndowmentCategory = {
  _id: string;
  name: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EndowmentItem = {
  _id: string;
  name: string;
  description: string;
  categoryId: string | { _id: string; name: string; description?: string };
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  estimatedValue?: { monto: number; moneda: string } | null;
  condition?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EndowmentAction = 'ENTREGA' | 'DEVOLUCION' | 'MANTENIMIENTO' | 'REPARACION' | 'REEMPLAZO';

export type EndowmentTracking = {
  _id: string;
  empleadoId: string | { _id: string; nombre: string; apellido: string };
  itemId: string | { _id: string; name: string; description: string; estimatedValue?: { monto: number; moneda: string } };
  categoryId: string | { _id: string; name: string };
  action: EndowmentAction;
  actionDate: string;
  observations?: string | null;
  condition?: string | null;
  location?: string | null;
  processedBy?: string | { _id: string; username: string; displayName?: string } | null;
  referenceNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EndowmentStats = {
  totalItems: number;
  totalCategories: number;
  totalDeliveries: number;
  totalReturns: number;
  pendingReturns: number;
  itemsByCategory: { category: string; count: number; totalValue: number }[];
  deliveriesByMonth: { month: string; count: number }[];
  topDeliveredItems: { item: string; count: number }[];
};

export type CreateEndowmentCategoryDto = Pick<EndowmentCategory, 'name' | 'description'> & Partial<Pick<EndowmentCategory, 'icon' | 'color' | 'isActive'>>;
export type UpdateEndowmentCategoryDto = Partial<CreateEndowmentCategoryDto>;

export type CreateEndowmentItemDto = Pick<EndowmentItem, 'name' | 'description'> & {
  categoryId: string;
} & Partial<Pick<EndowmentItem, 'brand' | 'model' | 'serialNumber' | 'estimatedValue' | 'condition' | 'isActive'>>;
export type UpdateEndowmentItemDto = Partial<CreateEndowmentItemDto>;

export type CreateEndowmentTrackingDto = {
  empleadoId: string;
  itemId: string;
  action: EndowmentAction;
  actionDate: string;
  observations?: string;
  condition?: string;
  location?: string;
  referenceNumber?: string;
};
export type UpdateEndowmentTrackingDto = Partial<CreateEndowmentTrackingDto>;
