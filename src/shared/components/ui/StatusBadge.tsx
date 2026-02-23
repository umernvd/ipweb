import React from 'react';

type StatusType = 'Active' | 'Pending' | 'Completed' | 'Reviewing';

interface StatusBadgeProps {
  status: StatusType;
  variant?: 'solid' | 'outlined';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'solid' 
}) => {
  const statusStyles = {
    Active: 'bg-green-600 text-white',
    Pending: 'bg-yellow-500 text-slate-900',
    Completed: 'bg-green-600 text-white',
    Reviewing: 'bg-blue-600 text-white',
  };

  const outlinedStyles = {
    Active: 'border-green-600 text-green-600',
    Pending: 'border-yellow-500 text-yellow-600',
    Completed: 'border-green-600 text-green-600',
    Reviewing: 'border-blue-600 text-blue-600',
  };

  if (variant === 'outlined') {
    return (
      <span 
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${outlinedStyles[status]}`}
        role="status"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  }

  return (
    <span 
      className={`text-xs font-medium px-2.5 py-1 rounded-md ${statusStyles[status]}`}
      role="status"
    >
      {status}
    </span>
  );
};

export type { StatusType, StatusBadgeProps };
