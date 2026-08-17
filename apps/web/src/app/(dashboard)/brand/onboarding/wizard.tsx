'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@abge/ui/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@abge/ui/components/ui/card';
import { Input } from '@abge/ui/components/ui/input';
import { Label } from '@abge/ui/components/ui/label';
import { toast } from 'sonner';
import { saveBrandBasics, submitBrandOnboarding } from './actions';

interface OnboardingDraft {
  id?: string;
  onboardingStep?: number;
  name?: string;
  industry?: string | null;
  websiteUrl?: string | null;
}

export function OnboardingWizard({ initialDraft }: { initialDraft: OnboardingDraft | null }) {
  const router = useRouter();
  const [step, setStep] = useState(initialDraft?.onboardingStep || 1);
  const [loading, setLoading] = useState(false);
  const [brandId, setBrandId] = useState<string | undefined>(initialDraft?.id);

  // Form State
  const [name, setName] = useState(initialDraft?.name || '');
  const [industry, setIndustry] = useState(initialDraft?.industry || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialDraft?.websiteUrl || '');

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        const id = await saveBrandBasics({ name, industry, websiteUrl }, brandId);
        setBrandId(id);
        setStep(2);
      } else if (step === 6) {
        setStep(7);
      } else {
        // Assume steps 2-5 save logic goes here
        setStep(step + 1);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save step');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      await submitBrandOnboarding(brandId);
      toast.success('Brand submitted successfully');
      router.push('/brand');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step {step} of 7</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Brand Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Technology" />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
            </div>
          </div>
        )}
        
        {step > 1 && step < 7 && (
          <div className="py-8 text-center text-muted-foreground">
            {/* Steps 2-6 omitted for brevity in MVP script, but in real implementation they would have forms */}
            [Step {step} Form Placeholder]
            <p className="mt-2 text-sm">Products, Audience, Positioning, Competitors, Assets are managed here.</p>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review your Brand</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Name:</span> {name}
              </div>
              <div>
                <span className="text-muted-foreground">Industry:</span> {industry}
              </div>
              <div>
                <span className="text-muted-foreground">Website:</span> {websiteUrl}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>Back</Button>
        {step < 7 ? (
          <Button onClick={handleNext} disabled={loading}>{loading ? 'Saving...' : 'Continue'}</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit & Generate'}</Button>
        )}
      </CardFooter>
    </Card>
  );
}
