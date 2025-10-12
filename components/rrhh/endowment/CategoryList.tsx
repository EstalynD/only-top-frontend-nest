"use client";
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Edit3 } from 'lucide-react';
import type { EndowmentCategory } from '@/lib/service-rrhh/types';
import * as LucideIcons from 'lucide-react';

interface CategoryListProps {
  categories: EndowmentCategory[];
  onDelete: (id: string) => void;
  loading?: boolean;
  onEdit?: (category: EndowmentCategory) => void;
}

export default function CategoryList({ categories, onDelete, loading = false, onEdit }: CategoryListProps) {
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent size={16} /> : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No hay categorías creadas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div 
          key={category._id} 
          className="flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" 
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: category.color || 'var(--ot-blue-500)' }} 
            />
            
            <div className="flex items-center gap-2">
              {getIconComponent(category.icon ?? undefined) && (
                <div style={{ color: category.color || 'var(--ot-blue-500)' }}>
                  {getIconComponent(category.icon ?? undefined)}
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {category.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {category.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(category)}
              >
                <Edit3 size={16} />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(category._id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
