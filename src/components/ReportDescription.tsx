"use client";

interface Props {
  how: string;
  why: string;
}

export default function ReportDescription({ how, why }: Props) {
  return (
    <div className="mt-6 space-y-2 max-w-2xl">
      <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">
        <span className="text-[var(--text-secondary)] font-medium">How it works:</span>{" "}
        {how}
      </p>
      <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">
        <span className="text-[var(--text-secondary)] font-medium">What it's for:</span>{" "}
        {why}
      </p>
    </div>
  );
}
