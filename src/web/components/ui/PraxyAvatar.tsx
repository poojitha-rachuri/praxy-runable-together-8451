interface PraxyAvatarProps {
  size?: number;
  className?: string;
  expression?: "neutral" | "thinking" | "celebrating" | "encouraging";
  animate?: boolean;
}

const PraxyAvatar = ({ 
  size = 80, 
  className = "", 
  expression = "neutral",
  animate = false 
}: PraxyAvatarProps) => {
  
  // Eyes based on expression
  const renderEyes = () => {
    switch (expression) {
      case "thinking":
        return (
          <>
            {/* Left eye looking up-right */}
            <ellipse cx="35" cy="42" rx="4" ry="5" fill="#264653" />
            {/* Right eye looking up-right */}
            <ellipse cx="65" cy="42" rx="4" ry="5" fill="#264653" />
            {/* Thought bubble dots */}
            <circle cx="75" cy="25" r="2" fill="#264653" opacity="0.6" />
            <circle cx="80" cy="20" r="3" fill="#264653" opacity="0.5" />
            <circle cx="87" cy="15" r="4" fill="#264653" opacity="0.4" />
          </>
        );
      
      case "celebrating":
        return (
          <>
            {/* Closed happy eyes */}
            <path 
              d="M 30 45 Q 35 40 40 45" 
              stroke="#264653" 
              strokeWidth="3" 
              strokeLinecap="round"
              fill="none"
            />
            <path 
              d="M 60 45 Q 65 40 70 45" 
              stroke="#264653" 
              strokeWidth="3" 
              strokeLinecap="round"
              fill="none"
            />
            {/* Celebration sparkles */}
            <g className={animate ? "animate-pulse" : ""}>
              <path d="M 85 20 L 87 22 L 85 24 L 83 22 Z" fill="#FFD166" />
              <path d="M 15 25 L 17 27 L 15 29 L 13 27 Z" fill="#FFD166" />
              <path d="M 20 10 L 21 11 L 20 12 L 19 11 Z" fill="#06D6A0" />
              <path d="M 82 35 L 83 36 L 82 37 L 81 36 Z" fill="#06D6A0" />
            </g>
          </>
        );
      
      case "encouraging":
        return (
          <>
            {/* Warm, friendly eyes */}
            <ellipse cx="35" cy="45" rx="5" ry="6" fill="#264653" />
            <ellipse cx="65" cy="45" rx="5" ry="6" fill="#264653" />
            {/* Eye highlights for warmth */}
            <ellipse cx="36" cy="43" rx="2" ry="2.5" fill="white" opacity="0.8" />
            <ellipse cx="66" cy="43" rx="2" ry="2.5" fill="white" opacity="0.8" />
            {/* Little heart */}
            <path 
              d="M 85 30 C 85 27 87 25 89 25 C 90 25 91 26 91 27 C 91 26 92 25 93 25 C 95 25 97 27 97 30 C 97 33 91 37 91 37 C 91 37 85 33 85 30 Z" 
              fill="#FF6B6B" 
              opacity="0.6"
              className={animate ? "animate-pulse" : ""}
            />
          </>
        );
      
      default: // neutral
        return (
          <>
            {/* Simple round eyes */}
            <circle cx="35" cy="45" r="5" fill="#264653" />
            <circle cx="65" cy="45" r="5" fill="#264653" />
            {/* Eye highlights */}
            <circle cx="36" cy="43" r="2" fill="white" opacity="0.7" />
            <circle cx="66" cy="43" r="2" fill="white" opacity="0.7" />
          </>
        );
    }
  };

  // Mouth based on expression
  const renderMouth = () => {
    switch (expression) {
      case "thinking":
        return (
          <path 
            d="M 40 62 Q 50 64 60 62" 
            stroke="#264653" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            fill="none"
          />
        );
      
      case "celebrating":
        return (
          <path 
            d="M 35 60 Q 50 72 65 60" 
            stroke="#264653" 
            strokeWidth="3" 
            strokeLinecap="round"
            fill="none"
          />
        );
      
      case "encouraging":
        return (
          <path 
            d="M 38 62 Q 50 68 62 62" 
            stroke="#264653" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            fill="none"
          />
        );
      
      default: // neutral
        return (
          <path 
            d="M 40 63 Q 50 67 60 63" 
            stroke="#264653" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            fill="none"
          />
        );
    }
  };

  return (
    <div 
      className={`relative ${animate ? "animate-float" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient for blob */}
          <radialGradient id="blobGradient" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#FF8E8E" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </radialGradient>
        </defs>
        
        {/* Coral blob body - organic shape */}
        <path
          d="M 50 10 
             C 70 10, 85 20, 88 40 
             C 90 55, 85 70, 70 80 
             C 55 88, 45 88, 30 80 
             C 15 70, 10 55, 12 40 
             C 15 20, 30 10, 50 10 Z"
          fill="url(#blobGradient)"
          filter="url(#glow)"
        />
        
        {/* Eyes */}
        {renderEyes()}
        
        {/* Mouth */}
        {renderMouth()}
        
        {/* Blush marks for encouraging expression */}
        {expression === "encouraging" && (
          <>
            <ellipse cx="22" cy="55" rx="6" ry="4" fill="#FF6B6B" opacity="0.2" />
            <ellipse cx="78" cy="55" rx="6" ry="4" fill="#FF6B6B" opacity="0.2" />
          </>
        )}
      </svg>
      
      {/* Bottom glow effect */}
      <div 
        className="absolute inset-0 -z-10 blur-xl opacity-20"
        style={{
          background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)",
          transform: "translateY(10px) scale(0.8)"
        }}
      />
    </div>
  );
};

export default PraxyAvatar;
