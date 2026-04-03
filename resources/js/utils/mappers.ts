/**
 * Mappers between frontend camelCase interfaces (CemeteryDashboard)
 * and backend snake_case API responses.
 */

import type { Burial as FeBurial, Lease as FeLease } from '@/app/components/CemeteryDashboard';
import type { Burial as ApiBurial } from '@/services/BurialService';
import type { Lease as ApiLease } from '@/services/LeaseService';

// ─── Burial mappings ─────────────────────────────────────────────────────────

export function apiBurialToFe(b: ApiBurial): FeBurial {
  return {
    id: b.id,
    cemeteryId: b.cemetery_id ?? 0,
    galsc: b.galsc,
    burialNumber: b.burial_number,
    deceasedName: b.deceased_name,
    dateOfBirth: b.date_of_birth ?? '',
    dateOfDeath: b.date_of_death ?? '',
    burialDate: b.burial_date,
    quadra: b.quadra ?? '',
    plotNumber: b.plot_number ?? '',
    sector: b.sector ?? '',
    burialType: b.burial_type as FeBurial['burialType'],
    currentStatus: b.current_status as FeBurial['currentStatus'],
    responsibleName: b.responsible_name ?? '',
    responsiblePhone: b.responsible_phone ?? '',
    notes: b.notes,
    regularizationPeriodYears: b.regularization_period_years,
    nextRegularizationDate: b.next_regularization_date,
    lastRegularizationDate: b.last_regularization_date,
  };
}

export function feBurialToApi(b: Omit<FeBurial, 'id'>): Omit<ApiBurial, 'id' | 'created_at' | 'updated_at'> {
  return {
    cemetery_id: b.cemeteryId || null,
    galsc: b.galsc,
    burial_number: b.burialNumber,
    deceased_name: b.deceasedName,
    date_of_birth: b.dateOfBirth || undefined,
    date_of_death: b.dateOfDeath || undefined,
    burial_date: b.burialDate,
    quadra: b.quadra,
    plot_number: b.plotNumber,
    sector: b.sector,
    burial_type: b.burialType,
    current_status: b.currentStatus,
    responsible_name: b.responsibleName,
    responsible_phone: b.responsiblePhone,
    notes: b.notes,
    regularization_period_years: b.regularizationPeriodYears,
    next_regularization_date: b.nextRegularizationDate,
    last_regularization_date: b.lastRegularizationDate,
  };
}

// ─── Lease mappings ──────────────────────────────────────────────────────────

export function apiLeaseToFe(l: ApiLease): FeLease {
  return {
    id: l.id,
    cemeteryId: l.cemetery_id ?? 0,
    leaseholderName: l.leaseholder_name,
    quadra: l.quadra ?? '',
    plotNumber: l.plot_number ?? '',
    sector: l.sector ?? '',
    leaseType: l.lease_type as FeLease['leaseType'],
    startDate: l.start_date,
    expiryDate: l.expiry_date,
    status: l.status as FeLease['status'],
    amount: Number(l.amount),
    responsibleName: l.responsible_name ?? '',
    responsiblePhone: l.responsible_phone ?? '',
    notes: l.notes,
    regularizationPeriodYears: l.regularization_period_years,
    nextRegularizationDate: l.next_regularization_date,
    lastRegularizationDate: l.last_regularization_date,
  };
}

export function feLeaseToApi(l: Omit<FeLease, 'id'>): Omit<ApiLease, 'id' | 'created_at' | 'updated_at'> {
  return {
    cemetery_id: l.cemeteryId || null,
    leaseholder_name: l.leaseholderName,
    quadra: l.quadra,
    plot_number: l.plotNumber,
    sector: l.sector,
    lease_type: l.leaseType,
    start_date: l.startDate,
    expiry_date: l.expiryDate,
    status: l.status,
    amount: l.amount,
    responsible_name: l.responsibleName,
    responsible_phone: l.responsiblePhone,
    notes: l.notes,
    regularization_period_years: l.regularizationPeriodYears,
    next_regularization_date: l.nextRegularizationDate,
    last_regularization_date: l.lastRegularizationDate,
  };
}
