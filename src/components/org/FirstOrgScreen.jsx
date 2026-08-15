import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2 } from 'lucide-react';

export default function FirstOrgScreen({ onCreate }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true);
    try { await onCreate(name.trim()); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-8 w-full max-w-md text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6 text-stone-500" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-stone-900">Create your first business</h1>
          <p className="text-sm text-stone-500 mt-1">Each business gets its own pipeline, agent, memory and company profile. You can add more later.</p>
        </div>
        <Input
          placeholder="Business name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && !saving && create()}
        />
        <Button onClick={create} disabled={!name.trim() || saving} className="w-full bg-[#101418] hover:bg-stone-700 rounded-full">
          {saving ? 'Creating…' : 'Create business'}
        </Button>
      </div>
    </div>
  );
}