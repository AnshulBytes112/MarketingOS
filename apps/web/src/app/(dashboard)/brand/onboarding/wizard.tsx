'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@abge/ui/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@abge/ui/components/ui/card';
import { Input } from '@abge/ui/components/ui/input';
import { Label } from '@abge/ui/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash, Upload, X } from 'lucide-react';
import { 
  saveBrandBasics, 
  saveBrandProducts, 
  saveBrandAudience, 
  saveBrandPositioning, 
  saveBrandCompetitors,
  advanceToStep7,
  submitBrandOnboarding 
} from './actions';

interface Product {
  id?: string;
  name: string;
  description?: string | null;
}

interface Competitor {
  id?: string;
  name: string;
  websiteUrl?: string | null;
}

interface Asset {
  id: string;
  type: string;
  url: string;
  metadata: any;
}

interface OnboardingDraft {
  id?: string;
  onboardingStep?: number;
  name?: string;
  industry?: string | null;
  websiteUrl?: string | null;
  targetAudience?: string | null;
  geography?: string | null;
  priceSegment?: string | null;
  positioning?: string | null;
  usp?: string | null;
  products?: Product[];
  competitors?: Competitor[];
  assets?: Asset[];
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

  const [products, setProducts] = useState<Product[]>(initialDraft?.products || []);
  const [targetAudience, setTargetAudience] = useState(initialDraft?.targetAudience || '');
  const [geography, setGeography] = useState(initialDraft?.geography || '');
  const [priceSegment, setPriceSegment] = useState(initialDraft?.priceSegment || '');
  const [positioning, setPositioning] = useState(initialDraft?.positioning || '');
  const [usp, setUsp] = useState(initialDraft?.usp || '');
  const [competitors, setCompetitors] = useState<Competitor[]>(initialDraft?.competitors || []);
  const [assets, setAssets] = useState<Asset[]>(initialDraft?.assets || []);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        const id = await saveBrandBasics({ name, industry, websiteUrl }, brandId);
        setBrandId(id);
        setStep(2);
      } else if (step === 2 && brandId) {
        await saveBrandProducts({ products: products.map(p => ({ name: p.name, description: p.description || undefined })) }, brandId);
        setStep(3);
      } else if (step === 3 && brandId) {
        await saveBrandAudience({ targetAudience, geography, priceSegment }, brandId);
        setStep(4);
      } else if (step === 4 && brandId) {
        await saveBrandPositioning({ positioning, usp }, brandId);
        setStep(5);
      } else if (step === 5 && brandId) {
        await saveBrandCompetitors({ competitors: competitors.map(c => ({ name: c.name, websiteUrl: c.websiteUrl || undefined })) }, brandId);
        setStep(6);
      } else if (step === 6 && brandId) {
        await advanceToStep7(brandId);
        setStep(7);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!brandId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          filename: file.name,
          contentType: file.type,
        })
      });

      if (!res.ok) throw new Error('Failed to initiate upload');

      const data = await res.json();
      
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) throw new Error('Failed to upload file to S3');

      setAssets(prev => [...prev, data.asset]);
      toast.success('Asset uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
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
        
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg">Products & Services</Label>
              <Button size="sm" variant="outline" onClick={() => setProducts([...products, { name: '' }])}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            {products.map((p, i) => (
              <div key={i} className="flex gap-4 items-start border p-4 rounded-md">
                <div className="flex-1 space-y-2">
                  <Input value={p.name} onChange={e => {
                    const newP = [...products];
                    newP[i].name = e.target.value;
                    setProducts(newP);
                  }} placeholder="Product Name" />
                  <Input value={p.description || ''} onChange={e => {
                    const newP = [...products];
                    newP[i].description = e.target.value;
                    setProducts(newP);
                  }} placeholder="Description" />
                </div>
                <Button size="icon" variant="ghost" onClick={() => setProducts(products.filter((_, idx) => idx !== i))}>
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Target Audience</Label>
              <Input value={targetAudience} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetAudience(e.target.value)} placeholder="Who is your primary customer?" />
            </div>
            <div>
              <Label>Geography</Label>
              <Input value={geography} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeography(e.target.value)} placeholder="Global, NA, Europe..." />
            </div>
            <div>
              <Label>Price Segment</Label>
              <Input value={priceSegment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceSegment(e.target.value)} placeholder="Premium, Value..." />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>Positioning</Label>
              <Input value={positioning} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPositioning(e.target.value)} placeholder="How do you position yourself in the market?" />
            </div>
            <div>
              <Label>Unique Selling Proposition (USP)</Label>
              <Input value={usp} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsp(e.target.value)} placeholder="What makes you unique?" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg">Competitors</Label>
              <Button size="sm" variant="outline" onClick={() => setCompetitors([...competitors, { name: '' }])}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            {competitors.map((c, i) => (
              <div key={i} className="flex gap-4 items-start border p-4 rounded-md">
                <div className="flex-1 space-y-2">
                  <Input value={c.name} onChange={e => {
                    const newC = [...competitors];
                    newC[i].name = e.target.value;
                    setCompetitors(newC);
                  }} placeholder="Competitor Name" />
                  <Input value={c.websiteUrl || ''} onChange={e => {
                    const newC = [...competitors];
                    newC[i].websiteUrl = e.target.value;
                    setCompetitors(newC);
                  }} placeholder="https://competitor.com" />
                </div>
                <Button size="icon" variant="ghost" onClick={() => setCompetitors(competitors.filter((_, idx) => idx !== i))}>
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <Label className="text-lg">Brand Assets</Label>
            <p className="text-sm text-muted-foreground mb-4">Upload logos, guidelines, and previous campaigns.</p>
            <div className="flex items-center gap-4">
              <Input type="file" id="asset-upload" className="hidden" onChange={handleFileUpload} disabled={loading} />
              <Label htmlFor="asset-upload" className="flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer hover:bg-muted">
                <Upload className="w-4 h-4 mr-2" /> Upload Asset
              </Label>
            </div>
            <div className="mt-4 space-y-2">
              {assets.map((a, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm font-medium">{a.metadata?.filename || 'Asset'}</span>
                  <span className="text-xs text-muted-foreground">{a.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Review your Brand</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-muted-foreground">Name:</span> {name}</div>
              <div><span className="text-muted-foreground">Industry:</span> {industry}</div>
              <div><span className="text-muted-foreground">Website:</span> {websiteUrl}</div>
              <div><span className="text-muted-foreground">Target Audience:</span> {targetAudience}</div>
              <div><span className="text-muted-foreground">Geography:</span> {geography}</div>
              <div><span className="text-muted-foreground">Price Segment:</span> {priceSegment}</div>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground">Products:</span>
              <ul className="list-disc pl-5 text-sm">
                {products.map((p, i) => <li key={i}>{p.name} {p.description && `- ${p.description}`}</li>)}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground">Competitors:</span>
              <ul className="list-disc pl-5 text-sm">
                {competitors.map((c, i) => <li key={i}>{c.name} {c.websiteUrl && `(${c.websiteUrl})`}</li>)}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground">Assets:</span>
              <ul className="list-disc pl-5 text-sm">
                {assets.map((a, i) => <li key={i}>{a.metadata?.filename || a.url}</li>)}
              </ul>
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
