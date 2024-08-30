'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const Tooltip = ({ children, content, position = 'top', backgroundColor, forceVisible = '', boxWidth = '20vw' }: { children: React.ReactNode, content: React.ReactNode, position: string, backgroundColor: string, forceVisible: string, boxWidth: string}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [tooltipWidth, setTooltipWidth] = useState(boxWidth); // Default value
  const [finalPosition, setFinalPosition] = useState(position); // Add state for final position
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width:0, height: 0 });

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      setDimensions({
        width: tooltipRef.current.offsetWidth,
        height: tooltipRef.current.offsetHeight
      });
    }
  }, []);

  useEffect(() => {
    // Update tooltip width on window resize
    const handleResize = () => {
      const newWidth = `${Math.max(Math.min(window.innerWidth * 0.2, 300), 100)}px`; // 20% of viewport width or 400px max
      setTooltipWidth(newWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showTooltip = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { top, left, width, height } = rect;
    
    let tooltipTop: number, tooltipLeft: number;
    switch (finalPosition) {
      case 'top': //We're only using top right now, so didn't bother with the scroll for other cases.
        tooltipTop = top - 10; // Account for scroll
        tooltipLeft = left + width / 2 + 10;
        break;
      case 'right':
        tooltipTop = top + height / 2 ;
        tooltipLeft = left + width + 10;
        break;
      case 'bottom':
        tooltipTop = top + height + 10;
        tooltipLeft = left + width / 2;
        break;
      case 'left':
        tooltipTop = top + height / 2;
        tooltipLeft = left - 10;
        break;
      default:
        tooltipTop = top - 10;
        tooltipLeft = left + width / 2;
    }

    setCoords({ top: tooltipTop, left: tooltipLeft });
    setVisible(true);

    // Measure tooltip size after it becomes visible
    setTimeout(() => {
      if (tooltipRef.current) {

        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        // Check if the tooltip goes off the top of the screen
        if (tooltipRect.top - 10 < 0 && (finalPosition !== 'left' && finalPosition !== 'right' && finalPosition !== 'bottom')) {
          tooltipTop = top + tooltipRect.height + height + 10; // Adjust to show below the element
        } 
        // Check if the tooltip goes off the bottom of the screen
        else if (tooltipRect.bottom > window.innerHeight && finalPosition === 'bottom') {
          tooltipTop = top - tooltipRect.height - 10; // Adjust to show above the element
        }

        // Update tooltip coordinates after checking bounds
        setCoords({ top: tooltipTop, left: tooltipLeft });
      }
    }, 10); // Ensure tooltip is rendered before measuring
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  return (
    <div
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      className="w-full relative inline-block"
    >
      {children}
      {/* ON = always show, OFF = never show, other = show if moused over */}
      {(forceVisible === 'ON' || (visible && forceVisible !== 'OFF')) && (
        <div
          ref={tooltipRef}
          className={`fixed z-10 px-2 py-1 text-sm text-purple-800 text-semibold ${backgroundColor} rounded shadow-lg
          ${position === 'top' ? 'transform -translate-x-1/2 -translate-y-full' : ''}
          ${position === 'right' ? 'transform -translate-y-1/2' : ''}
          ${position === 'bottom' ? 'transform -translate-x-1/2' : ''}
          ${position === 'left' ? 'transform -translate-y-1/2 -translate-x-full' : ''}`}
          style={{ top: `${coords.top}px`, left: `${coords.left}px`, minWidth: `100px`, maxWidth: tooltipWidth, whiteSpace: 'normal'}}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;