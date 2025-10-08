"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = {
	size?: LoaderSize;
	className?: string;
	label?: string; // accesible
	colorClassName?: string; // e.g. 'text-primary' | 'text-blue-500'
	variant?: 'primary' | 'secondary' | 'accent';
};

const sizeClass: Record<LoaderSize, string> = {
	xs: 'loading-xs',
	sm: 'loading-sm',
	md: 'loading-md',
	lg: 'loading-lg',
	xl: 'loading-xl',
};

const variantColors: Record<string, string> = {
	primary: 'text-blue-600',
	secondary: 'text-gray-600',
	accent: 'text-blue-500',
};

export default function Loader({ 
	size = 'md', 
	className = '', 
	label = 'Cargando', 
	colorClassName,
	variant = 'primary'
}: Props) {
	const { theme } = useTheme();
	
	// Determinar el color basado en el tema y variante
	const getColorClass = () => {
		if (colorClassName) return colorClassName;
		
		const baseColor = variantColors[variant] || variantColors.primary;
		
		// Ajustar colores para tema oscuro
		if (theme === 'dark') {
			switch (variant) {
				case 'primary':
					return 'text-blue-400';
				case 'secondary':
					return 'text-gray-400';
				case 'accent':
					return 'text-blue-300';
				default:
					return 'text-blue-400';
			}
		}
		
		return baseColor;
	};

	const cls = `loading loading-infinity ${sizeClass[size]} ${getColorClass()} ${className}`.trim();

	return (
		<span 
			role="status" 
			aria-live="polite" 
			aria-label={label} 
			className={cls}
			style={{
				'--loading-color': theme === 'dark' ? '#60a5fa' : '#2563eb'
			} as React.CSSProperties}
		/>
	);
}

