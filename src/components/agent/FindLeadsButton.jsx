import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { findNewLeads } from './leadSourcing';

export default function FindLeadsButton({ onDone }) {
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const created = await findNewLeads({ count: 3 });
      await onDone(created);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={run} disabled={running} className="rounded-full border-stone-300">
      {running ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Search className="w-4 h-4 mr-1.5" />}
      {running ? 'Prospecting…' : 'Find new leads'}
    </Button>
  );
}