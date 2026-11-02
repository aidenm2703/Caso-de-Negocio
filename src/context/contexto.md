# Contexto funcional de Sol de Casa

## Fuente de verdad y datos disponibles

El modelo de referencia se alimenta de `src/data/caseData.js`. Ese archivo reúne los datos estructurados atribuidos al caso C, sus tasas, su historial de leads y reglas de caja. El documento `CASO.md` mencionado en instrucciones anteriores no está incluido en este workspace; por eso no se presenta aquí como verificado ni se agregan datos del documento que no podamos leer.

Cuando se incorpore `CASO.md`, revisar los datos de `caseData.js` contra el documento y anotar cualquier diferencia antes de ajustar el modelo.

## Módulos y responsabilidades

- `src/routes/routes.js`: rutas con fragmento URL para las vistas del portal, compatibles con abrir el HTML independiente.
- `src/pages/`: composición de cada vista. `casesPage.js` construye el espacio de análisis de varios casos.
- `src/components/`: campos y métricas de interfaz reutilizables.
- `src/services/`: validación, administración y cálculos de negocio. `caseService.js` calcula los resultados mensuales de cada ficha de caso.
- `src/context/appContext.js`: estado compartido y persistencia local de los casos guardados.
- `src/model/`: funciones financieras del caso de referencia, puras y compartidas por el tablero y el simulador.
- `src/data/caseData.js`: valores estructurados del caso de referencia.
- `src/styles/`: tema, estructura, componentes y estilos de impresión.
- `src/template.html`: estructura HTML del portal.
- `tools/build.mjs`: combina las fuentes y genera `dist/sol-de-casa.html`.

## Reglas del análisis de otros casos

Cada caso adicional debe incluir su fuente y sus propios datos de inversión, leads, conversiones, capacidad, economía unitaria y costos fijos. Ninguna tasa se copia desde Sol de Casa al analizar otro negocio. Las tasas se ingresan como porcentajes; el motor las convierte a proporciones.

El análisis mensual calcula contacto, agenda, visitas solicitadas, visitas atendidas, ventas, CPL, CAC real, contribución, LTV:CAC y resultado operativo estimado. La prioridad de uso de capacidad se elige para cada caso. La regla de prioridad Google primero solo se selecciona automáticamente para la referencia Sol de Casa, porque esa regla pertenece a su contexto.

El resultado operativo mostrado resta inversión publicitaria, costo de visitas y costos fijos a la contribución por venta. Es una estimación mensual simplificada: no proyecta cobros, inventario, impuestos, deuda ni caja a 24 meses para casos nuevos. Para extenderlo a flujo de caja, el caso nuevo debe proporcionar los calendarios de cobro y pago y la estructura de costos completa.

## Datos necesarios para agregar un caso

1. Nombre del negocio y fuente documental o de datos.
2. Inversión y leads estimados por Meta y Google.
3. Tasas de contacto, agenda, visita completada y cierre por canal.
4. Capacidad mensual y prioridad de canal si la capacidad se satura.
5. Precio promedio, margen bruto, comisión, costo por visita y costos fijos mensuales.

No hay promedios del sector precargados. Si falta un dato, debe obtenerse de la fuente o declararse como supuesto antes de interpretar el resultado.
