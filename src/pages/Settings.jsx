import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AgentSettingsForm from '@/components/settings/AgentSettingsForm';
import Onboarding from '@/pages/Onboarding';
import DeleteOrgCard from '@/components/org/DeleteOrgCard';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Settings</h1>
        <p className="text-sm text-stone-400 mt-1">Agent guardrails, your company profile, and account management.</p>
      </header>

      <Tabs defaultValue="agent">
        <TabsList>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="danger">Delete business</TabsTrigger>
        </TabsList>

        <TabsContent value="agent" className="mt-6 max-w-2xl">
          <p className="text-sm text-stone-400 mb-4">Scope, autonomy, and guardrails. High-risk actions always require your approval — even on autopilot.</p>
          <AgentSettingsForm />
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <Onboarding embedded />
        </TabsContent>

        <TabsContent value="danger" className="mt-6 max-w-2xl">
          <DeleteOrgCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}