import Box from '@mui/material/Box';
import { useEffect, useRef } from 'react';
import { engine, useEngineSnapshot } from '../core/engine';
import { tokens } from '../theme/tokens';

const GAP = 1;
const MIN_ROWS = 7;
const MIN_COLS = 9;

/** Bigger nodes on bigger screens. */
const cellSizeFor = (viewportWidth: number) =>
  viewportWidth >= 1500 ? 26 : viewportWidth >= 1000 ? 24 : 20;

/** Odd dimensions keep maze corridors symmetric and let a frame wall surround them. */
const oddFloor = (value: number, min: number) => {
  const v = Math.max(min, Math.floor(value));
  return v % 2 === 0 ? v - 1 : v;
};

export function Board() {
  const areaRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { status } = useEngineSnapshot();
  const busy = status === 'running' || status === 'generating';

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    engine.mount(board);
    return () => engine.unmount();
  }, []);

  useEffect(() => {
    const area = areaRef.current;
    const board = boardRef.current;
    if (!area || !board) return;

    const measure = () => {
      const size = cellSizeFor(window.innerWidth);
      const pitch = size + GAP;
      const cols = oddFloor((area.clientWidth - GAP) / pitch, MIN_COLS);
      const rows = oddFloor((area.clientHeight - GAP) / pitch, MIN_ROWS);
      board.style.setProperty('--cell', `${size}px`);
      engine.resize(rows, cols);
    };

    // Measure right away, then debounce: a resize rebuilds the board and clears any result.
    let timer: number | undefined;
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        measure();
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 200);
    });
    observer.observe(area);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: { xs: '64vh', md: 0 },
        display: 'flex',
        p: { xs: 1, md: 1.5 },
        mx: { xs: 1, md: 2.5 },
        borderRadius: '18px',
        border: `1px solid ${tokens.line}`,
        background: `linear-gradient(180deg, rgba(14,19,38,0.75), rgba(10,14,28,0.75))`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 30px 80px -40px rgba(0,0,0,0.9)',
      }}
    >
      <Box ref={areaRef} sx={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div
          ref={boardRef}
          className={busy ? 'board is-busy' : 'board'}
          role="grid"
          aria-label="Pathfinding board"
          style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            if (engine.pointerDown(event.clientX, event.clientY)) {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
          onPointerMove={(event) => engine.pointerMove(event.clientX, event.clientY)}
          onPointerUp={() => engine.pointerUp()}
          onPointerCancel={() => engine.pointerUp()}
          onLostPointerCapture={() => engine.pointerUp()}
          onContextMenu={(event) => event.preventDefault()}
        />
      </Box>
    </Box>
  );
}
