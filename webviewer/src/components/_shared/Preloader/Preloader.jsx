import React from 'react';

import { StyledPreloader } from './Preloader.styles';

export const Preloader = props => {
  const { duration = 1200, size = 30, color = '#2D4F34', ...loaderProps } = props;

  return (
    <StyledPreloader {...loaderProps} size={size}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 64 64'
        color={color}
        fill='none'
      >
        <g>
          <defs>
            <linearGradient
              id='sGD'
              gradientUnits='userSpaceOnUse'
              x1='55'
              y1='46'
              x2='2'
              y2='46'
            >
              <stop offset='0.1' stopColor='currentColor' stopOpacity='0' />
              <stop offset='1' stopColor='currentColor' stopOpacity='1' />
            </linearGradient>
          </defs>
          <g strokeWidth='6' strokeLinecap='round' stroke='currentColor' fill='none'>
            <path stroke='url(#sGD)' d='M4,32 c0,15,12,28,28,28c8,0,16-4,21-9' />
            <path d='M60,32 C60,16,47.464,4,32,4S4,16,4,32' />
            <animateTransform
              values='0,32,32;360,32,32'
              attributeName='transform'
              type='rotate'
              repeatCount='indefinite'
              dur={`${duration}ms`}
            />
          </g>
        </g>
      </svg>
    </StyledPreloader>
  );
};
