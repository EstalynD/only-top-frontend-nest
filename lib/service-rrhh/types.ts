export interface Area {
  _id: string;
  name: string;
  code: string;
  description?: string | null;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, any>;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface Requirements {
  education: string[];
  experience: string;
  skills: string[];
  languages: string[];
}

export interface Cargo {
  _id: string;
  name: string;
  code: string;
  areaId: string | Area;
  description?: string | null;
  hierarchyLevel: number;
  salaryRange?: SalaryRange | null;
  requirements?: Requirements | null;
  isActive: boolean;
  sortOrder: number;
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
  salaryRange?: SalaryRange | null;
  requirements?: Requirements | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCargoDto extends Partial<CreateCargoDto> {}

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
