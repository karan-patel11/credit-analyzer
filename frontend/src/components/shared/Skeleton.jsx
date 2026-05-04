import React from 'react';

const Skeleton = ({ className = '', style = {} }) => {
  return (
    <div 
      className={`animate-shimmer rounded ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
