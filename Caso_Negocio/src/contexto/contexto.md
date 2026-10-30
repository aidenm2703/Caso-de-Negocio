# ROL
Eres un ingeniero de software senior y analista financiero. Vas a construir una solución completa, modular y ordenada para el reto "Caso C – Sol de Casa" (lead gen de paneles solares). El caso completo está en `CASO.md`, en la raíz del proyecto. ESA ES LA ÚNICA FUENTE DE VERDAD: léelo completo antes de escribir una línea de código. No inventes datos, tasas ni "promedios de la industria". Si necesitas un dato que no está, anótalo como SUPUESTO con justificación.

# QUÉ ENTREGAR (en este orden de prioridad)
## A. Calculadora en Google Sheets (Nivel 1) — MUY IMPORTANTE
Genera un archivo `entregables/sol-de-casa-calculadora.xlsx` con FÓRMULAS VIVAS (no valores pegados), listo para subir a Google Sheets, usando un script (Node con exceljs, o Python con openpyxl) que esté en `tools/sheets/`. Pestañas:
1. `Supuestos`: solo datos de entrada, cada uno en su celda, con celdas editables pintadas de otro color, nombre y unidad, y rangos con nombre (named ranges). Incluye los datos del caso, las tasas de cada canal, el supuesto 7 (filtro + respuesta rápida) con un interruptor SI/NO, y la batería.
2. `Historial`: tabla inversión vs leads (Meta y Google) y la interpolación lineal con fórmulas (INDEX/MATCH), incluyendo la recta desde cero y el tope de 160 leads de Google.
3. `Resultados`: TRES ESCENARIOS LADO A LADO: (1) Hoy ($4.000 Meta + $4.000 Google), (2) Agencia ($8.000 Meta + $0 Google), (3) Propio (con dos cambios). Por escenario y por canal: leads, contactados, agendados, visitas pedidas, visitas hechas (capacidad: primero Google, luego Meta), ventas, CPL, CAC de anuncios, CAC real, LTV:CAC, visitas por venta, uso de la capacidad y valor de una visita. Todo apunta a `Supuestos`: cambiar una celda de supuestos recalcula todo.
4. `Propuesta agencia`: la cuenta dos veces: "como la cuenta la agencia" ($8 fijo por lead) y con el historial real. Resalta la diferencia.
5. `Verificado a mano`: una fila (el CAC real de cada canal) con la cuenta escrita paso a paso y una celda que compara contra el modelo.
6. `Caja y payback`: mes de firma y mes siguiente de un cliente, y en qué mes se recupera.
7. `Simulador 24 meses` (Nivel 3): una fila por mes con inversión por canal, leads, visitas pedidas, capacidad, visitas hechas, ventas, entradas, salidas, caja final y alerta si la caja baja de $5.000. Con la regla "desde el mes 19 la inversión total no baja", técnicos extra (cuesta desde el mes de contratación, capacidad desde el mes siguiente) y el mes 1 del plan actual con todas las cuentas visibles.
8. `Planes`: tabla de 4 planes (actual, agencia y 2 propios, uno con técnico extra) con caja mínima (y en qué mes), caja del mes 24 e instalaciones totales.
9. `Gráficos`: nativos de Excel/Sheets: embudo por canal lado a lado y CAC real separado en anuncios y visitas, con la línea de 100 visitas de capacidad. Para el simulador: caja mes a mes con línea del piso de $5.000.
10. `Recomendación`: UNA página imprimible para Andrés (aceptar, rechazar o proponer otra cosa), con los dos cambios y su efecto en números, y que nombre la trampa con un número. Los números del texto deben salir de fórmulas (concatenación), no escritos a mano.
11. `Errores de la IA`: tabla con columnas: qué dijo la IA / por qué estaba mal / cómo se corrigió.
Además genera `docs/SHEETS_FORMULAS.md` con las fórmulas EXACTAS celda por celda de cada pestaña (por si hay que copiarlas a mano en Google Sheets).

## B. Tablero HTML interactivo (Nivel 2)
Una app web que abre con doble clic o link, sin instalar nada. Código modular en `src/` (ver arquitectura) y un script `tools/build.mjs` (sin dependencias) que lo empaqueta en UN solo archivo `dist/sol-de-casa.html`. Chart.js solo desde CDN con versión fija. Debe tener:
- Controles (sliders + input numérico, con nombre y unidad): inversión Meta ($0–$10.000) y Google ($0–$8.000) con el historial, las 4 tasas de cada canal, costo por visita, capacidad o técnicos extra, precio, margen bruto, comisión y % de clientes que agrega la batería.
- Resultados EN VIVO por canal y en total: leads, visitas, ventas, CPL, CAC de anuncios, CAC real, LTV:CAC, visitas usadas vs capacidad y valor de una visita.
- Mínimo 3 gráficos: embudo por canal lado a lado; CPL vs CAC real por canal; visitas pedidas vs capacidad con la línea de 100.
- Semáforo de LTV:CAC (rojo <1, amarillo 1–3, verde ≥3) y alerta cuando las visitas pasan la capacidad.
- LA TRAMPA a la vista en un solo gráfico/banner dinámico: "el lead de Meta es X veces más barato, pero el cliente cuesta Y % más".
- Coincidir con el Sheets (<1 % de diferencia) con los datos del caso, y un botón "Volver a los datos del caso".

## C. Simulador de caja a 24 meses (Nivel 3)
Módulo propio (`src/model/cash.js`) usado por la UI y por los tests:
- Tabla de 24 meses y reglas exactas del caso: caja inicial $12.000, mes 0 con 22 ventas, piso $5.000, costos fijos $18.000, entradas (50 % al firmar + 50 % al mes siguiente), salidas (55 % equipos + 3 % comisión al firmar, 17 % instalación el mes siguiente, $60 por visita, inversión, fijos, $1.800 por técnico extra).
- Plan editable por mes: inversión por canal, mes de contratación de técnicos (máx. 2), activar el filtro (supuesto 7) desde el mes que se elija.
- Validador de reglas (caja ≥ $5.000, inversión no decreciente desde el mes 19) con mensajes claros.
- Comparador de mínimo 4 planes (actual, agencia, 2 propios con al menos un técnico extra): caja mínima y mes, caja mes 24, instalaciones totales, y cuál gana (más caja sin romper reglas; empate → más instalaciones).
- Gráfico de caja con línea del piso y gráfico de visitas pedidas vs capacidad.
- Panel "Mes 1 a mano": leads, visitas, ventas, entradas, salidas y caja final con cada cuenta escrita.

# FUNCIONES EXTRA (que el caso no pide, pero suman). Impleméntalas DESPUÉS de A, B y C
1. Optimizador de plan: búsqueda por rejilla del mejor reparto Meta/Google (un mes) y del mejor plan de 24 meses que respete las reglas. Sirve para encontrar el plan ganador del Nivel 3.
2. CPL de equilibrio: a qué CPL Meta iguala el CAC real de Google. Sirve para demostrar la trampa con un número ("Meta solo conviene si el lead cuesta $X").
3. Análisis de sensibilidad (gráfico tornado): qué supuesto mueve más el CAC real y la caja del mes 24. Sirve para saber qué número defender mejor y qué riesgo reconocer.
4. Curva de rendimiento marginal: leads extra y costo del siguiente $2.000 en cada canal. Sirve para decidir dónde poner el último dólar y mostrar el efecto "rendimientos decrecientes".
5. Pruebas de estrés para el banco: contacto −10 %, CPL +20 %, cierre −15 %, cobro atrasado. Muestra si la caja rompe el piso y cuánto crédito haría falta. Sirve para el pitch del crédito.
6. Modo presentación: pantalla paso a paso (decisión, números clave, riesgo) con cronómetro de 3 min y otro de 2 min para el pitch al banco. Sirve para exponer sin perderse.
7. Registro de supuestos y de errores de la IA dentro de la app, exportable a Markdown. Sirve para la sección obligatoria "En qué se equivocó la IA" y los puntos de uso de IA.
8. Guardar/cargar planes (JSON), exportar los 24 meses a CSV e imprimir la recomendación a PDF (CSS de impresión). Sirve para entregar por escrito y comparar versiones.
9. Pestaña "Auditoría": ejecuta los tests de referencia en el navegador y muestra verde/rojo. Sirve para demostrar que el modelo es correcto.

# ARQUITECTURA (modular, ordenada, sin duplicar lógica)
- `src/data/caseData.js` → TODOS los datos del caso (una sola vez, con unidad y comentario de en qué sección están).
- `src/model/interpolation.js`, `funnel.js` (embudo y capacidad), `unitEconomics.js` (contribución, CAC, LTV:CAC, valor de visita, payback), `cash.js` (24 meses), `plans.js` (presets y comparador), `optimizer.js`, `stress.js`, `sensitivity.js`.
- `src/model/` son FUNCIONES PURAS (sin DOM). Un solo modelo, usado por tablero, simulador y tests.
- `src/ui/` componentes pequeños (controls, kpis, tables, alerts, tabs, presentation) y `src/charts/` (un archivo por gráfico).
- `src/styles/` (variables, layout, componentes, impresión) y `src/utils/format.js` (formato de dinero y %, español, "$12.000", coma decimal).
- `tests/model.test.mjs` con el test runner nativo de Node (`node --test`). `tools/build.mjs` para empaquetar. `README.md` con cómo correr, probar y entregar.
- Código en JavaScript moderno, funciones cortas, nombres en español o inglés pero consistentes, comentarios solo donde expliquen el "por qué".

# VALORES DE REFERENCIA (calculados a mano; verifícalos con tests y avísame si algo no coincide)
- Contribución por venta = $6.500 × (28 % − 3 %) = $1.625.
- Hoy: Meta 500 leads → ~57,75 visitas → ~10,4 ventas. Google 100 leads → ~39,7 visitas → ~11,9 ventas. Total ~22,3 ventas y ~97,5 visitas.
- CAC de anuncios ≈ $385 (Meta) y $336 (Google). CAC real ≈ $718 (Meta) y $536 (Google). LTV:CAC ≈ 2,3 y 3,0.
- Valor de una visita ≈ $232,5 (Meta) y $427,5 (Google).
- Agencia con el historial: $8.000 en Meta = 840 leads (no 1.000) → ~97 visitas → ~17,5 ventas (peor que hoy, ~22,3). Como la cuenta la agencia (1.000 leads): ~115,5 visitas pedidas, se hacen 100 → 18 ventas.
- Mes 1 del plan actual: caja final ≈ $15.700 (haz la cuenta completa y muéstrala).

# DISEÑO Y EXPERIENCIA (tiene que impresionar y ser fácil de usar)
- Estética profesional: paleta amarillo sol (#FFC531), verde (#2E9E68), negro tinta y fondo crema; Meta en rosa y Google en azul de forma consistente. Tipografía con carácter (títulos serif display + texto sans). Modo claro y oscuro.
- Layout tipo dashboard: panel de controles a la izquierda, resultados y gráficos a la derecha, KPIs grandes arriba, pestañas: Resumen, Respuestas (preguntas 1 a 7 con la cuenta escrita), Calculadora, Tablero, Simulador, IA y supuestos.
- Responsive (móvil primero), accesible (contraste, foco visible, etiquetas), con tooltips del glosario en cada término (CAC real, LTV:CAC, payback...).
- Cada número con su nombre y unidad (nada de "Variable 3"). Estados vacíos y errores claros.

# REGLAS DE TRABAJO
1. PRIMERO: lee `CASO.md` y respóndeme en esta conversación: (a) resumen en 10 líneas, (b) la trampa que encontraste, (c) lista de supuestos que usarás, (d) árbol de archivos propuesto. Espera mi OK.
2. Luego trabaja por fases, y al final de cada una corre los tests y dime qué probaste: F1 modelo + tests → F2 Sheets (.xlsx + docs) → F3 tablero → F4 simulador → F5 extras → F6 pulido, README y build.
3. Una sola fuente de lógica: la hoja, el tablero y el simulador deben dar el MISMO resultado (<1 %).
4. No agregues librerías sin decirme. No uses datos inventados. Marca todo supuesto.
5. Si algo del caso es ambiguo, dime tu interpretación y por qué antes de seguir.

# CRITERIOS DE ACEPTACIÓN
- Cambiar una celda de Supuestos (p. ej. contacto de Meta) recalcula todo en la hoja y en el tablero.
- Los tests de referencia pasan y el mes 1 está verificado a mano.
- `dist/sol-de-casa.html` abre sin instalar nada y no tiene errores en consola.
- La recomendación nombra la trampa con un número y compara los tres escenarios.