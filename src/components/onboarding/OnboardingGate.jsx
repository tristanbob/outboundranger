import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';

// Onboarding runs once per organization: until this org has a completed
// company profile, every page redirects into the wizard.
export default function OnboardingGate({ orgId, children }) {
  const location = useLocation();
  const [done, setDone] = useState(null);

  useEffect(() => {
    let active = true;
    const check = () =>
      base44.entities.CompanyProfile.filter(orgScope(), '-created_date', 1).then((rows) => {
        if (active) setDone(!!rows[0]?.completed);
      });
    setDone(null);
    check();
    // Re-check when the wizard saves, so finishing onboarding releases the gate.
    const unsubscribe = base44.entities.CompanyProfile.subscribe(check);
    return () => { active = false; unsubscribe(); };
  }, [orgId]);

  if (done === null) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!done && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}