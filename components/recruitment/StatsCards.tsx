"use client";
import React from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  Phone, 
  Video, 
  Users, 
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  DollarSign,
} from 'lucide-react';
import type { RecruitmentStats } from '@/lib/service-recruitment/types';
import { EstadoModeloCerrada } from '@/lib/service-recruitment/types';
import { ESTADOS_MODELO_CERRADA } from '@/lib/service-recruitment/constants';

interface StatsCardsProps {
  stats: RecruitmentStats;
  loading?: boolean;
}

export default function StatsCards({ stats, loading = false }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const getTrendIcon = (value: number, threshold: number) => {
    if (value >= threshold) {
      return <TrendingUp size={20} className="text-green-500" />;
    }
    return <TrendingDown size={20} className="text-red-500" />;
  };

  return (
    <div className="space-y-8">
      {/* Métricas Principales */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target size={20} className="text-blue-600" />
          Métricas Principales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cuentas Texteadas */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl shadow-sm border border-pink-200 dark:border-pink-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-500 rounded-lg">
                <MessageSquare size={24} className="text-white" />
              </div>
              {getTrendIcon(stats.totales.cuentasTexteadas, 100)}
            </div>
            <p className="text-3xl font-bold text-pink-600 mb-1">{stats.totales.cuentasTexteadas}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cuentas Texteadas</p>
            <div className="mt-3 pt-3 border-t border-pink-200 dark:border-pink-700">
              <p className="text-xs text-gray-500">
                +{stats.totales.likesRealizados} likes, +{stats.totales.comentariosRealizados} comentarios
              </p>
            </div>
          </div>

          {/* Contactos Obtenidos */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-sm border border-green-200 dark:border-green-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <Phone size={24} className="text-white" />
              </div>
              {getTrendIcon(stats.totales.contactosObtenidos, 10)}
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.totales.contactosObtenidos}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contactos Obtenidos</p>
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
              <p className="text-xs text-gray-500">
                Leads con WhatsApp/Telegram
              </p>
            </div>
          </div>

          {/* Reuniones */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Video size={24} className="text-white" />
              </div>
              {getTrendIcon(stats.totales.reunionesRealizadas, 5)}
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-1">
              {stats.totales.reunionesRealizadas}
              <span className="text-lg text-purple-400">/{stats.totales.reunionesAgendadas}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Reuniones Realizadas</p>
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
              <p className="text-xs text-gray-500">
                {stats.tasasConversion.agendadaRealizada}% efectividad
              </p>
            </div>
          </div>

          {/* Modelos Cerradas */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-sm border border-orange-200 dark:border-orange-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
              <Award size={24} className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-1">{stats.totales.modelosCerradas}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Modelos Cerradas</p>
            <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-700">
              <p className="text-xs text-gray-500">
                ¡Meta alcanzada! 🎉
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasas de Conversión */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-600" />
          Tasas de Conversión
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contacto → Reunión */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Phone size={20} className="text-blue-600" />
                </div>
                <span className="text-gray-400">→</span>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Video size={20} className="text-purple-600" />
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: 'var(--ot-blue-600)' }}>
              {stats.tasasConversion.contactoReunion}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contacto → Reunión</p>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(Number(stats.tasasConversion.contactoReunion), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Agendada → Realizada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-400">→</span>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: 'var(--ot-purple-600)' }}>
              {stats.tasasConversion.agendadaRealizada}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Agendada → Realizada</p>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${Math.min(Number(stats.tasasConversion.agendadaRealizada), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reunión → Cierre */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Video size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-400">→</span>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Users size={20} className="text-orange-600" />
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: 'var(--ot-orange-600)' }}>
              {stats.tasasConversion.reunionCierre}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Reunión → Cierre</p>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${Math.min(Number(stats.tasasConversion.reunionCierre), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Modelos y Facturación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Modelos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-orange-600" />
            Estado de Modelos Cerradas
          </h4>

          <div className="space-y-3">
            {ESTADOS_MODELO_CERRADA.map((estado) => {
              const count = stats.modelosPorEstado[estado.value as EstadoModeloCerrada] || 0;
              const percentage = stats.totales.modelosCerradas > 0 
                ? (count / stats.totales.modelosCerradas) * 100 
                : 0;

              return (
                <div key={estado.value}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {estado.value === EstadoModeloCerrada.FIRMADA && <CheckCircle size={16} style={{ color: estado.color }} />}
                      {estado.value === EstadoModeloCerrada.REGISTRADA && <Clock size={16} style={{ color: estado.color }} />}
                      {estado.value === EstadoModeloCerrada.EN_ESPERA && <AlertCircle size={16} style={{ color: estado.color }} />}
                      <span className="text-sm font-medium">{estado.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: estado.color }}>
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: estado.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Facturación Promedio */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl shadow-sm border border-green-200 dark:border-green-700 p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
            <DollarSign size={20} />
            Facturación Promedio
          </h4>

          <div className="text-center py-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Promedio Mensual por Modelo</p>
            <p className="text-5xl font-bold text-green-600 mb-4">
              ${Number(stats.promedioFacturacionModelosCerradas).toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-green-600 font-medium">
                Basado en {stats.totales.modelosCerradas} modelo{stats.totales.modelosCerradas !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${(Number(stats.promedioFacturacionModelosCerradas) * 0.3).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Comisión (30%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${(Number(stats.promedioFacturacionModelosCerradas) * stats.totales.modelosCerradas).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Facturación Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info del Período */}
      {(stats.rangoFechas.desde || stats.rangoFechas.hasta) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200">
                Estadísticas del período
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {stats.rangoFechas.desde && new Date(stats.rangoFechas.desde).toLocaleDateString('es-ES')}
                {stats.rangoFechas.desde && stats.rangoFechas.hasta && ' - '}
                {stats.rangoFechas.hasta && new Date(stats.rangoFechas.hasta).toLocaleDateString('es-ES')}
                {' • '}
                {stats.cantidadActividades} actividad{stats.cantidadActividades !== 1 ? 'es' : ''} registrada{stats.cantidadActividades !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

