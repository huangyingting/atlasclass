import React from 'react';

export const metadata = {
  title: 'Atlas · Interactive 3D textbooks for AP science and math',
  description: 'Interactive 3D textbooks and AP-style practice for AP Physics, AP Calculus, and AP Statistics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
