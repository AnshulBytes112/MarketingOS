"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ExternalLink, RefreshCw, XCircle, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { retryPublishingJob, cancelScheduledPublish } from "./actions";

interface Job {
  id: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  provider: string;
  externalUrl: string | null;
  error: string | null;
  attemptCount: number;
  contentItem: { title: string; type: string | null; format: string };
  contentVersion: { version: number };
  contentChannel: { name: string; platform: string };
  createdBy: { name: string | null; email: string };
}

export function PublishingClient({
  initialJobs,
  permissions,
}: {
  initialJobs: any[];
  permissions: { canSchedule: boolean; canPublish: boolean; canCancel: boolean; canRetry: boolean };
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleRetry = async (jobId: string) => {
    if (!confirm("Are you sure you want to retry this failed job?")) return;
    setIsProcessing(jobId);
    try {
      await retryPublishingJob(jobId);
      // In a real app, we'd refetch or optimistically update. We'll optimistically update here.
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'QUEUED', error: null, attemptCount: j.attemptCount + 1 } : j));
    } catch (e: any) {
      alert(e.message || "Failed to retry job");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled publish?")) return;
    setIsProcessing(jobId);
    try {
      await cancelScheduledPublish(jobId);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'CANCELLED' } : j));
    } catch (e: any) {
      alert(e.message || "Failed to cancel job");
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'FAILED': return <AlertCircle size={16} className="text-red-500" />;
      case 'SCHEDULED': return <Clock size={16} className="text-blue-500" />;
      case 'QUEUED':
      case 'PUBLISHING': return <RefreshCw size={16} className="text-yellow-500 animate-spin" />;
      case 'CANCELLED': return <XCircle size={16} className="text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-muted">
          <thead className="bg-[#1a1924] text-text-primary text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Content</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Scheduled / Published</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  No publishing jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium text-text-primary">{job.status}</span>
                    </div>
                    {job.error && (
                      <div className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={job.error}>
                        {job.error}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary truncate max-w-[250px]">{job.contentItem.title}</div>
                    <div className="text-xs mt-1">v{job.contentVersion.version} • {job.contentItem.format}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{job.contentChannel.name}</div>
                    <div className="text-xs mt-1">{job.provider}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {job.publishedAt ? (
                      <div>
                        <div className="text-text-primary">{format(new Date(job.publishedAt), "MMM d, h:mm a")}</div>
                        {job.externalUrl && (
                          <a href={job.externalUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-primary hover:underline flex items-center gap-1 mt-1">
                            View Post <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ) : job.scheduledAt ? (
                      <div className="text-blue-400">{format(new Date(job.scheduledAt), "MMM d, yyyy h:mm a")}</div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {job.status === 'FAILED' && permissions.canRetry && (
                        <button
                          onClick={() => handleRetry(job.id)}
                          disabled={isProcessing === job.id}
                          className="px-3 py-1.5 bg-surface border border-border rounded text-xs hover:bg-white/5 disabled:opacity-50"
                        >
                          Retry
                        </button>
                      )}
                      {(job.status === 'SCHEDULED' || job.status === 'QUEUED') && permissions.canCancel && (
                        <button
                          onClick={() => handleCancel(job.id)}
                          disabled={isProcessing === job.id}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs hover:bg-red-500/20 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
