import { useEffect } from 'react';
import Head from 'next/head';

export default function ScannerPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace(`/ar-lens-engine${window.location.search}`);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Launching LiveMemories Scanner...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#070a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          Opening Camera Scanner...
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
          Initializing LiveMemories camera lens for iPhone Safari & Android
        </p>
      </div>
    </>
  );
}
