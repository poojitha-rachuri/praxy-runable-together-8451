interface PraxyMascotProps {
  size?: number;
  className?: string;
  waving?: boolean;
  expression?: "default" | "thinking" | "celebrating" | "sympathetic";
}

const PraxyMascot = ({ size = 120, className = "", waving = true, expression = "default" }: PraxyMascotProps) => {
  // Eye positions based on expression
  const getEyeProps = () => {
    switch (expression) {
      case "thinking":
        // Eyes looking up
        return {
          leftPupilCx: 38,
          leftPupilCy: 47,
          rightPupilCx: 62,
          rightPupilCy: 47,
          eyeScaleY: 1,
        };
      case "celebrating":
        // Eyes slightly squinted (happy)
        return {
          leftPupilCx: 39,
          leftPupilCy: 51,
          rightPupilCx: 63,
          rightPupilCy: 51,
          eyeScaleY: 0.8,
        };
      case "sympathetic":
        // Eyes tilted sympathetically
        return {
          leftPupilCx: 39,
          leftPupilCy: 52,
          rightPupilCx: 63,
          rightPupilCy: 50,
          eyeScaleY: 1,
        };
      default:
        return {
          leftPupilCx: 39,
          leftPupilCy: 51,
          rightPupilCx: 63,
          rightPupilCy: 51,
          eyeScaleY: 1,
        };
    }
  };

  const getSmilePath = () => {
    switch (expression) {
      case "celebrating":
        // Bigger, more enthusiastic smile
        return "M 35 62 Q 50 78 65 62";
      case "sympathetic":
        // Gentle, understanding smile
        return "M 40 65 Q 50 72 60 65";
      default:
        return "M 38 64 Q 50 74 62 64";
    }
  };

  const eyeProps = getEyeProps();
  const smilePath = getSmilePath();

  return (
    <div
      className={`relative ${waving ? "animate-float" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Main blob body */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={waving ? "animate-wave" : ""}
      >
        {/* Blob shape */}
        <ellipse
          cx="50"
          cy="52"
          rx="42"
          ry="40"
          fill="#FF6B6B"
          className="drop-shadow-lg"
        />
        
        {/* Subtle highlight */}
        <ellipse
          cx="38"
          cy="40"
          rx="15"
          ry="12"
          fill="rgba(255, 255, 255, 0.2)"
        />
        
        {/* Left eye */}
        <ellipse 
          cx="38" 
          cy="50" 
          rx="6" 
          ry={6 * eyeProps.eyeScaleY} 
          fill="white" 
          className={expression === "default" ? "animate-blink" : ""} 
        />
        <circle cx={eyeProps.leftPupilCx} cy={eyeProps.leftPupilCy} r="2.5" fill="#264653" />
        
        {/* Right eye */}
        <ellipse 
          cx="62" 
          cy="50" 
          rx="6" 
          ry={6 * eyeProps.eyeScaleY} 
          fill="white" 
          className={expression === "default" ? "animate-blink" : ""} 
        />
        <circle cx={eyeProps.rightPupilCx} cy={eyeProps.rightPupilCy} r="2.5" fill="#264653" />
        
        {/* Smile */}
        <path
          d={smilePath}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Waving hand/arm */}
        {waving && (
          <g className="origin-center">
            <ellipse
              cx="85"
              cy="42"
              rx="10"
              ry="8"
              fill="#FF6B6B"
              className="drop-shadow-md"
            />
            {/* Small highlight on hand */}
            <ellipse
              cx="82"
              cy="39"
              rx="4"
              ry="3"
              fill="rgba(255, 255, 255, 0.2)"
            />
          </g>
        )}

        {/* Celebration sparkles for celebrating expression */}
        {expression === "celebrating" && (
          <>
            <circle cx="20" cy="30" r="2" fill="#FFD166" className="animate-pulse" />
            <circle cx="80" cy="25" r="2.5" fill="#FFD166" className="animate-pulse" />
            <circle cx="15" cy="55" r="1.5" fill="#06D6A0" className="animate-pulse" />
            <circle cx="85" cy="60" r="1.5" fill="#06D6A0" className="animate-pulse" />
          </>
        )}
      </svg>
      
      {/* Glow effect underneath */}
      <div 
        className="absolute inset-0 -z-10 blur-xl opacity-40"
        style={{
          background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)",
          transform: "translateY(10px)"
        }}
      />
    </div>
  );
};

export default PraxyMascot;
