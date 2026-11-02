function mountDashboard() {
  const root = document.getElementById('app-root');
  const template = document.getElementById('authenticated-app-template');
  if (!root || !template || root.childElementCount) return;
  root.replaceChildren(template.content.cloneNode(true));
  initTabs();
  initThemeToggle();
  initControls();
  renderApp();
  initPresentationTimers();
  updateCreditSimulator();
  runBrowserTests();
  window.switchTab(currentRoute().tabId, { fromHistory: true });
}
