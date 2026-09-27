import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import { engine } from '../core/engine';
import type { Notice } from '../core/BoardEngine';

/** Toasts for engine events such as "no path found". */
export function Notices() {
  const [notice, setNotice] = useState<(Notice & { id: number }) | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(
    () =>
      engine.onNotice((next) => {
        setNotice({ ...next, id: Date.now() });
        setOpen(true);
      }),
    [],
  );

  return (
    <Snackbar
      key={notice?.id}
      open={open}
      autoHideDuration={4200}
      onClose={(_event, reason) => reason !== 'clickaway' && setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={notice?.severity ?? 'info'}
        variant="outlined"
        onClose={() => setOpen(false)}
        sx={{ minWidth: 320 }}
      >
        {notice?.message}
      </Alert>
    </Snackbar>
  );
}
