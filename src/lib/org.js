// The currently selected organization, shared between React (via OrgContext)
// and non-React modules (agent loop, customer sim, lead sourcing).
let currentOrgId = null;

export function setCurrentOrgId(id) {
  currentOrgId = id;
}

export function getCurrentOrgId() {
  return currentOrgId;
}

// Query filter scoped to the active organization.
export function orgScope(extra = {}) {
  return { org_id: currentOrgId, ...extra };
}