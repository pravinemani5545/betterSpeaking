"use client";

import { useActivity } from "@/hooks/use-activity";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface DayCell {
  date: Date;
  dateStr: string;
  isFuture: boolean;
}

function getWeeks(): DayCell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back ~26 weeks (6 months)
  const start = new Date(today);
  start.setDate(start.getDate() - 26 * 7);
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  // Extend to end of current week (Saturday)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

  const weeks: DayCell[][] = [];
  const current = new Date(start);

  while (current <= endOfWeek) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      if (current <= endOfWeek) {
        week.push({
          date: new Date(current),
          dateStr: getDateString(current),
          isFuture: current > today,
        });
      }
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function getCellColor(count: number, isFuture: boolean): string {
  if (isFuture) return "bg-cream-50";
  if (count === 0) return "bg-cream-100";
  if (count === 1) return "bg-peach-200";
  if (count === 2) return "bg-peach-300";
  return "bg-peach-500";
}

export function HeatMap() {
  const { activity, loading } = useActivity();
  const weeks = getWeeks();

  if (loading) {
    return (
      <div className="border border-cream-200 bg-white rounded-[14px] p-5 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
        <div className="h-24 animate-pulse bg-cream-100 rounded-[10px]" />
      </div>
    );
  }

  // Compute month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const month = week[0]?.date.getMonth();
    if (month !== undefined && month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], col: i });
      lastMonth = month;
    }
  });

  const totalPractices = Object.values(activity).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(activity).length;

  return (
    <div className="border border-cream-200 bg-white rounded-[14px] p-5 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
          Practice activity
        </h3>
        <p className="text-xs text-cream-500">
          {totalPractices} {totalPractices === 1 ? "response" : "responses"} across {activeDays} {activeDays === 1 ? "day" : "days"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-fit">
          {/* Month labels */}
          <div className="flex gap-0.5 ml-8">
            {monthLabels.map(({ label, col }, i) => {
              const nextCol = monthLabels[i + 1]?.col ?? weeks.length;
              const span = nextCol - col;
              // Skip narrow months to prevent overlap, but always show the last month
              const isLast = i === monthLabels.length - 1;
              if (span < 3 && !isLast) return null;
              return (
                <div
                  key={`${label}-${col}`}
                  className="text-[10px] text-cream-500 truncate"
                  style={{ width: `${span * 13}px` }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1.5 justify-start">
              {DAYS.map((day, i) => (
                <div
                  key={i}
                  className="h-[11px] text-[10px] text-cream-500 leading-[11px] w-6 text-right pr-0.5"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map(({ dateStr, isFuture }) => {
                    const count = activity[dateStr] || 0;
                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "w-[11px] h-[11px] rounded-[2px] transition-colors",
                          getCellColor(count, isFuture)
                        )}
                        title={
                          isFuture
                            ? dateStr
                            : `${dateStr}: ${count} ${count === 1 ? "response" : "responses"}`
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 ml-8">
            <span className="text-[10px] text-cream-500">Less</span>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-cream-100" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-peach-200" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-peach-300" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-peach-500" />
            <span className="text-[10px] text-cream-500">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
