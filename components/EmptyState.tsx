interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`glass rounded-2xl p-10 text-center ${className}`}>
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
