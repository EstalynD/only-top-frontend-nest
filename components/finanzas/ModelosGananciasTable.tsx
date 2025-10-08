/**
 * ModelosGananciasTable Component
 * 
 * Tabla con lista de modelos y sus ganancias del mes.
 */

'use client';

import React from 'react';
import { Eye, Calculator, RefreshCw, Search, Filter, Info } from 'lucide-react';
import type { ModeloConGanancias } from '@/lib/service-finanzas';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { FinanzasStatusBadge } from '@/components/ui/FinanzasStatusBadge';
import { CurrencyCode } from '@/lib/utils/money';

interface ModelosGananciasTableProps {
  modelos: ModeloConGanancias[];
  loading?: boolean;
  onCalcular: (modeloId: string) => void;
  onVerDetalle: (modelo: ModeloConGanancias) => void;
  periodo: { mes: number; anio: number };
  onActualizarComisionBanco?: (porcentaje: number) => void;
}

export function ModelosGananciasTable({
  modelos,
  loading = false,
  onCalcular,
  onVerDetalle,
  periodo,
  onActualizarComisionBanco,
}: ModelosGananciasTableProps) {
  const [busqueda, setBusqueda] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState<string>('TODOS');
  const [editandoComision, setEditandoComision] = React.useState(false);
  const [nuevoPortcentajeComision, setNuevoPortcentajeComision] = React.useState(2);

  const modelosFiltrados = React.useMemo(() => {
    // Validación defensiva: asegurar que modelos es un array
    if (!Array.isArray(modelos)) {
      return [];
    }
    
    return modelos.filter((modelo) => {
      const matchBusqueda =
        busqueda === '' ||
        modelo.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        modelo.email.toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado =
        filtroEstado === 'TODOS' ||
        (filtroEstado === 'SIN_CALCULAR' && !modelo.tieneFinanzas) ||
        (modelo.finanzas?.estado === filtroEstado);

      return matchBusqueda && matchEstado;
    });
  }, [modelos, busqueda, filtroEstado]);

  // Calcular totales y porcentajes de participación
  const totales = React.useMemo(() => {
    if (!Array.isArray(modelos) || modelos.length === 0) {
      return {
        ventasNetas: '$ 0.00',
        gananciaModelo: '$ 0.00',
        gananciaOTBruta: '$ 0.00',
        gananciaOTNeta: '$ 0.00',
        comisionBanco: '$ 0.00',
        comisionBancoPromedio: 2,
      };
    }

    let totalVentas = 0;
    let totalGananciaModelo = 0;
    let totalComisionAgencia = 0;
    let totalGananciaOTNeta = 0;
    let totalComisionBanco = 0;
    let sumaComisionBancoPorcentaje = 0;
    let modelosConFinanzas = 0;

    // Extraer moneda del primer modelo (todas deberían ser la misma)
    let currencySymbol = '$';
    let currencyCode = '';
    if (modelos.length > 0 && modelos[0].finanzas) {
      const firstFormat = modelos[0].finanzas.ventasNetas;
      // Extraer símbolo y código del formato (ej: "USD $ 2,500.00" o "$ 2,500.00")
      const match = firstFormat.match(/^([A-Z]{3}\s)?([^0-9\s]+)/);
      if (match) {
        currencyCode = match[1] ? match[1].trim() : '';
        currencySymbol = match[2] || '$';
      }
    }

    modelos.forEach((modelo) => {
      if (modelo.finanzas) {
        const ventas = parseFloat(modelo.finanzas.ventasNetas.replace(/[^0-9.-]/g, ''));
        const gananciaM = parseFloat(modelo.finanzas.gananciaModelo.replace(/[^0-9.-]/g, ''));
        const comisionAgencia = parseFloat(modelo.finanzas.comisionAgencia.replace(/[^0-9.-]/g, ''));
        const gananciaOT = parseFloat(modelo.finanzas.gananciaOnlyTop.replace(/[^0-9.-]/g, ''));
        const comisionB = parseFloat(modelo.finanzas.comisionBanco.replace(/[^0-9.-]/g, ''));
        
        totalVentas += ventas;
        totalGananciaModelo += gananciaM;
        totalComisionAgencia += comisionAgencia;
        totalGananciaOTNeta += gananciaOT;
        totalComisionBanco += comisionB;
        sumaComisionBancoPorcentaje += modelo.finanzas.porcentajeComisionBanco;
        modelosConFinanzas++;
      }
    });

    const comisionBancoPromedio = modelosConFinanzas > 0 
      ? sumaComisionBancoPorcentaje / modelosConFinanzas 
      : 2;

    // Formatear totales manteniendo el mismo estilo del backend
    const formatTotal = (amount: number): string => {
      const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return currencyCode 
        ? `${currencyCode} ${currencySymbol} ${formatted}`
        : `${currencySymbol} ${formatted}`;
    };

    return {
      ventasNetas: formatTotal(totalVentas),
      gananciaModelo: formatTotal(totalGananciaModelo),
      gananciaOTBruta: formatTotal(totalComisionAgencia),
      gananciaOTNeta: formatTotal(totalGananciaOTNeta),
      comisionBanco: formatTotal(totalComisionBanco),
      comisionBancoPromedio,
    };
  }, [modelos]);

  // Calcular porcentaje de participación para cada modelo
  const calcularParticipacion = (gananciaOT: string): number => {
    const totalNeto = parseFloat(totales.gananciaOTNeta.replace(/[^0-9.-]/g, ''));
    if (totalNeto === 0) return 0;
    const ganancia = parseFloat(gananciaOT.replace(/[^0-9.-]/g, ''));
    return (ganancia / totalNeto) * 100;
  };

  const handleActualizarComisionBanco = () => {
    if (onActualizarComisionBanco) {
      onActualizarComisionBanco(nuevoPortcentajeComision);
      setEditandoComision(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--surface-muted)' }} />
        <div className="h-96 rounded-xl animate-pulse" style={{ background: 'var(--surface-muted)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Filtro de Estado */}
        <div className="sm:w-64">
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] appearance-none cursor-pointer"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="SIN_CALCULAR">Sin calcular</option>
              <option value="CALCULADO">Calculado</option>
              <option value="PENDIENTE_REVISION">Pendiente revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="PAGADO">Pagado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Mostrando {modelosFiltrados.length} de {Array.isArray(modelos) ? modelos.length : 0} modelos
        </p>
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-muted)' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Modelo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Email
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  % Acuerdo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Ventas Netas
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Ganancia Modelo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Ganancia OT
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  % Part.
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {modelosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No se encontraron modelos
                    </p>
                  </td>
                </tr>
              ) : (
                modelosFiltrados.map((modelo) => (
                  <tr
                    key={modelo.modeloId}
                    className="border-t hover:bg-opacity-50 transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {modelo.nombreCompleto}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {modelo.email}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {modelo.finanzas ? (
                        <span
                          className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: 'var(--ot-blue-500)15',
                            color: 'var(--ot-blue-500)',
                          }}
                        >
                          {modelo.finanzas.porcentajeComisionAgencia}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--text-primary)' }}>
                      {modelo.finanzas ? modelo.finanzas.ventasNetas : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#10b981' }}>
                      {modelo.finanzas ? modelo.finanzas.gananciaModelo : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#8b5cf6' }}>
                      {modelo.finanzas ? modelo.finanzas.gananciaOnlyTop : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--ot-blue-500)' }}>
                      {modelo.finanzas ? `${calcularParticipacion(modelo.finanzas.gananciaOnlyTop).toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {modelo.finanzas ? (
                        <div className="flex justify-center">
                          <FinanzasStatusBadge estado={modelo.finanzas.estado} size="sm" />
                        </div>
                      ) : (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: 'var(--surface-muted)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Sin calcular
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {modelo.finanzas ? (
                          <>
                            <button
                              onClick={() => onVerDetalle(modelo)}
                              className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                              style={{
                                color: 'var(--ot-blue-500)',
                                background: 'transparent',
                              }}
                              title="Ver detalle"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => onCalcular(modelo.modeloId)}
                              className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                              style={{
                                color: '#f59e0b',
                                background: 'transparent',
                              }}
                              title="Recalcular"
                            >
                              <RefreshCw size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onCalcular(modelo.modeloId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                            style={{
                              background: 'var(--ot-blue-500)',
                              color: '#ffffff',
                            }}
                          >
                            <Calculator size={14} className="inline mr-1" />
                            Calcular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              {/* Fila 1: TOTAL (Ganancias BRUTAS, antes de comisión bancaria) */}
              <tr
                className="border-t-2 font-bold"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface-muted)',
                }}
              >
                <td colSpan={3} className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  TOTAL
                </td>
                <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--text-primary)' }}>
                  {totales.ventasNetas}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#10b981' }}>
                  {totales.gananciaModelo}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#8b5cf6' }}>
                  {totales.gananciaOTBruta}
                </td>
                <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  —
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
              </tr>
              
              {/* Fila 2: TOTAL (-) Comisión Bancos (Ganancias NETAS, después de comisión bancaria) */}
              <tr
                className="border-t font-bold"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                }}
              >
                <td colSpan={3} className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  TOTAL (-) Comisión Bancos ({totales.comisionBancoPromedio.toFixed(1)}%)
                </td>
                <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--text-primary)' }}>
                  {totales.ventasNetas}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#10b981' }}>
                  {totales.gananciaModelo}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#8b5cf6' }}>
                  {totales.gananciaOTNeta}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--ot-blue-500)' }}>
                  100.0%
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {editandoComision ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={nuevoPortcentajeComision}
                          onChange={(e) => setNuevoPortcentajeComision(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 rounded border text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                          style={{
                            background: 'var(--input-bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        <button
                          onClick={handleActualizarComisionBanco}
                          className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                          style={{
                            background: 'var(--ot-blue-500)',
                            color: '#ffffff',
                          }}
                        >
                          Aplicar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoComision(false);
                            setNuevoPortcentajeComision(totales.comisionBancoPromedio);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: 'var(--surface-muted)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditandoComision(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                        style={{
                          background: 'var(--ot-blue-500)15',
                          color: 'var(--ot-blue-500)',
                        }}
                      >
                        Editar % Comisión
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
