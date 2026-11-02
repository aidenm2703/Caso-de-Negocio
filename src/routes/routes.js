export const APP_ROUTES = Object.freeze([
  { path: '/resumen', tabId: 'tab-resumen', label: 'Resumen' },
  { path: '/tablero', tabId: 'tab-tablero', label: 'Tablero' },
  { path: '/simulador', tabId: 'tab-simulador', label: 'Simulador' },
  { path: '/respuestas', tabId: 'tab-preguntas', label: 'Respuestas' },
  { path: '/extras', tabId: 'tab-extras', label: 'Extras' },
  { path: '/auditoria', tabId: 'tab-auditoria', label: 'Auditoría' },
  { path: '/casos', tabId: 'tab-casos', label: 'Analizar casos' },
]);

export function routeForTab(tabId) {
  return APP_ROUTES.find(route => route.tabId === tabId) || APP_ROUTES[0];
}

function currentRoute() {
  const route = APP_ROUTES.find(item => item.path === window.location.hash.slice(1));
  return route || APP_ROUTES[0];
}

function updateRoute(tabId, { fromHistory = false, replace = false } = {}) {
  const route = routeForTab(tabId);
  appContext.activeRoute = route.path;
  if (fromHistory || window.location.hash === `#${route.path}`) return route;
  try {
    if (replace) history.replaceState(null, '', `#${route.path}`);
    else history.pushState(null, '', `#${route.path}`);
  } catch {
    window.location.hash = route.path;
  }
  return route;
}
