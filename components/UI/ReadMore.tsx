'use client';
import Link from 'next/link';
import { useState } from 'react';

interface ReadMoreProps {
  text: string;
  maxLength: number;
  className?: string;
  href?: string;
}

const ReadMore: React.FC<ReadMoreProps> = ({
  text,
  maxLength,
  className,
  href,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (text.length <= maxLength) {
    return <p>{text}</p>;
  }

  return (
    <div>
      <p className={className}>
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
        {href ? (
          <Link className="text-gray-500" href={href}>
            {isExpanded ? 'Read Less' : 'Read More'}
          </Link>
        ) : (
          <button className="text-gray-500" onClick={toggleExpand}>
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </p>
    </div>
  );
};

export default ReadMore;
