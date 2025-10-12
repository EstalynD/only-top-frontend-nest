"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface Column<T> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: {
    pageSize?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  onRowClick?: (record: T, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  emptyState?: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
  };
  className?: string;
  rowClassName?: (record: T, index: number) => string;
  headerClassName?: string;
  bodyClassName?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Buscar...",
  pagination = { pageSize: 10 },
  onRowClick,
  onSort,
  emptyState,
  className = "",
  rowClassName,
  headerClassName = "",
  bodyClassName = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filtrar datos basado en búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((record) => {
      return columns.some((column) => {
        if (!column.searchable) return false;
        
        const value = record[column.dataIndex];
        if (value === null || value === undefined) return false;
        
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginar datos
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Calcular total de páginas
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handlers
  const handleSort = useCallback((columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: SortDirection = 'asc';
    
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    setSortColumn(newDirection ? columnKey : null);
    setSortDirection(newDirection);
    
    if (onSort && newDirection) {
      onSort(columnKey, newDirection);
    }
  }, [columns, sortColumn, sortDirection, onSort]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Resetear página cuando cambian los datos
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortColumn, sortDirection]);

  // Renderizar icono de ordenamiento
  const renderSortIcon = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return null;

    const isActive = sortColumn === columnKey;
    const direction = isActive ? sortDirection : null;

    return (
      <div className="flex flex-col ml-1 opacity-60 hover:opacity-100 transition-opacity">
        <ChevronUp 
          size={12} 
          className={`transition-all duration-200 ${
            isActive && direction === 'asc' 
              ? 'text-blue-500 scale-110' 
              : 'text-gray-400 hover:text-gray-600'
          }`} 
        />
        <ChevronDown 
          size={12} 
          className={`transition-all duration-200 -mt-1 ${
            isActive && direction === 'desc' 
              ? 'text-blue-500 scale-110' 
              : 'text-gray-400 hover:text-gray-600'
          }`} 
        />
      </div>
    );
  };

  // Renderizar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 7;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        let start = Math.max(1, currentPage - 3);
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        // Ajustar si estamos cerca del final
        if (end - start < maxVisible - 1) {
          start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    const startRecord = ((currentPage - 1) * pageSize) + 1;
    const endRecord = Math.min(currentPage * pageSize, sortedData.length);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t" style={{ 
        borderColor: 'var(--border)',
        background: 'var(--surface)',
      }}>
        {/* Información de registros */}
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="font-medium">
            Mostrando <span style={{ color: 'var(--text-primary)' }}>{startRecord}</span> a{' '}
            <span style={{ color: 'var(--text-primary)' }}>{endRecord}</span> de{' '}
            <span style={{ color: 'var(--text-primary)' }}>{sortedData.length}</span> registros
          </span>
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center gap-2">
          {/* Botón Primera página */}
          {currentPage > 3 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="flex items-center justify-center min-w-[36px] h-8 rounded-lg transition-all duration-200 font-medium"
                style={{
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-muted)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                aria-label="Primera página"
              >
                1
              </button>
              {currentPage > 4 && (
                <span className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  ...
                </span>
              )}
            </>
          )}

          {/* Botón Anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: currentPage === 1 ? 'transparent' : 'var(--surface-muted)',
              border: '1px solid var(--border)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.background = 'var(--surface-hover)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.background = 'var(--surface-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className="flex items-center justify-center min-w-[36px] h-8 rounded-lg transition-all duration-200 font-medium"
                style={{
                  background: currentPage === page ? 'var(--ot-blue-500)' : 'var(--surface-muted)',
                  border: '1px solid',
                  borderColor: currentPage === page ? 'var(--ot-blue-500)' : 'var(--border)',
                  color: currentPage === page ? '#ffffff' : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.background = 'var(--surface-muted)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }
                }}
                aria-label={`Ir a página ${page}`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: currentPage === totalPages ? 'transparent' : 'var(--surface-muted)',
              border: '1px solid var(--border)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.background = 'var(--surface-hover)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.background = 'var(--surface-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>

          {/* Botón Última página */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  ...
                </span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="flex items-center justify-center min-w-[36px] h-8 rounded-lg transition-all duration-200 font-medium"
                style={{
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-muted)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                aria-label="Última página"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Estilos compartidos
  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con búsqueda */}
      {searchable && (
        <div style={cardStyle} className="p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2" 
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div style={cardStyle} className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${headerClassName}`} style={{ 
                borderColor: 'var(--border)',
                background: 'var(--surface-muted)'
              }}>
                {columns.map((column) => (
                   <th
                     key={column.key}
                     className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-colors ${
                       column.align === 'center' ? 'text-center' : 
                       column.align === 'right' ? 'text-right' : 'text-left'
                     } ${column.className || ''} ${
                       column.sortable ? 'cursor-pointer' : ''
                     }`}
                     style={{ 
                       color: 'var(--text-muted)',
                       width: column.width,
                     }}
                     onMouseEnter={(e) => {
                       if (column.sortable) {
                         e.currentTarget.style.background = 'var(--surface-hover)';
                       }
                     }}
                     onMouseLeave={(e) => {
                       if (column.sortable) {
                         e.currentTarget.style.background = 'var(--surface-muted)';
                       }
                     }}
                     onClick={() => column.sortable && handleSort(column.key)}
                   >
                    <div className={`flex items-center gap-2 ${
                      column.align === 'center' ? 'justify-center' : 
                      column.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{column.title}</span>
                      {renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={bodyClassName}>
              {loading ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="px-6 py-16 text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-500 mb-4"></div>
                      <p className="text-sm font-medium">Cargando datos...</p>
                      <p className="text-xs mt-1 opacity-75">Por favor espera un momento</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="px-6 py-16 text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {emptyState ? (
                      <div className="flex flex-col items-center">
                        {emptyState.icon && (
                          <div className="mb-4 opacity-60">
                            {emptyState.icon}
                          </div>
                        )}
                        <p className="text-sm font-medium mb-1">{emptyState.title || 'No hay datos'}</p>
                        {emptyState.description && (
                          <p className="text-xs opacity-75">{emptyState.description}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <MoreHorizontal size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-sm font-medium mb-1">No hay registros</p>
                        <p className="text-xs opacity-75">Los datos aparecerán aquí cuando estén disponibles</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((record, index) => (
                   <tr
                     key={index}
                     className={`border-b transition-colors duration-200 ${
                       onRowClick ? 'cursor-pointer' : ''
                     } ${rowClassName ? rowClassName(record, index) : ''}`}
                     style={{ 
                       borderColor: 'var(--border)',
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.background = 'var(--surface-muted)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.background = 'transparent';
                     }}
                     onClick={() => onRowClick?.(record, index)}
                   >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm transition-colors ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${column.className || ''}`}
                        style={{ 
                          color: 'var(--text-primary)',
                          width: column.width
                        }}
                      >
                        {column.render 
                          ? column.render(record[column.dataIndex], record, index)
                          : record[column.dataIndex]
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {renderPagination()}
      </div>
    </div>
  );
}
