import { useMemo } from 'react';

interface SkillData {
  skill: string;
  value: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data: SkillData[];
  size?: number;
}

export function SkillRadarChart({ data, size = 200 }: SkillRadarChartProps) {
  const center = size / 2;
  const radius = size * 0.35;
  const levels = 5;

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = (d.value / d.fullMark) * radius;
      return {
        x: center + value * Math.cos(angle),
        y: center + value * Math.sin(angle),
        labelX: center + (radius + 25) * Math.cos(angle),
        labelY: center + (radius + 25) * Math.sin(angle),
        skill: d.skill,
        value: d.value,
      };
    });
  }, [data, center, radius]);

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Generate grid lines
  const gridPolygons = useMemo(() => {
    return Array.from({ length: levels }, (_, level) => {
      const levelRadius = (radius / levels) * (level + 1);
      const angleStep = (2 * Math.PI) / data.length;
      return data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
      }).join(' ');
    });
  }, [data.length, center, radius]);

  // Axis lines
  const axisLines = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return {
        x2: center + radius * Math.cos(angle),
        y2: center + radius * Math.sin(angle),
      };
    });
  }, [data.length, center, radius]);

  return (
    <div className="relative">
      <svg width={size} height={size} className="mx-auto">
        {/* Grid */}
        {gridPolygons.map((polygon, i) => (
          <polygon
            key={i}
            points={polygon}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity={0.3 + i * 0.1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={line.x2}
            y2={line.y2}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Data polygon with gradient */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          filter="url(#glow)"
          className="transition-all duration-500"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
            className="transition-all duration-300"
          />
        ))}

        {/* Labels */}
        {points.map((point, i) => (
          <text
            key={i}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px] font-medium"
          >
            {point.skill}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">{d.skill}: {d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
