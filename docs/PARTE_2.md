# Parte 2: Sol de Casa

## Abrir y recorrer

Desde `Caso_Negocio`, ejecute `npm.cmd run dev`. El sitio público se abre en la URL que devuelve Vite.

1. `#familia`: ahorro mensual y acumulado, selector de mes, tarjeta descargable, mensaje y enlace personal.
2. `#calcular?ref=familia-sol-001`: calculadora única, recuperación y agenda con referente. Use datos ficticios.
3. `#panel`: actividad local y embudo ilustrativo separado; cambie la agenda a visita realizada y firmado.
4. Vuelva a `#familia`: progreso y recompensa se actualizan por firma referida.
5. `#growth`: respuestas, economía, metas, canales, experimento y guion de tres minutos. Abra la ficha resumida para imprimir en A4 o copiar a Google Docs. No se ha publicado en Google Docs.
6. `#acceder`: login y portal financiero de la Parte 1, conservados sin editar `App.jsx`, sus modelos existentes ni `index.css`.

## Alcance

Almacenamiento local del navegador (`sdc_referrals_v1`), sin backend, autenticación nueva, sincronización ni agenda real. Si se bloquea localStorage, la actividad no persiste al cambiar de pantalla. Solo se usan contactos ficticios. Los premios y firmas son simulados; el usuario decide si envía el mensaje que abre WhatsApp.

El panel cuenta copias, aperturas de WhatsApp, acciones nativas completadas y cálculos confirmados por separado: son eventos, no usuarios únicos ni envíos demostrados. El embudo ilustrativo está marcado y no se suma a los eventos locales.

Modelo esperado: visitas $60/45 % = $133,33 + $120 de premios por firma = $253,33. La ficha calcula contramétricas y explica que el costo observado puede exceder el límite. No se prometen 50 visitas con el piloto: el rendimiento del letrero requiere 459 familias/mes.

Se incorporaron tres fotografías reales de referencia de Pexels, guardadas en `public/images`, con créditos y aclaración de que no son instalaciones de Sol de Casa. Si una imagen no carga, aparece un panel SVG de respaldo. Google Fonts tiene tipografías alternativas. Las actividades humanas del reto (lectura sin IA, diseño previo y prueba por otro equipo) requieren evidencia del equipo, no se declaran realizadas por software.

## Comprobaciones

Desde la raíz, `npm.cmd test`. Desde `Caso_Negocio`, `npm.cmd run build` y `npm.cmd exec eslint src/PublicSite.jsx src/PublicSections.jsx src/ReferralExperience.jsx src/model/referrals.js`.

La inspección visual automatizada quedó bloqueada: conexión del navegador no disponible; Chrome minimizado y el controlador de escritorio no pudo activarlo. No se declara una prueba visual móvil ni un recorrido interactivo aprobado.

Resultado de la entrega: 19 pruebas numéricas y de transiciones pasan; build de producción y ESLint de los cuatro módulos nuevos pasan. Las seis rutas (inicio, familia, vecino con referente, panel, ficha y login) se renderizaron con React en servidor sin errores. Esta última comprobación valida contenido y renderización, no sustituye la prueba interactiva en navegador. Las visitas ya realizadas siguen contando como costo si después se cancela; una firma queda finalizada para conservar su recompensa.
