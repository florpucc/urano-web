import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, MousePointer, Image } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  sliderColor?: string;
  width?: number;
  height?: number;
  beforeCaption?: string;
  afterCaption?: string;
}

export function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeAlt = "Before",
  afterAlt = "After",
  sliderColor = "#A5B4FC",
  width,
  height,
  beforeCaption,
  afterCaption
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showQuickSwap, setShowQuickSwap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSliderPosition = useCallback((clientX: number, clientY?: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX);
    }
  }, [isDragging, updateSliderPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
  }, [updateSliderPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault();
      updateSliderPosition(e.touches[0].clientX);
    }
  }, [isDragging, updateSliderPosition]);



  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (containerRef.current) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setSliderPosition(prev => Math.max(0, prev - 5));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setSliderPosition(prev => Math.min(100, prev + 5));
          break;
        case 'Home':
          e.preventDefault();
          setSliderPosition(0);
          break;
        case 'End':
          e.preventDefault();
          setSliderPosition(100);
          break;
        case ' ':
          e.preventDefault();
          setSliderPosition(50);
          break;
      }
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);



  const handleBeforeClick = () => {
    setSliderPosition(100);
  };

  const handleAfterClick = () => {
    setSliderPosition(0);
  };

  const handleQuickSwap = () => {
    setSliderPosition(sliderPosition > 50 ? 0 : 100);
  };

  const resetToCenter = () => {
    setSliderPosition(50);
  };

  // Transition style - only apply when not dragging
  const transitionStyle = !isDragging ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';

  const afterPercentage = Math.round(100 - sliderPosition);
  const beforePercentage = Math.round(sliderPosition);

  // Check if images are empty (placeholder)
  const isBeforeImageEmpty = !beforeImage || beforeImage.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  const isAfterImageEmpty = !afterImage || afterImage.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

  return (
    <div className="w-full h-full">
      <div
        ref={containerRef}
        className="relative w-full h-full bg-gray-100 border-4 rounded-[12px] shadow-lg cursor-col-resize select-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          borderColor: sliderColor,
          focusRingColor: sliderColor,
          ...(width && height ? { width: `${width}px`, height: `${height}px` } : {})
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={() => setShowQuickSwap(true)}
        tabIndex={0}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={sliderPosition}
        aria-label="Before and after image comparison slider"
      >
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt={afterAlt}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        
        {/* After Image Empty State Icon */}
        {isAfterImageEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
          </div>
        )}

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            transition: transitionStyle
          }}
        >
          <img
            src={beforeImage}
            alt={beforeAlt}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Before Image Empty State Icon */}
          {isBeforeImageEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Image className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 shadow-lg pointer-events-none"
          style={{ 
            left: `${sliderPosition}%`, 
            transform: 'translateX(-50%)',
            backgroundColor: sliderColor,
            transition: transitionStyle
          }}
        />

        {/* Enhanced Slider Handle - Larger for mobile */}
        <div
          className="absolute top-1/2 w-16 h-16 md:w-14 md:h-14 border-4 rounded-full shadow-xl cursor-col-resize flex items-center justify-center transform -translate-y-1/2 hover:scale-110 active:scale-95"
          style={{ 
            left: `${sliderPosition}%`, 
            transform: 'translate(-50%, -50%)',
            backgroundColor: sliderColor,
            borderColor: 'white',
            transition: isDragging ? 'none' : `${transitionStyle}, transform 0.2s ease`
          }}
        >
          <div className="flex items-center space-x-0.5">
            <ChevronLeft className="w-5 h-5 md:w-4 md:h-4 text-white" />
            <ChevronRight className="w-5 h-5 md:w-4 md:h-4 text-white" />
          </div>
        </div>

        {/* Percentage Indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-medium">
          {beforePercentage}% Before • {afterPercentage}% After
        </div>

        {/* Enhanced Labels with Captions */}
        <div className="absolute bottom-4 left-4 space-y-1">
          <button
            onClick={handleBeforeClick}
            className="block bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all hover:scale-105 font-medium"
          >
            Before
          </button>
          {beforeCaption && (
            <p className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded max-w-32 truncate">
              {beforeCaption}
            </p>
          )}
        </div>

        <div className="absolute bottom-4 right-4 space-y-1 text-right">
          <button
            onClick={handleAfterClick}
            className="block bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all hover:scale-105 font-medium"
          >
            After
          </button>
          {afterCaption && (
            <p className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded max-w-32 truncate">
              {afterCaption}
            </p>
          )}
        </div>

        {/* Quick Swap & Reset Controls */}
        {showQuickSwap && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleQuickSwap}
              className="bg-black bg-opacity-75 text-white p-2 rounded-lg hover:bg-opacity-90 transition-all hover:scale-105"
              title="Quick swap between before and after"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              onClick={resetToCenter}
              className="bg-black bg-opacity-75 text-white p-2 rounded-lg hover:bg-opacity-90 transition-all hover:scale-105"
              title="Reset to center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Keyboard Instructions (shows on focus) */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs opacity-0 focus-within:opacity-100 transition-opacity">
          ← → or A/D keys to slide • Space to center
        </div>
      </div>

      {/* Mobile-friendly instructions */}
      <div className="mt-2 text-center md:hidden">
        <p className="text-xs text-gray-600 px-2 py-1 leading-relaxed">
          👆 Tap Before/After buttons or drag the handle
        </p>
      </div>
    </div>
  );
}