import React from 'react';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`neo-panel ${className}`}>
        {children}
    </div>
);

export default Card;
