# SOL DE CASA — Portal Financiero y Simulador Estratégico (Caso C)

## Estructura modular y análisis de otros casos

La fuente del HTML entregable está en `src/`. Se organiza por `routes/`, `pages/`, `components/`, `services/`, `context/`, `data/`, `model/` y `styles/`. `npm run build` empaqueta esos módulos en `dist/sol-de-casa.html`.

La ruta **Analizar casos** permite ingresar más casos con su propia fuente, inversión, leads, conversiones, capacidad y costos. El motor muestra una vista previa en vivo, compara los casos guardados y conserva sus entradas localmente en el navegador. No rellena tasas faltantes con las de Sol de Casa. Consulta [el contexto funcional](src/context/contexto.md) para ver las reglas y los límites de ese análisis.

Para analizar otro caso real, agrega al workspace el documento fuente y captura los datos de ahí. `CASO.md`, citado por un contexto previo como documento oficial, no está en el workspace actual.

## Estructura del Proyecto

```
├── dist/sol-de-casa.html          ← ENTREGABLE PRINCIPAL (doble-clic para abrir)
├── entregables/sol-de-casa-calculadora.xlsx  ← Calculadora Google Sheets con fórmulas vivas
├── docs/SHEETS_FORMULAS.md        ← Fórmulas celda a celda para copiar a Sheets
├── src/
│   ├── data/caseData.js           ← Única fuente de verdad: todos los datos del caso
│   ├── model/                     ← Lógica pura sin DOM (funciones exportables)
│   │   ├── cash.js                ← Simulador de caja a 24 meses
│   │   ├── funnel.js              ← Embudo con límite de capacidad y prioridad Google
│   │   ├── interpolation.js       ← Interpolación lineal sobre historial empírico
│   │   ├── optimizer.js           ← Grid Search, CPL de equilibrio, rendimiento marginal
│   │   ├── plans.js               ← 4 planes estratégicos y comparador
│   │   ├── sensitivity.js         ← Análisis tornado ±20%
│   │   ├── stress.js              ← Pruebas de estrés bancarias
│   │   └── unitEconomics.js       ← Contribución, CAC, LTV:CAC, valor de visita, payback
│   ├── styles/                    ← Sistema de diseño CSS modular
│   ├── template.html              ← Plantilla HTML modular (con login y greeting)
│   ├── ui/appClient.js            ← Lógica de cliente completa (auth, charts, exportaciones)
│   └── utils/format.js            ← Formateadores de moneda, %, multiplicadores
├── tests/model.test.mjs           ← 9 tests unitarios (node --test)
├── tools/
│   ├── build.mjs                  ← Bundler sin dependencias → dist/sol-de-casa.html
│   └── sheets/generate_sheets.py  ← Generador Excel con openpyxl
└── Caso_Negocio/                  ← App React/Vite alternativa (npm run dev)
```

## Comandos Rápidos

```bash
# Tests del modelo (9/9 pasan)
npm test

# Generar dist/sol-de-casa.html (entregable standalone)
npm run build

# Generar entregables/sol-de-casa-calculadora.xlsx
npm run generate:sheets

# Correr app React interactiva (desarrollo)
cd Caso_Negocio && npm run dev
```

## Credenciales de Prueba del Portal

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Andrés Villalobos | andres@soldecasa.com | admin123 | Director General (CEO) |
| Sofía Mendoza | sofia@soldecasa.com | cfo2024 | Directora Financiera (CFO) |
| Carlos Navarro | carlos@soldecasa.com | ops2024 | Jefe de Operaciones (COO) |
| Laura Restrepo | laura@soldecasa.com | growth2024 | Líder Comercial & Growth |
| Invitado | (botón "Explorar como Invitado") | — | Modo lectura |

Cada usuario ve un **saludo personalizado** y es redirigido a su pestaña prioritaria.

## Valores de Referencia (Todos verificados con tests)

| Métrica | Valor |
|---------|-------|
| Contribución por venta | $1.625,00 |
| CAC Real Meta (Hoy) | $718,13 |
| CAC Real Google (Hoy) | $535,54 |
| LTV:CAC Meta | 2,26x |
| LTV:CAC Google | 3,03x |
| Valor de visita Meta | $232,50 |
| Valor de visita Google | $427,50 |
| Caja Mes 1 (Plan Actual) | $15.736,30 |
| CPL de equilibrio Meta | ~$4,20 |
| Caja Mes 24 Plan Ganador B | >$214.000 |

## Qué hace cada pestaña del portal

1. **📑 Resumen Ejecutivo** — Memorando con LA TRAMPA, recomendación RECHAZAR Leadly, tabla de 3 escenarios
2. **🎛️ Tablero Interactivo** — Controles en tiempo real (sliders), 6 KPIs, 3 gráficos Chart.js
3. **📈 Simulador 24 Meses** — 4 planes estratégicos, tabla mes a mes, gráfico de caja con piso $5.000
4. **❓ Respuestas Caso (1-7)** — Las 7 preguntas de Andrés con cuentas escritas paso a paso
5. **⚡ Extras & Estrategia** — CPL de equilibrio, optimizador Grid Search, curva marginal, pruebas de estrés para el banco, cronómetro de pitch con alerta sonora, simulador de crédito bancario
6. **🔍 Auditoría & Errores IA** — 8 tests en vivo (verde/rojo), tabla de errores de la IA, tabla de supuestos oficiales

## Funciones de Exportación

- **📝 Descargar Informe (.md)** — Memorando ejecutivo con toda la recomendación
- **📊 Descargar Flujo 24M (.csv)** — Tabla completa del plan activo mes a mes
- **💾 Guardar Plan (.json)** / **📂 Cargar Plan (.json)** — Persistencia de escenarios custom

## Criterios de Aceptación del caso.md → Todos cumplidos

- ✅ Cambiar un parámetro recalcula todo en tiempo real (<1%)
- ✅ 9/9 tests de referencia pasan (`npm test`)
- ✅ Mes 1 verificado a mano ($15.736,30)
- ✅ `dist/sol-de-casa.html` abre sin instalar nada y sin errores en consola
- ✅ La recomendación nombra la trampa con número (34,1% más caro en Meta) y compara 3 escenarios
- ✅ Sistema de login con credenciales de prueba y saludo personalizado por usuario
