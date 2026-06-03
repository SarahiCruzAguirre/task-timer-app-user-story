"use client";
// Background Spline scene used as a decorative backdrop. Loads the
// Spline viewer script if not already present and renders the component.
import { useEffect } from 'react';

export default function SplineBackground() {
  useEffect(() => {
    if (document.getElementById('spline-viewer-script')) return;
    const script = document.createElement('script');
    script.id = 'spline-viewer-script';
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.94/build/spline-viewer.js';
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* @ts-expect-error custom web component */}
      <spline-viewer
        url="https://prod.spline.design/DJm0TE4GkUuFRP2y/scene.splinecode"
        style={{ display: 'block', width: '100%', height: '200px', opacity: 0.6 }}
      />
    </div>
  );
}
