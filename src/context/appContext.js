const CASES_STORAGE_KEY = 'sol-de-casa-analysis-cases-v1';

function readSavedCases() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CASES_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const appContext = {
  cases: readSavedCases(),
  activeRoute: '/resumen',
  persistenceWarning: false,
  persistCases() {
    try {
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(this.cases));
      this.persistenceWarning = false;
      return true;
    } catch {
      this.persistenceWarning = true;
      return false;
    }
  },
};
