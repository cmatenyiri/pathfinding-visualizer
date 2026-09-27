import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import { getAlgorithm } from '../algorithms';
import { useEngineSnapshot } from '../core/engine';
import { fonts, tokens } from '../theme/tokens';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 currentColor; }
  70%, 100% { box-shadow: 0 0 0 6px transparent; }
`;

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Box sx={{ minWidth: 72 }}>
      <Typography
        variant="overline"
        sx={{ display: 'block', color: 'text.disabled', lineHeight: 1.4 }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{ fontFamily: fonts.mono, fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}
      >
        {value}
        {unit && (
          <Box component="span" sx={{ fontSize: 12, color: 'text.secondary', ml: 0.4 }}>
            {unit}
          </Box>
        )}
      </Typography>
    </Box>
  );
}

function StatusPill() {
  const { status, stats } = useEngineSnapshot();
  let label = 'Ready';
  let color: string = tokens.textMuted;
  if (status === 'running') {
    label = 'Exploring…';
    color = tokens.primary;
  } else if (status === 'generating') {
    label = 'Building maze…';
    color = tokens.secondary;
  } else if (status === 'done' && stats) {
    label = stats.found ? 'Path found' : 'No path';
    color = stats.found ? tokens.start : tokens.target;
  }
  const live = status === 'running' || status === 'generating';

  return (
    <Box
      role="status"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.25,
        height: 28,
        borderRadius: '999px',
        fontFamily: fonts.display,
        fontWeight: 600,
        fontSize: 12.5,
        color,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.25)}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: 'currentColor',
          animation: live ? `${pulse} 1.2s ease-out infinite` : 'none',
        }}
      />
      {label}
    </Box>
  );
}

export function StatsPanel() {
  const { stats, status } = useEngineSnapshot();
  const show = stats && status === 'done';
  const dash = '—';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 }, flexWrap: 'wrap' }}>
      <StatusPill />
      <Stat label="Visited" value={show ? stats.visited.toLocaleString() : dash} />
      <Stat label="Path length" value={show && stats.found ? String(stats.pathLength) : dash} />
      <Stat label="Path cost" value={show && stats.found ? String(stats.pathCost) : dash} />
      <Stat
        label="Compute"
        value={show ? (stats.computeMs < 1 ? '<1' : stats.computeMs.toFixed(1)) : dash}
        unit={show ? 'ms' : undefined}
      />
      {show && (
        <Typography variant="caption" sx={{ display: { xs: 'none', xl: 'block' }, maxWidth: 160 }}>
          {getAlgorithm(stats.algorithm).shortName}
          {stats.viaBomb ? ' · via bomb' : ''}
        </Typography>
      )}
    </Box>
  );
}
