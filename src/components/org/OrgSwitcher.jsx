import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, Check, Plus, Building2 } from 'lucide-react';
import { useOrg } from './OrgContext';
import CreateOrgDialog from './CreateOrgDialog';

export default function OrgSwitcher() {
  const { orgs, currentOrg, switchOrg, createOrg } = useOrg();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-colors">
            <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{currentOrg.name}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wide">Business</div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {orgs.map((org) => (
            <DropdownMenuItem key={org.id} onClick={() => org.id !== currentOrg.id && switchOrg(org)} className="gap-2">
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === currentOrg.id && <Check className="w-4 h-4 text-stone-500" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New business
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrgDialog open={creating} onOpenChange={setCreating} onCreate={createOrg} />
    </>
  );
}