import { requestJSON } from '../utils/fetcher';

export type CommissionType = 'PERCENTAGE' | 'FIXED_USD' | 'FIXED_COP';

export interface PaymentProcessor {
  _id: string;
  name: string;
  commissionType: CommissionType;
  commissionValue: number;
  effectiveDate: string;
  isActive: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentProcessorRequest {
  name: string;
  commissionType: CommissionType;
  commissionValue: number;
  effectiveDate: string;
  isActive?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentProcessorRequest {
  name?: string;
  commissionType?: CommissionType;
  commissionValue?: number;
  effectiveDate?: string;
  isActive?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CommissionRule {
  minUsd: number;
  maxUsd?: number;
  percentage: number;
}

export interface CommissionScale {
  _id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  rules: CommissionRule[];
  description?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommissionScaleRequest {
  name: string;
  isActive?: boolean;
  isDefault?: boolean;
  rules: CommissionRule[];
  description?: string;
}

export interface UpdateCommissionScaleRequest {
  name?: string;
  isActive?: boolean;
  isDefault?: boolean;
  rules?: CommissionRule[];
  description?: string;
}

export interface CommissionCalculation {
  amountUsd: number;
  rule: {
    minUsd: number;
    maxUsd?: number;
    percentage: number;
  };
  commissionPercentage: number;
  commissionAmount: number;
  netAmount: number;
  scaleName: string;
}

const FINANCE_ROUTES = {
  paymentProcessors: '/sistema/finance/payment-processors',
  paymentProcessor: (id: string) => `/sistema/finance/payment-processors/${id}`,
  commissionScales: '/sistema/finance/commission-scales',
  commissionScale: (id: string) => `/sistema/finance/commission-scales/${id}`,
  activeCommissionScale: '/sistema/finance/commission-scales/active/current',
  activateCommissionScale: (id: string) => `/sistema/finance/commission-scales/${id}/activate`,
  calculateCommission: '/sistema/finance/calculate-commission',
  createDefaultScale: '/sistema/finance/commission-scales/default',
} as const;

// === PAYMENT PROCESSORS ===

export function getPaymentProcessors(token: string, activeOnly = false) {
  const url = activeOnly 
    ? `${FINANCE_ROUTES.paymentProcessors}?active=true`
    : FINANCE_ROUTES.paymentProcessors;
    
  return requestJSON<PaymentProcessor[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getPaymentProcessor(token: string, id: string) {
  return requestJSON<PaymentProcessor>(FINANCE_ROUTES.paymentProcessor(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createPaymentProcessor(token: string, data: CreatePaymentProcessorRequest) {
  return requestJSON<PaymentProcessor>(FINANCE_ROUTES.paymentProcessors, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updatePaymentProcessor(token: string, id: string, data: UpdatePaymentProcessorRequest) {
  return requestJSON<PaymentProcessor>(FINANCE_ROUTES.paymentProcessor(id), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function deletePaymentProcessor(token: string, id: string) {
  return requestJSON<{ success: boolean; id: string }>(FINANCE_ROUTES.paymentProcessor(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === COMMISSION SCALES ===

export function getCommissionScales(token: string) {
  return requestJSON<CommissionScale[]>(FINANCE_ROUTES.commissionScales, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getCommissionScale(token: string, id: string) {
  return requestJSON<CommissionScale>(FINANCE_ROUTES.commissionScale(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getActiveCommissionScale(token: string) {
  return requestJSON<CommissionScale | null>(FINANCE_ROUTES.activeCommissionScale, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createCommissionScale(token: string, data: CreateCommissionScaleRequest) {
  return requestJSON<CommissionScale>(FINANCE_ROUTES.commissionScales, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateCommissionScale(token: string, id: string, data: UpdateCommissionScaleRequest) {
  return requestJSON<CommissionScale>(FINANCE_ROUTES.commissionScale(id), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function deleteCommissionScale(token: string, id: string) {
  return requestJSON<{ success: boolean; id: string }>(FINANCE_ROUTES.commissionScale(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function activateCommissionScale(token: string, id: string) {
  return requestJSON<CommissionScale>(FINANCE_ROUTES.activateCommissionScale(id), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function calculateCommission(token: string, amountUsd: number) {
  return requestJSON<CommissionCalculation>(FINANCE_ROUTES.calculateCommission, {
    method: 'POST',
    body: JSON.stringify({ amountUsd }),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createDefaultCommissionScale(token: string) {
  return requestJSON<CommissionScale>(FINANCE_ROUTES.createDefaultScale, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === INTERNAL COMMISSIONS ===

export interface PerformanceScale {
  fromPercent: number;
  toPercent?: number;
  commissionPercent: number;
}

export interface InternalCommissions {
  _id: string;
  key: string;
  salesCloserPercent: number;
  salesCloserMonths: number;
  traffickerPercent: number;
  chattersMinPercent: number;
  chattersMaxPercent: number;
  chattersPerformanceScale: PerformanceScale[];
  description?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateInternalCommissionsRequest {
  salesCloserPercent?: number;
  salesCloserMonths?: number;
  traffickerPercent?: number;
  chattersMinPercent?: number;
  chattersMaxPercent?: number;
  chattersPerformanceScale?: PerformanceScale[];
  description?: string;
}

export interface SalesCloserCalculation {
  subscriptionAmount: number;
  monthlyAmount: number;
  applicableMonths: number;
  applicableAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  totalMonthsConfigured: number;
  note: string;
}

export interface TraffickerCalculation {
  netSubscriptionAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  note: string;
}

export interface ChattersCalculation {
  baseAmount: number;
  goalCompletionPercent: number;
  commissionPercent: number;
  commissionAmount: number;
  scaleUsed: PerformanceScale | null;
  note: string;
}

export interface AllCommissionsCalculation {
  salesCloser: SalesCloserCalculation;
  trafficker: TraffickerCalculation;
  chatters: ChattersCalculation;
  summary: {
    totalCommission: number;
    breakdown: {
      salesCloser: number;
      trafficker: number;
      chatters: number;
    };
  };
}

const INTERNAL_COMMISSIONS_ROUTES = {
  config: '/sistema/finance/internal-commissions',
  calculateSalesCloser: '/sistema/finance/internal-commissions/calculate/sales-closer',
  calculateTrafficker: '/sistema/finance/internal-commissions/calculate/trafficker',
  calculateChatters: '/sistema/finance/internal-commissions/calculate/chatters',
  calculateAll: '/sistema/finance/internal-commissions/calculate/all',
} as const;

export function getInternalCommissions(token: string) {
  return requestJSON<InternalCommissions>(INTERNAL_COMMISSIONS_ROUTES.config, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateInternalCommissions(token: string, data: UpdateInternalCommissionsRequest) {
  return requestJSON<InternalCommissions>(INTERNAL_COMMISSIONS_ROUTES.config, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function calculateSalesCloserCommission(token: string, subscriptionAmount: number, monthsActive: number) {
  return requestJSON<SalesCloserCalculation>(INTERNAL_COMMISSIONS_ROUTES.calculateSalesCloser, {
    method: 'POST',
    body: JSON.stringify({ subscriptionAmount, monthsActive }),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function calculateTraffickerCommission(token: string, netSubscriptionAmount: number) {
  return requestJSON<TraffickerCalculation>(INTERNAL_COMMISSIONS_ROUTES.calculateTrafficker, {
    method: 'POST',
    body: JSON.stringify({ netSubscriptionAmount }),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function calculateChattersCommission(token: string, goalCompletionPercent: number, baseAmount: number) {
  return requestJSON<ChattersCalculation>(INTERNAL_COMMISSIONS_ROUTES.calculateChatters, {
    method: 'POST',
    body: JSON.stringify({ goalCompletionPercent, baseAmount }),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function calculateAllInternalCommissions(token: string, data: {
  subscriptionAmount: number;
  monthsActive: number;
  netSubscriptionAmount: number;
  goalCompletionPercent: number;
  baseAmountForChatters: number;
}) {
  return requestJSON<AllCommissionsCalculation>(INTERNAL_COMMISSIONS_ROUTES.calculateAll, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
