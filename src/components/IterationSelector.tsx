"use client";

import { useStore } from "@/lib/store";

interface Props {
  value: string | null;
  onChange: (iterationTitle: string) => void;
}

export default function IterationSelector({ value, onChange }: Props) {
  const { projectData } = useStore();
  const iterations = projectData?.iterations ?? [];

  if (iterations.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)]">No iterations found.</p>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="px-2.5 py-1.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer pr-7"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      <option value="" disabled>
        Select iteration
      </option>
      {iterations.map((it) => (
        <option key={it.id} value={it.title}>
          {it.title}
        </option>
      ))}
    </select>
  );
}
