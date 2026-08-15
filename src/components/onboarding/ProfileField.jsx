import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ChoiceField from './ChoiceField';

export default function ProfileField({ field, value, onChange, asQuestion }) {
  if (field.options) {
    return <ChoiceField field={field} value={value} onChange={onChange} asQuestion={asQuestion} />;
  }
  const Control = field.multiline === false ? Input : Textarea;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label>{asQuestion ? field.question : field.label}</Label>
        {!asQuestion && value && (
          <Badge variant="outline" className="text-xs border-stone-200 text-stone-500">extracted</Badge>
        )}
      </div>
      <Control
        rows={field.multiline === false ? undefined : 2}
        value={value || ''}
        placeholder={asQuestion ? 'Your answer…' : field.question}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    </div>
  );
}