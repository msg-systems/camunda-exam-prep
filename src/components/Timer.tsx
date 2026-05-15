interface TimerProps {
  formatted: string;
  expired: boolean;
}

export function Timer({ formatted, expired }: TimerProps) {
  return (
    <div
      className={`rounded px-3 py-1 font-mono text-lg ${
        expired ? 'bg-red-600 text-white' : 'bg-slate-800 text-white dark:bg-slate-700'
      }`}
      title="Time remaining"
    >
      {formatted}
    </div>
  );
}
