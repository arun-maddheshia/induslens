// components/Tooltip.tsx
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 transform rounded bg-gray-700 px-2 py-1 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
