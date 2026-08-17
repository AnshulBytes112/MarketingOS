import { getIncompleteDraft } from './actions';
import { OnboardingWizard } from './wizard';
import { requireAuth } from '@abge/auth';

export default async function OnboardingPage() {
  await requireAuth();
  const draft = await getIncompleteDraft();
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Brand Onboarding</h1>
        <p className="text-muted-foreground mt-2">
          Complete your brand profile to generate your Brand DNA and unlock full intelligence features.
        </p>
      </div>
      
      <OnboardingWizard initialDraft={draft} />
    </div>
  );
}
