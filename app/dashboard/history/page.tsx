import { HistoryList } from "@/components/history-list";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Response History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review your past responses and track improvement.
        </p>
      </div>
      <HistoryList />
    </div>
  );
}
