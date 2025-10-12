"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Area, Cargo } from '@/lib/service-rrhh/types';
import type { Shift, FixedSchedule, ScheduleType } from '@/lib/service-sistema/attendance.api';
import { assignByScheduleType } from '@/lib/service-sistema/attendance.api';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	scheduleType: ScheduleType;
	shift: Shift | null;
	fixedSchedule?: FixedSchedule;
	token: string;
	areas: Area[];
	cargos: Cargo[];
	onAssignmentsUpdated?: () => void | Promise<void>;
};

export default function ShiftAssignmentsModal({
	isOpen,
	onClose,
	scheduleType,
	shift,
	fixedSchedule,
	token,
	areas,
	cargos,
	onAssignmentsUpdated,
}: Props) {
	const [submitting, setSubmitting] = React.useState(false);
	const [areaQuery, setAreaQuery] = React.useState('');
	const [cargoQuery, setCargoQuery] = React.useState('');
	const [selectedAreas, setSelectedAreas] = React.useState<Set<string>>(new Set());
	const [selectedCargos, setSelectedCargos] = React.useState<Set<string>>(new Set());

	// Inicializar selección al abrir
	React.useEffect(() => {
		if (!isOpen) return;
		const initialAreas = new Set<string>(
			scheduleType === 'FIXED' ? (fixedSchedule?.assignedAreas ?? []) : (shift?.assignedAreas ?? [])
		);
		const initialCargos = new Set<string>(
			scheduleType === 'FIXED' ? (fixedSchedule?.assignedCargos ?? []) : (shift?.assignedCargos ?? [])
		);
		setSelectedAreas(initialAreas);
		setSelectedCargos(initialCargos);
		setAreaQuery('');
		setCargoQuery('');
	}, [isOpen, scheduleType, fixedSchedule, shift]);

	const filteredAreas = React.useMemo(() => {
		const q = areaQuery.trim().toLowerCase();
		if (!q) return areas;
		return areas.filter(a => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
	}, [areaQuery, areas]);

	const filteredCargos = React.useMemo(() => {
		const q = cargoQuery.trim().toLowerCase();
		if (!q) return cargos;
		return cargos.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
	}, [cargoQuery, cargos]);

	const toggleArea = (id: string) => {
		setSelectedAreas(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	};

	const toggleCargo = (id: string) => {
		setSelectedCargos(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	};

	const selectAllAreas = () => setSelectedAreas(new Set(areas.map(a => a._id)));
	const clearAreas = () => setSelectedAreas(new Set());
	const selectAllCargos = () => setSelectedCargos(new Set(cargos.map(c => c._id)));
	const clearCargos = () => setSelectedCargos(new Set());

	const handleSave = async () => {
		if (!token) return;
		setSubmitting(true);
		try {
			if (scheduleType === 'FIXED') {
				await assignByScheduleType(
					token,
					'FIXED',
					{ areaIds: Array.from(selectedAreas), cargoIds: Array.from(selectedCargos) }
				);
			} else {
				if (!shift) throw new Error('Turno no definido');
				// Guardar áreas y cargos por separado para rotativos
				await assignByScheduleType(token, 'ROTATING', { areaIds: Array.from(selectedAreas) }, shift.id);
				await assignByScheduleType(token, 'ROTATING', { cargoIds: Array.from(selectedCargos) }, shift.id);
			}
			await onAssignmentsUpdated?.();
			onClose();
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`${scheduleType === 'FIXED' ? 'Horario Fijo' : 'Turno Rotativo'} - Asignaciones`}
			maxWidth="4xl"
		>
			<div className="p-6 space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Áreas */}
					<div className="rounded-lg border" style={{ borderColor: 'var(--border)' }}>
						<div className="p-4 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
							<div>
								<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Áreas</h3>
								<p className="text-xs" style={{ color: 'var(--text-muted)' }}>
									Seleccionadas: {selectedAreas.size} / {areas.length}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="neutral" onClick={selectAllAreas} className="text-xs px-2 py-1">Todas</Button>
								<Button variant="neutral" onClick={clearAreas} className="text-xs px-2 py-1">Limpiar</Button>
							</div>
						</div>
						<div className="p-4">
							<Input placeholder="Buscar área..." value={areaQuery} onChange={e => setAreaQuery(e.target.value)} />
							<div className="mt-3 max-h-64 overflow-auto space-y-2">
								{filteredAreas.map(area => (
									<label key={area._id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50" style={{ color: 'var(--text-primary)' }}>
										<input type="checkbox" checked={selectedAreas.has(area._id)} onChange={() => toggleArea(area._id)} />
										<span className="text-sm">{area.name}</span>
										<span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{area.code}</span>
									</label>
								))}
								{filteredAreas.length === 0 && (
									<p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin resultados</p>
								)}
							</div>
						</div>
					</div>

					{/* Cargos */}
					<div className="rounded-lg border" style={{ borderColor: 'var(--border)' }}>
						<div className="p-4 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
							<div>
								<h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cargos</h3>
								<p className="text-xs" style={{ color: 'var(--text-muted)' }}>
									Seleccionados: {selectedCargos.size} / {cargos.length}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="neutral" onClick={selectAllCargos} className="text-xs px-2 py-1">Todos</Button>
								<Button variant="neutral" onClick={clearCargos} className="text-xs px-2 py-1">Limpiar</Button>
							</div>
						</div>
						<div className="p-4">
							<Input placeholder="Buscar cargo..." value={cargoQuery} onChange={e => setCargoQuery(e.target.value)} />
							<div className="mt-3 max-h-64 overflow-auto space-y-2">
								{filteredCargos.map(cargo => (
									<label key={cargo._id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50" style={{ color: 'var(--text-primary)' }}>
										<input type="checkbox" checked={selectedCargos.has(cargo._id)} onChange={() => toggleCargo(cargo._id)} />
										<span className="text-sm">{cargo.name}</span>
										<span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{cargo.code}</span>
									</label>
								))}
								{filteredCargos.length === 0 && (
									<p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin resultados</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
					<button
						type="button"
						onClick={onClose}
						disabled={submitting}
						className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
						style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
					>
						Cancelar
					</button>
					<Button onClick={handleSave} disabled={submitting} className="px-4 py-2">
						{submitting ? 'Guardando...' : 'Guardar'}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
