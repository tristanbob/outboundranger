import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { setCurrentOrgId } from '@/lib/org';
import FirstOrgScreen from './FirstOrgScreen';

const OrgContext = createContext(null);
export const useOrg = () => useContext(OrgContext);

export function OrgProvider({ children }) {
  const [state, setState] = useState(null);

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    const all = await base44.entities.Organization.list('-created_date', 100);
    const orgs = all.filter(
      (o) => o.created_by_id === user.id || (o.member_emails || []).includes(user.email)
    );
    const currentOrg = orgs.find((o) => o.id === user.current_org_id) || orgs[0] || null;
    setCurrentOrgId(currentOrg?.id || null);
    setState({ user, orgs, currentOrg });
  }, []);

  useEffect(() => { load(); }, [load]);

  const switchOrg = async (org) => {
    setCurrentOrgId(org.id);
    setState((s) => ({ ...s, currentOrg: org }));
    await base44.auth.updateMe({ current_org_id: org.id });
  };

  const createOrg = async (name) => {
    const org = await base44.entities.Organization.create({
      name,
      member_emails: [state.user.email],
    });
    await base44.auth.updateMe({ current_org_id: org.id });
    setCurrentOrgId(org.id);
    setState((s) => ({ ...s, orgs: [org, ...s.orgs], currentOrg: org }));
    return org;
  };

  if (!state) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }
  if (!state.currentOrg) {
    return <FirstOrgScreen onCreate={createOrg} />;
  }
  return (
    <OrgContext.Provider value={{ ...state, switchOrg, createOrg }}>
      {children}
    </OrgContext.Provider>
  );
}