"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, X, MessageSquare, AlertCircle, Clock } from "lucide-react";
import { approveContent, rejectContent, requestChanges } from "./actions";

type ApprovalsClientProps = {
  initialApprovals: any[];
  permissions: {
    canApprove: boolean;
    canReject: boolean;
    canRequestChanges: boolean;
  };
};

export function ApprovalsClient({ initialApprovals, permissions }: ApprovalsClientProps) {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

  const handleApprove = async (id: string) => {
    try {
      setLoadingId(id);
      await approveContent(id);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: "APPROVED" } : a));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = reasonMap[id];
    if (!reason?.trim()) {
      alert("Reason is required to reject.");
      return;
    }
    try {
      setLoadingId(id);
      await rejectContent(id, reason);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: "REJECTED", reason } : a));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRequestChanges = async (id: string) => {
    const reason = reasonMap[id];
    if (!reason?.trim()) {
      alert("Reason is required to request changes.");
      return;
    }
    try {
      setLoadingId(id);
      await requestChanges(id, reason);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: "CHANGES_REQUESTED", reason } : a));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  if (approvals.length === 0) {
    return (
      <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Approvals Found</h3>
        <p className="text-sm text-gray-400">There are no items currently pending your review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <div key={approval.id} className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                  {approval.contentItem?.platform || "Unknown"}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  {approval.contentItem?.format || "Text"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(approval.createdAt), "MMM d, yyyy h:mm a")}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mt-2">{approval.contentItem?.title || "Untitled Content"}</h3>
              <p className="text-sm text-gray-400 mt-1">Requested by: {approval.requestedBy?.name || approval.requestedBy?.email || "Unknown"}</p>
            </div>
            
            {/* Status Badge */}
            <div>
              {approval.status === "PENDING" && <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold uppercase">Pending</span>}
              {approval.status === "APPROVED" && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold uppercase">Approved</span>}
              {approval.status === "REJECTED" && <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold uppercase">Rejected</span>}
              {approval.status === "CHANGES_REQUESTED" && <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold uppercase">Changes Requested</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-[#0B0A11]/60 rounded-xl p-4 border border-white/5">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Content Draft</h4>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{approval.contentVersion?.textContent?.content || "No text content available."}</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#0B0A11]/60 rounded-xl p-4 border border-white/5">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Quality Score</h4>
                {approval.contentVersion?.qualityScore ? (
                  <div className="space-y-2">
                    {/* Render score breakdown simply */}
                    {Object.entries(approval.contentVersion.qualityScore.scores || {}).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300 capitalize">{key}</span>
                        <span className="font-semibold text-white">{val}/100</span>
                      </div>
                    ))}
                    {approval.contentVersion.qualityScore.flags?.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-white/10">
                        <p className="text-xs text-rose-400 font-medium mb-1">Flags Detected:</p>
                        <ul className="text-xs text-gray-400 list-disc pl-4">
                          {approval.contentVersion.qualityScore.flags.map((f: any, i: number) => <li key={i}>{f.description}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Score unavailable or still processing.</p>
                )}
              </div>

              {approval.reason && (
                <div className="bg-rose-500/5 rounded-xl p-4 border border-rose-500/10">
                  <h4 className="text-xs font-medium text-rose-400 uppercase tracking-wider mb-2">Reason Provided</h4>
                  <p className="text-sm text-rose-200/80">{approval.reason}</p>
                </div>
              )}
            </div>
          </div>

          {approval.status === "PENDING" && (
            <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
              <textarea 
                className="w-full bg-[#0B0A11]/60 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                placeholder="Reason (required for Reject / Request Changes)"
                rows={2}
                value={reasonMap[approval.id] || ""}
                onChange={e => setReasonMap({...reasonMap, [approval.id]: e.target.value})}
                disabled={loadingId === approval.id}
              />
              
              <div className="flex gap-3">
                {permissions.canApprove && (
                  <button 
                    onClick={() => handleApprove(approval.id)}
                    disabled={loadingId === approval.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                )}
                {permissions.canRequestChanges && (
                  <button 
                    onClick={() => handleRequestChanges(approval.id)}
                    disabled={loadingId === approval.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1C1A2B] hover:bg-[#25223A] border border-white/5 hover:border-white/10 text-white font-medium text-sm py-2 px-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" /> Request Changes
                  </button>
                )}
                {permissions.canReject && (
                  <button 
                    onClick={() => handleReject(approval.id)}
                    disabled={loadingId === approval.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium text-sm py-2 px-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
