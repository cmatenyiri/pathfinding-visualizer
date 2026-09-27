import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { tokens } from '../theme/tokens';

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2EE6D6" />
          <stop offset="0.55" stopColor="#6FA8FF" />
          <stop offset="1" stopColor="#8B7BFF" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="11"
        fill="#0E1326"
        stroke="url(#logo-g)"
        strokeOpacity="0.55"
      />
      <g fill="rgba(148,163,209,0.18)">
        {[10, 20, 30].flatMap((y) =>
          [10, 20, 30].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />),
        )}
      </g>
      <path
        d="M10 30 V20 H20 V10 H30"
        fill="none"
        stroke="url(#logo-g)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="30" r="3.6" fill={tokens.start} />
      <circle cx="30" cy="10" r="3.6" fill={tokens.target} />
    </svg>
  );
}

export function Brand() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mr: 1 }}>
      <LogoMark />
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Wayfinder
        </Typography>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'text.disabled',
            lineHeight: 1.4,
          }}
        >
          Pathfinding visualizer
        </Typography>
      </Box>
    </Box>
  );
}
