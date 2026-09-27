import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getAlgorithm } from '../algorithms';
import type { AlgorithmId } from '../core/types';
import { AlgorithmTags } from './AlgorithmTags';

export function AlgorithmSummary({ algorithm }: { algorithm: AlgorithmId }) {
  const info = getAlgorithm(algorithm);
  return (
    <Box sx={{ minWidth: 0, flex: '1 1 420px', maxWidth: 820 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 0.5 }}>
        <Typography variant="h6" component="h2" sx={{ fontSize: 17, lineHeight: 1.3 }}>
          {info.name}
        </Typography>
        <AlgorithmTags info={info} />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
        {info.description}
      </Typography>
    </Box>
  );
}
