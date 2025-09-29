"use client";
import React from 'react';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = {
	size?: LoaderSize;
	className?: string;
	label?: string; // accesible
	colorClassName?: string; // e.g. 'text-primary' | 'text-blue-500'
};

const sizeClass: Record<LoaderSize, string> = {
	xs: 'loading-xs',
	sm: 'loading-sm',
	md: 'loading-md',
	lg: 'loading-lg',
	xl: 'loading-xl',
};

export default function Loader({ size = 'md', className = '', label = 'Cargando', colorClassName }: Props) {
	const cls = `loading loading-infinity ${sizeClass[size]} ${colorClassName ?? ''} ${className}`.trim();

	return (
		<span role="status" aria-live="polite" aria-label={label} className={cls} />
	);
}

