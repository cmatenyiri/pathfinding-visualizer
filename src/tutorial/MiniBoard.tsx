import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState, type CSSProperties } from 'react';
import { Keycap } from '../components/Keycap';
import type { Scene } from './scenes';

const GAP = 1;

function PointerIcon({ pressed }: { pressed: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      {pressed && <circle cx="4" cy="3" r="7" fill="rgba(46,230,214,0.35)" />}
      <path
        d="M4 3 L4 17.5 L8 14 L11 20 L13.6 18.8 L10.7 12.9 L16 12.6 Z"
        fill="#fff"
        stroke="#05070F"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Loops through a pre-scripted scene, rendered with the real board styles. */
export function MiniBoard({ scene }: { scene: Scene }) {
  const [index, setIndex] = useState(0);
  const frame = scene.frames[Math.min(index, scene.frames.length - 1)];
  const { rows, cols } = scene;
  // Shrink the cells on phones so the whole board fits the dialog.
  const cell = useMediaQuery('(max-width: 600px)') ? 12 : 18;
  const pitch = cell + GAP;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % scene.frames.length),
      frame.duration,
    );
    return () => window.clearTimeout(timer);
  }, [frame, scene.frames.length]);

  const cursor = frame.cursor;
  const cursorX = cursor ? GAP + (cursor.index % cols) * pitch + cell / 2 - 4 : 0;
  const cursorY = cursor ? GAP + Math.floor(cursor.index / cols) * pitch + cell / 2 - 3 : 0;

  return (
    <Box sx={{ position: 'relative', width: 'fit-content', mx: 'auto' }}>
      <div
        className="board is-mini"
        style={
          {
            '--cols': cols,
            '--cell': `${cell}px`,
            '--visit-duration': '0.75s',
            '--path-duration': '0.45s',
            '--pop-duration': '0.25s',
            gridTemplateRows: `repeat(${rows}, ${cell}px)`,
          } as CSSProperties
        }
        aria-hidden
      >
        {frame.cells.map((cls, i) => (
          <div key={i} className={cls} />
        ))}
      </div>

      {cursor && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 5,
            pointerEvents: 'none',
            transition: 'transform 110ms linear',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
          }}
          style={{ transform: `translate(${cursorX}px, ${cursorY}px)` }}
        >
          <PointerIcon pressed={cursor.pressed} />
        </Box>
      )}

      <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 5, display: 'flex', gap: 0.5 }}>
        {frame.keys.map((key) => (
          <Keycap key={key} active>
            {key}
          </Keycap>
        ))}
      </Box>
    </Box>
  );
}
