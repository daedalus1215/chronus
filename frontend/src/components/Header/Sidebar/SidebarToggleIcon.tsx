import React from 'react';

type SidebarToggleIconProps = {
  isOpen: boolean;
  size?: number;
};

export const SidebarToggleIcon: React.FC<SidebarToggleIconProps> = ({
  isOpen,
  size = 18,
}) => {
  if (isOpen) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer frame */}
        <rect
          x="0.75"
          y="0.75"
          width="18.5"
          height="14.5"
          rx="1.75"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Vertical divider separating sidebar from content */}
        <line
          x1="6.25"
          y1="0.75"
          x2="6.25"
          y2="15.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Filled sidebar panel indicating it is open */}
        <rect
          x="1.5"
          y="1.5"
          width="4"
          height="13"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer frame */}
      <rect
        x="0.75"
        y="0.75"
        width="18.5"
        height="14.5"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Dashed divider showing sidebar is collapsed but available */}
      <line
        x1="6.25"
        y1="0.75"
        x2="6.25"
        y2="15.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeDasharray="2.5 2"
      />
    </svg>
  );
};
