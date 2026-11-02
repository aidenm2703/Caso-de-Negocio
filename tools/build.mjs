#!/usr/bin/env node
/**
 * TOOLS/BUILD.MJS - BUNDLER STANDALONE SIN DEPENDENCIAS
 * Lee la arquitectura modular en src/, empaqueta todo el CSS, HTML y JS,
 * y genera el archivo único entregable: dist/sol-de-casa.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Iniciando empaquetado de Sol de Casa...');

// 1. Leer estilos CSS
const themeCss = fs.readFileSync(path.join(rootDir, 'src/styles/theme.css'), 'utf-8');
const layoutCss = fs.readFileSync(path.join(rootDir, 'src/styles/layout.css'), 'utf-8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'src/styles/components.css'), 'utf-8');
const printCss = fs.readFileSync(path.join(rootDir, 'src/styles/print.css'), 'utf-8');
const loginCss = fs.readFileSync(path.join(rootDir, 'src/styles/login.css'), 'utf-8');

const combinedCss = `
${themeCss}
${layoutCss}
${componentsCss}
${printCss}
${loginCss}
`;

// 2. Leer código fuente modular
const caseDataJs = fs.readFileSync(path.join(rootDir, 'src/data/caseData.js'), 'utf-8');
const formatJs = fs.readFileSync(path.join(rootDir, 'src/utils/format.js'), 'utf-8');
const interpolationJs = fs.readFileSync(path.join(rootDir, 'src/model/interpolation.js'), 'utf-8');
const funnelJs = fs.readFileSync(path.join(rootDir, 'src/model/funnel.js'), 'utf-8');
const unitEconomicsJs = fs.readFileSync(path.join(rootDir, 'src/model/unitEconomics.js'), 'utf-8');
const cashJs = fs.readFileSync(path.join(rootDir, 'src/model/cash.js'), 'utf-8');
const plansJs = fs.readFileSync(path.join(rootDir, 'src/model/plans.js'), 'utf-8');
const optimizerJs = fs.readFileSync(path.join(rootDir, 'src/model/optimizer.js'), 'utf-8');
const sensitivityJs = fs.readFileSync(path.join(rootDir, 'src/model/sensitivity.js'), 'utf-8');
const stressJs = fs.readFileSync(path.join(rootDir, 'src/model/stress.js'), 'utf-8');
const appContextJs = fs.readFileSync(path.join(rootDir, 'src/context/appContext.js'), 'utf-8');
const routesJs = fs.readFileSync(path.join(rootDir, 'src/routes/routes.js'), 'utf-8');
const caseServiceJs = fs.readFileSync(path.join(rootDir, 'src/services/caseService.js'), 'utf-8');
const dashboardServiceJs = fs.readFileSync(path.join(rootDir, 'src/services/dashboardService.js'), 'utf-8');
const caseComponentsJs = fs.readFileSync(path.join(rootDir, 'src/components/caseComponents.js'), 'utf-8');
const casesPageJs = fs.readFileSync(path.join(rootDir, 'src/pages/casesPage.js'), 'utf-8');
const portalPageJs = fs.readFileSync(path.join(rootDir, 'src/pages/portalPage.js'), 'utf-8');
const appClientJs = fs.readFileSync(path.join(rootDir, 'src/ui/appClient.js'), 'utf-8');

// Eliminar imports y exports ES6 para que se ejecuten dentro de un solo script en el navegador
function stripModules(code) {
  return code
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
    .replace(/export\s+\{.*?\};?/g, '')
    .replace(/export\s+default\s+.*?;?/g, '');
}

const cleanedCaseData = stripModules(caseDataJs);
const cleanedFormat = stripModules(formatJs);
const cleanedInterpolation = stripModules(interpolationJs);
const cleanedFunnel = stripModules(funnelJs);
const cleanedUnitEconomics = stripModules(unitEconomicsJs);
const cleanedCash = stripModules(cashJs);
const cleanedPlans = stripModules(plansJs);
const cleanedOptimizer = stripModules(optimizerJs);
const cleanedSensitivity = stripModules(sensitivityJs);
const cleanedStress = stripModules(stressJs);
const cleanedAppClient = stripModules(appClientJs);

// 3. Leer plantilla HTML
const templatePath = path.join(rootDir, 'src/template.html');
if (!fs.existsSync(templatePath)) {
  console.error('ERROR: No se encontró src/template.html');
  process.exit(1);
}
const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

// 4. Inyectar CSS y JavaScript
const combinedJs = `
${cleanedCaseData}
${cleanedFormat}
${cleanedInterpolation}
${cleanedFunnel}
${cleanedUnitEconomics}
${cleanedCash}
${cleanedPlans}
${cleanedOptimizer}
${cleanedSensitivity}
${cleanedStress}
${stripModules(appContextJs)}
${stripModules(routesJs)}
${stripModules(caseServiceJs)}
${stripModules(dashboardServiceJs)}
${stripModules(caseComponentsJs)}
${stripModules(casesPageJs)}
${stripModules(portalPageJs)}
${cleanedAppClient}
`;

const finalHtml = htmlTemplate
  .replace('/* STYLES_INJECTION */', combinedCss)
  .replace('/* JAVASCRIPT_INJECTION */', combinedJs);

// 5. Generar archivo único en dist/sol-de-casa.html
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const outputPath = path.join(distDir, 'sol-de-casa.html');
fs.writeFileSync(outputPath, finalHtml, 'utf-8');

const stats = fs.statSync(outputPath);
console.log(`✅ Archivo standalone generado exitosamente en: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
