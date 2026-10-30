/**
 * CASO C: SOL DE CASA - DATOS OFICIALES DEL CASO
 * Fuente única de verdad documental: CASO.md
 * Cada dato cuenta con su unidad, descripción y sección de origen en el documento del caso.
 */

export const CASE_DATA = {
  // Sección 1: Lo que deja cada instalación
  economics: {
    installationPrice: 6500, // USD - Precio promedio de una instalación
    clientPayAtSignPct: 0.50, // 50% al firmar
    clientPayAtInstallPct: 0.50, // 50% al mes siguiente (al instalar)
    equipmentCostPct: 0.55, // 55% del precio ($3.575) pagado al proveedor mes de firma
    installationCostPct: 0.17, // 17% del precio ($1.105) pagado cuadrilla mes siguiente
    grossMarginPct: 0.28, // 28% = 100% - 55% - 17% ($1.820)
    salesCommissionPct: 0.03, // 3% del precio ($195), pagado mes de firma
    // Contribución por venta antes de marketing = $6.500 * (28% - 3%) = $1.625
    unitContribution: 1625, // USD
  },

  // Sección 2: Las visitas técnicas
  visits: {
    costPerVisit: 60, // USD - Transporte, viáticos y bono por visita realizada
    baseTechnicians: 2, // Técnicos actuales
    baseCapacityPerTech: 50, // Visitas máx / mes por técnico
    baseMonthlyCapacity: 100, // Visitas máx / mes totales hoy
    extraTechCostPerMonth: 1800, // USD / mes - Se paga desde el mes que se contrata
    extraTechCapacityIncrement: 50, // Visitas / mes - Suma capacidad a partir del mes siguiente
    maxExtraTechs: 2, // Máximo de técnicos adicionales permitidos
  },

  // Sección 3: Los anuncios de septiembre (Mes 0)
  adsBaseline: {
    meta: {
      spend: 4000, // USD
      clicks: 4000,
      cpc: 1.00, // USD
      leads: 500,
      cpl: 8.00, // USD
      clickToLeadPct: 0.125, // 12.5%
    },
    google: {
      spend: 4000, // USD
      clicks: 1600,
      cpc: 2.50, // USD
      leads: 100,
      cpl: 40.00, // USD
      clickToLeadPct: 0.0625, // 6.25%
    },
  },

  // Sección 3: Tasas de conversión del embudo según CRM
  funnelRates: {
    meta: {
      contactRate: 0.55, // 55% de leads contactados
      scheduleRate: 0.30, // 30% de contactados que agendan visita
      visitCompletedRate: 0.70, // 70% de visitas agendadas que se realizan
      closeRate: 0.18, // 18% de visitas realizadas que terminan en venta
      invalidPhoneRate: 0.18, // 18% teléfonos inválidos
    },
    google: {
      contactRate: 0.85, // 85% de leads contactados
      scheduleRate: 0.55, // 55% de contactados que agendan visita
      visitCompletedRate: 0.85, // 85% de visitas agendadas que se realizan
      closeRate: 0.30, // 30% de visitas realizadas que terminan en venta
      invalidPhoneRate: 0.03, // 3% teléfonos inválidos
    },
  },

  // Sección 4: Batería de respaldo (Upsell opcional)
  battery: {
    price: 3000, // USD
    grossMarginPct: 0.20, // 20% ($600)
    commissionPct: 0.03, // 3% ($90)
    unitContribution: 510, // USD ($600 - $90)
    adoptionRate: 0.15, // 15% (3 de 20 clientes en prueba piloto)
    incrementalExpectedContribution: 76.50, // USD = 510 * 0.15
  },

  // Sección 5: Historial de leads según inversión (12 meses)
  history: [
    { spend: 0, metaLeads: 0, googleLeads: 0 },
    { spend: 2000, metaLeads: 280, googleLeads: 55 },
    { spend: 4000, metaLeads: 500, googleLeads: 100 },
    { spend: 6000, metaLeads: 680, googleLeads: 135 },
    { spend: 8000, metaLeads: 840, googleLeads: 160 },
    { spend: 10000, metaLeads: 960, googleLeads: 160 }, // Google saturado en 160
  ],

  googleLeadCap: 160, // Límite máximo de búsquedas en Google

  // Sección 6: Supuesto 7 (Filtro + Respuesta rápida < 5 min en Meta)
  supuesto7: {
    leadReductionFactor: 0.80, // Baja 20% los leads brutos (queda en 80%)
    contactRate: 0.80, // 80% contacto
    scheduleRate: 0.40, // 40% agenda
    visitCompletedRate: 0.75, // 75% visitas hechas
    closeRate: 0.22, // 22% cierre
  },

  // Sección 7: Datos de caja (Nivel 3)
  cash: {
    initialCash: 12000, // USD - Saldo en banco al inicio del mes 1
    safetyFloor: 5000, // USD - Sofía no acepta menos
    monthlyFixedCosts: 18000, // USD - Sueldos base, oficina, camioneta, CRM
    month0Sales: 22, // Ventas de septiembre que pagan 50% restante en mes 1
  },
};
