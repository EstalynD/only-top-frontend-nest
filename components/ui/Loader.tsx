"use client";
import React, { useMemo } from 'react';
import { useTheme } from '@/lib/theme';

/** =========================
 *   Tipos
 *  ========================= */
type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type LoaderType = 'spinner' | 'dots' | 'pulse' | 'infinity' | 'bars' | 'ring';

type LoaderState = 'loading' | 'error' | 'success';

type LoaderVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

type Props = {
	// Tamaño y apariencia
	size?: LoaderSize;
	type?: LoaderType;
	variant?: LoaderVariant;
	state?: LoaderState;
	
	// Personalización
	className?: string;
	colorClassName?: string; // e.g. 'text-primary' | 'text-blue-500'
	
	// Accesibilidad
	label?: string;
	ariaLabel?: string;
	ariaDescribedBy?: string;
	
	// Estados
	visible?: boolean;
	centered?: boolean;
	
	// Contenido adicional
	text?: string;
	showText?: boolean;
};

/** =========================
 *   Configuraciones
 *  ========================= */
const sizeClasses: Record<LoaderSize, string> = {
	xs: 'loading-xs',
	sm: 'loading-sm',
	md: 'loading-md',
	lg: 'loading-lg',
	xl: 'loading-xl',
};

const typeClasses: Record<LoaderType, string> = {
	spinner: 'loading-spinner',
	dots: 'loading-dots',
	pulse: 'loading-pulse',
	infinity: 'loading-infinity',
	bars: 'loading-bars',
	ring: 'loading-ring',
};

const variantColors: Record<LoaderVariant, { light: string; dark: string }> = {
	primary: { light: 'text-blue-600', dark: 'text-blue-400' },
	secondary: { light: 'text-gray-600', dark: 'text-gray-400' },
	accent: { light: 'text-blue-500', dark: 'text-blue-300' },
	success: { light: 'text-green-600', dark: 'text-green-400' },
	warning: { light: 'text-yellow-600', dark: 'text-yellow-400' },
	error: { light: 'text-red-600', dark: 'text-red-400' },
};

const stateIcons: Record<LoaderState, string> = {
	loading: '',
	error: '❌',
	success: '✅',
};

/** =========================
 *   Componente Principal
 *  ========================= */
export default React.memo(function Loader({ 
	size = 'md', 
	type = 'infinity',
	variant = 'primary',
	state = 'loading',
	className = '', 
	label = 'Cargando', 
	colorClassName,
	ariaLabel,
	ariaDescribedBy,
	visible = true,
	centered = false,
	text,
	showText = false
}: Props) {
	const { theme } = useTheme();
	
	// Memoizar el color basado en el tema y variante
	const colorClass = useMemo(() => {
		if (colorClassName) return colorClassName;
		
		const variantColor = variantColors[variant] || variantColors.primary;
		return theme === 'dark' ? variantColor.dark : variantColor.light;
	}, [colorClassName, variant, theme]);

	// Memoizar las clases CSS
	const loaderClasses = useMemo(() => {
		const baseClasses = `loading ${typeClasses[type]} ${sizeClasses[size]} ${colorClass}`;
		const stateClasses = state !== 'loading' ? 'opacity-50' : '';
		const visibilityClasses = !visible ? 'opacity-0 pointer-events-none' : '';
		
		return `${baseClasses} ${stateClasses} ${visibilityClasses} ${className}`.trim();
	}, [type, size, colorClass, state, visible, className]);

	// Memoizar los estilos CSS personalizados
	const customStyles = useMemo(() => {
		const styles: React.CSSProperties & { [key: string]: string } = {};
		
		// Color personalizado para el loader
		if (theme === 'dark') {
			styles['--loading-color'] = variant === 'primary' ? '#60a5fa' : 
										variant === 'secondary' ? '#9ca3af' :
										variant === 'accent' ? '#93c5fd' :
										variant === 'success' ? '#4ade80' :
										variant === 'warning' ? '#fbbf24' :
										variant === 'error' ? '#f87171' : '#60a5fa';
		} else {
			styles['--loading-color'] = variant === 'primary' ? '#2563eb' : 
										variant === 'secondary' ? '#4b5563' :
										variant === 'accent' ? '#3b82f6' :
										variant === 'success' ? '#16a34a' :
										variant === 'warning' ? '#d97706' :
										variant === 'error' ? '#dc2626' : '#2563eb';
		}
		
		return styles;
	}, [theme, variant]);

	// Memoizar atributos ARIA
	const ariaAttributes = useMemo(() => {
		const attrs: Record<string, any> = {
			'role': 'status',
			'aria-live': 'polite',
			'aria-label': ariaLabel || label,
		};
		
		if (ariaDescribedBy) attrs['aria-describedby'] = ariaDescribedBy;
		if (state === 'loading') attrs['aria-busy'] = true;
		
		return attrs;
	}, [ariaLabel, label, ariaDescribedBy, state]);

	// Si no es visible, no renderizar nada
	if (!visible) return null;

	// Si el estado no es loading, mostrar icono de estado
	if (state !== 'loading') {
		return (
			<span 
				{...ariaAttributes}
				className={`inline-flex items-center gap-2 ${colorClass} ${className}`.trim()}
			>
				<span className="text-lg">{stateIcons[state]}</span>
				{showText && text && <span className="text-sm">{text}</span>}
			</span>
		);
	}

	// Renderizar loader normal
	const loaderElement = (
		<span 
			{...ariaAttributes}
			className={loaderClasses}
			style={customStyles}
		/>
	);

	// Si está centrado, envolver en contenedor centrado
	if (centered) {
		return (
			<div className="flex items-center justify-center">
				{loaderElement}
				{showText && text && (
					<span className={`ml-2 text-sm ${colorClass}`}>
						{text}
					</span>
				)}
			</div>
		);
	}

	// Si tiene texto, mostrar junto al loader
	if (showText && text) {
		return (
			<div className="inline-flex items-center gap-2">
				{loaderElement}
				<span className={`text-sm ${colorClass}`}>
					{text}
				</span>
			</div>
		);
	}

	return loaderElement;
});

