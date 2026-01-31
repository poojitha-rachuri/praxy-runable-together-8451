import { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  className?: string;
  position?: "left" | "right";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const SpeechBubble = ({ 
  children, 
  className = "", 
  position = "left",
  size = "md",
  animate = false 
}: SpeechBubbleProps) => {
  
  const sizeClasses = {
    sm: "text-sm p-3",
    md: "text-base p-4",
    lg: "text-lg p-5"
  };

  const tailPosition = position === "left" 
    ? "left-4 -bottom-3" 
    : "right-4 -bottom-3";

  const tailRotation = position === "left" 
    ? "" 
    : "scale-x-[-1]";

  return (
    <div 
      className={`relative ${animate ? "animate-fade-in-up" : ""} ${className}`}
    >
      {/* Main bubble with gradient border */}
      <div className="relative">
        {/* Gradient border */}
        <div 
          className="absolute inset-0 rounded-[16px] p-[2px]"
          style={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD166 50%, #FF6B6B 100%)"
          }}
        >
          {/* Inner white background */}
          <div 
            className={`w-full h-full bg-white rounded-[14px] ${sizeClasses[size]}`}
          />
        </div>
        
        {/* Content */}
        <div 
          className={`relative z-10 ${sizeClasses[size]} font-inter text-charcoal leading-relaxed`}
        >
          {children}
        </div>
      </div>
      
      {/* Tail with gradient */}
      <div 
        className={`absolute ${tailPosition} ${tailRotation}`}
        style={{ width: 0, height: 0 }}
      >
        <svg 
          width="24" 
          height="16" 
          viewBox="0 0 24 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#FFD166" />
            </linearGradient>
          </defs>
          {/* Gradient border tail */}
          <path
            d="M 2 0 Q 8 8, 16 12 Q 10 10, 6 2 Z"
            fill="url(#tailGradient)"
          />
          {/* White inner tail */}
          <path
            d="M 3 1 Q 8 7.5, 14.5 11 Q 10 9.5, 6.5 2.5 Z"
            fill="white"
          />
        </svg>
      </div>
      
      {/* Subtle shadow */}
      <div 
        className="absolute inset-0 -z-10 blur-lg opacity-10 rounded-[16px]"
        style={{
          background: "linear-gradient(135deg, #FF6B6B 0%, #FFD166 100%)",
          transform: "translateY(4px)"
        }}
      />
    </div>
  );
};

export default SpeechBubble;
