import { Badge } from '@/components/ui/badge';

export default function DossierCard({ lead }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-stone-900">{lead.name}</span>
        <span className="text-xs text-stone-400">{lead.title ? `${lead.title} · ` : ''}{lead.company}</span>
        <Badge variant="outline" className="text-xs capitalize">{(lead.status || 'new').replace(/_/g, ' ')}</Badge>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed mt-2.5 whitespace-pre-line">{lead.dossier}</p>
      {lead.dossier_do_not_repeat && (
        <p className="text-xs text-stone-500 mt-2"><span className="font-medium text-stone-600">Won't repeat: </span>{lead.dossier_do_not_repeat}</p>
      )}
    </div>
  );
}