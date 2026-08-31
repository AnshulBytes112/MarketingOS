import { requireAuth, requirePermission } from '@abge/auth';
import { getSEOAnalysisById } from '../actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle, BarChart3, Star, AlertOctagon, Terminal, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'SEO Report Details | AI Brand Growth Engine',
};

export default async function SeoReportPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await requireAuth();
  
  if (!session.organizationId) {
    return <div className="p-8 text-center text-white">No active organization selected.</div>;
  }

  await requirePermission('seo.view' as any);

  let report;
  try {
    report = await getSEOAnalysisById(params.id);
  } catch (e) {
    return notFound();
  }

  const keywordData = (report.keywordData as any) || {};
  const subScores = (report.subScores as any) || {};
  const recommendations = (report.recommendations as any) || [];
  const flags = (report.flags as any) || [];
  const metadataInfo = (report.metadata as any) || {};

  const analyzedText = typeof report.contentVersion?.textContent === 'string' 
    ? report.contentVersion.textContent 
    : report.contentVersion?.textContent 
      ? JSON.stringify(report.contentVersion.textContent, null, 2) 
      : '';

  return (
    <div className="flex-1 overflow-y-auto bg-black p-8 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link href="/seo" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to SEO Intelligence
          </Link>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs uppercase font-bold rounded">
                {report.contentItem?.platform || 'Social'}
              </span>
              <span className="text-xs text-gray-500">
                Analyzed on {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{report.contentItem?.title || 'SEO Report'}</h1>
            <p className="text-gray-400 text-sm">Status: <span className="uppercase font-semibold text-emerald-400">{report.status}</span></p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-[#12111A] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="text-center">
                <div className={`text-4xl font-extrabold ${(report.seoScore ?? 0) >= 80 ? 'text-emerald-400' : (report.seoScore ?? 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {report.seoScore || '—'}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">SEO Score</div>
              </div>
            </div>
          </div>
        </header>

        {report.status !== 'COMPLETED' ? (
          <div className="bg-[#12111A] border border-white/5 rounded-2xl p-8 text-center text-gray-400">
            <p>This SEO analysis report is currently {report.status.toLowerCase()}. Check back shortly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Scores & Keywords */}
            <div className="lg:col-span-1 space-y-6">
              {/* Sub-Scores */}
              <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Sub-Scores
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Keyword Relevance', val: subScores.keywordRelevance },
                    { label: 'Search Intent Alignment', val: subScores.searchIntentAlignment },
                    { label: 'Title/Hook Quality', val: subScores.titleQuality },
                    { label: 'Readability & Flow', val: subScores.readability }
                  ].map((sub, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{sub.label}</span>
                        <span className="font-semibold text-white">{sub.val || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sub.val >= 80 ? 'bg-emerald-500' : sub.val >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${sub.val || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Intent */}
              <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  Search Intent
                </h3>
                <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs uppercase font-extrabold rounded-lg">
                  {report.searchIntent}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">
                  The analysis determined this content maps closely to search queries matching transactional/commercial interest.
                </p>
              </div>

              {/* Keywords & Themes */}
              <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Keywords & Themes
                </h3>
                
                {/* Primary Themes */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 font-semibold">Primary Themes:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordData.primaryThemes?.map((theme: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-gray-300">
                        {theme}
                      </span>
                    )) || <span className="text-xs text-gray-500 italic">None identified</span>}
                  </div>
                </div>

                {/* Missing Entities */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-gray-400 font-semibold">Missing Entities to Target:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordData.missingEntities?.map((entity: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400">
                        {entity}
                      </span>
                    )) || <span className="text-xs text-gray-500 italic">None identified</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recommendations & Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommendations */}
              <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  SEO Recommendations
                </h3>
                {recommendations.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No recommendations identified.</p>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-[10px] uppercase font-bold rounded">
                            {rec.category}
                          </span>
                          <span className={`text-[10px] uppercase font-extrabold ${rec.severity === 'HIGH' ? 'text-red-400' : rec.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'}`}>
                            {rec.severity} Severity
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white">{rec.explanation}</p>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-xs text-emerald-400 mt-2">
                          <span className="font-bold block uppercase tracking-wider text-[9px] text-emerald-500 mb-1">Suggested Action:</span>
                          {rec.suggestedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Flags / Warnings */}
              {flags.length > 0 && (
                <div className="bg-[#12111A] border border-red-500/20 rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" />
                    SEO Flags & Warnings
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-xs text-gray-300 leading-relaxed">
                    {flags.map((flag: string, idx: number) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Analyzed Text Content */}
              {analyzedText && (
                <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    Analyzed Text Content
                  </h3>
                  <div className="bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {analyzedText}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
