"use client";

import { useParams } from "next/navigation";
import { useResponseDetail } from "@/hooks/use-response-detail";
import { ResponseDetail } from "@/components/response-detail";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResponseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { response, loading } = useResponseDetail(id);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!response) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/history"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
        <div className="text-center py-12 text-muted-foreground">
          Response not found.
        </div>
      </div>
    );
  }

  return <ResponseDetail response={response} />;
}
