"use client";
// Lightweight wrapper that injects the Spline viewer script and renders
// a 3D scene inside the card. The external viewer is loaded dynamically.
import { useEffect } from 'react';

export default function SplineCard() {
  useEffect(() => {
    // Load the Spline web component script once per page
    if (document.getElementById('spline-viewer-script')) return;
    const script = document.createElement('script');
    script.id = 'spline-viewer-script';
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.94/build/spline-viewer.js';
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', contain: 'layout paint', background: '#0a0812', borderRadius: '1rem' }}>
      {/* Render the Spline scene using the custom web component */}
      {/* @ts-expect-error custom web component */}
      <spline-viewer
        url="https://prod.spline.design/DJm0TE4GkUuFRP2y/scene.splinecode"
        style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
      />
    </div>
  );
}
