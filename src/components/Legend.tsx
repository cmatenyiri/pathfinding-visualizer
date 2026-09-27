import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { NodeSwatch, type SwatchType } from './NodeSwatch';

const ITEMS: { type: SwatchType; label: string }[] = [
  { type: 'start', label: 'Start' },
  { type: 'target', label: 'Target' },
  { type: 'bomb', label: 'Bomb' },
  { type: 'weight', label: 'Weight' },
  { type: 'wall', label: 'Wall' },
  { type: 'unvisited', label: 'Unvisited' },
  { type: 'visited', label: 'Visited' },
  { type: 'visited-bomb', label: 'Visited (to bomb)' },
  { type: 'path', label: 'Shortest path' },
];

export function Legend() {
  return (
    <Box
      component="ul"
      aria-label="Legend"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 2.25,
        rowGap: 1,
        m: 0,
        p: 0,
        listStyle: 'none',
      }}
    >
      {ITEMS.map(({ type, label }) => (
        <Box component="li" key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NodeSwatch type={type} size={16} />
          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
