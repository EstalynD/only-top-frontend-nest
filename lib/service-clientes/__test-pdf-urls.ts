/**
 * Este archivo es SOLO para pruebas/demostración
 * Muestra cómo se generan las URLs de PDF
 * ELIMINAR antes de producción
 */

import { API_BASE } from '../config';
import { CLIENTES_ROUTES } from './routes';
import { getPdfViewUrl, getPdfDownloadUrl } from './api-contratos';

// Datos de ejemplo
const contratoIdEjemplo = '68deae2f639d6ac8668f8875';
const numeroContratoEjemplo = 'CTMO-2025-00001';

console.log('='.repeat(80));
console.log('DEMOSTRACIÓN DE URLs DE PDF - Sistema Profesional');
console.log('='.repeat(80));

console.log('\n📋 Configuración:');
console.log(`  API_BASE: ${API_BASE}`);

console.log('\n🔗 URLs Generadas:');

// URL para ver PDF
const pdfViewUrl = getPdfViewUrl(contratoIdEjemplo, numeroContratoEjemplo);
console.log(`\n  1. Ver PDF (inline):`);
console.log(`     ${pdfViewUrl}`);

// URL para descargar PDF
const pdfDownloadUrl = getPdfDownloadUrl(contratoIdEjemplo);
console.log(`\n  2. Descargar PDF:`);
console.log(`     ${pdfDownloadUrl}`);

// Rutas base (sin API_BASE)
console.log('\n📍 Rutas Base (relativas):');
console.log(`  View:     ${CLIENTES_ROUTES.contratos.pdfView(contratoIdEjemplo, numeroContratoEjemplo)}`);
console.log(`  Download: ${CLIENTES_ROUTES.contratos.pdfDownload(contratoIdEjemplo)}`);
console.log(`  Info:     ${CLIENTES_ROUTES.contratos.pdfInfo(contratoIdEjemplo)}`);

console.log('\n✅ Ventajas:');
console.log('  • Todas las URLs usan API_BASE del frontend');
console.log('  • Las peticiones pasan por el proxy del frontend');
console.log('  • Fácil cambiar entre desarrollo y producción');
console.log('  • URLs limpias y profesionales');

console.log('\n🔄 Flujo de la petición:');
console.log('  Browser → Frontend (3041) → Backend (4000) → PDF generado on-demand');

console.log('\n' + '='.repeat(80));
console.log('✨ Sistema configurado correctamente');
console.log('='.repeat(80) + '\n');

