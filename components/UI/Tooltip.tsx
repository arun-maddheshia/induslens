// components/Tooltip.tsx
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-700 text-white text-sm rounded py-1 px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
