import { CssBaseline } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ({ children }: Props) {
  return (
    <>
      <CssBaseline />
      {children}
    </>
  );
}
