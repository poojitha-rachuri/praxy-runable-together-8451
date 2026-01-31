interface PraxyMascotProps {
  size?: number;
  className?: string;
  waving?: boolean;
  expression?: "default" | "thinking" | "celebrating" | "sympathetic" | "happy";
}

const PraxyMascot = ({ size = 120, className = "", waving = true, expression = "default" }: PraxyMascotProps) => {
  // Map expression to image file - use base URL for consistent path resolution
  const getImageSrc = () => {
    const basePath = import.meta.env.BASE_URL || '/';
    const imageMap: Record<string, string> = {
      thinking: 'praxy-thinking.png',
      celebrating: 'praxy-celebrating.png',
      sympathetic: 'praxy-sympathetic.png',
      happy: 'praxy-happy.png',
      default: 'praxy-default.png',
    };
    const imageName = imageMap[expression] || imageMap.default;
    return `${basePath}${imageName}`;
  };

  return (
    <div
      className={`relative ${waving ? "animate-float" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Mascot image */}
      <img
        src={getImageSrc()}
        alt="Praxy mascot"
        width={size}
        height={size}
        className={`w-full h-full object-contain ${waving ? "animate-wave" : ""}`}
        style={{
          filter: expression === "celebrating" ? "drop-shadow(0 4px 12px rgba(255, 107, 107, 0.3))" : "drop-shadow(0 2px 8px rgba(38, 70, 83, 0.15))"
        }}
      />
      
      {/* Celebration sparkles for celebrating expression */}
      {expression === "celebrating" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1 w-2 h-2 rounded-full bg-yellow animate-pulse" />
          <div className="absolute top-2 right-0 w-2.5 h-2.5 rounded-full bg-yellow animate-pulse delay-150" />
          <div className="absolute bottom-4 left-0 w-1.5 h-1.5 rounded-full bg-mint animate-pulse delay-300" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-mint animate-pulse delay-450" />
        </div>
      )}
      
      {/* Subtle glow effect underneath */}
      <div 
        className="absolute inset-0 -z-10 blur-xl opacity-30"
        style={{
          background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)",
          transform: "translateY(10px) scale(0.8)"
        }}
      />
    </div>
  );
};

export default PraxyMascot;
