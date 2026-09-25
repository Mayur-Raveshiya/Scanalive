import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function ARLensEngine() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isFound, setIsFound] = useState(false);

  // 1 & 2 & 3 & 4. Dynamically load A-Frame and MindAR, then set scriptsLoaded
  useEffect(() => {
    let isMounted = true;
    
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Preserve execution order
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initScripts = async () => {
      try {
        await loadScript("https://aframe.io/releases/1.5.0/aframe.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js");
        if (isMounted) {
          setScriptsLoaded(true);
        }
      } catch (err) {
        console.error("Error loading AR scripts", err);
      }
    };

    initScripts();

    return () => {
      isMounted = false;
    };
  }, []);

  // 9. Video handling and Target Events
  useEffect(() => {
    if (!scriptsLoaded) return;

    const videoStream = document.getElementById('ar-video-stream');
    const targetEntity = document.getElementById('target-entity-0');

    if (videoStream) {
      const events = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'play', 'pause', 'error', 'stalled', 'abort', 'emptied'];
      events.forEach(evt => {
        videoStream.addEventListener(evt, (e) => {
          console.log(`[Video Event] ${evt}`, videoStream.readyState);
          if (evt === 'error') {
            console.error('Video Error Details:', {
              code: videoStream.error?.code,
              message: videoStream.error?.message,
              currentSrc: videoStream.currentSrc,
              readyState: videoStream.readyState,
              networkState: videoStream.networkState
            });
            alert('The video could not be loaded. Please check that the uploaded video is publicly accessible and in a supported format.');
          }
        });
      });

      const urlParams = new URLSearchParams(window.location.search);
      let activeMediaUrl = urlParams.get('mediaUrl') || urlParams.get('videoUrl');

      if (!activeMediaUrl) {
        try {
          const stored = localStorage.getItem('ACTIVE_AR_MEDIA');
          if (stored) {
            const parsed = JSON.parse(stored);
            activeMediaUrl = parsed.media_url || parsed.video_url;
          }
        } catch (e) {}
      }

      if (activeMediaUrl) {
        videoStream.setAttribute('src', activeMediaUrl);
        videoStream.load();
      }
    }

    const handleTargetFound = () => {
      setIsFound(true);
      if (videoStream && videoStream.getAttribute('src')) {
        videoStream.play().catch(e => console.log('Video play note:', e));
      }
    };

    const handleTargetLost = () => {
      setIsFound(false);
      if (videoStream) {
        videoStream.pause();
      }
    };

    if (targetEntity) {
      targetEntity.addEventListener('targetFound', handleTargetFound);
      targetEntity.addEventListener('targetLost', handleTargetLost);
    }

    // Cleanup listeners
    return () => {
      if (targetEntity) {
        targetEntity.removeEventListener('targetFound', handleTargetFound);
        targetEntity.removeEventListener('targetLost', handleTargetLost);
      }
    };
  }, [scriptsLoaded]);

  // 8 & 10. Start camera scanner
  const startCameraScanner = async () => {
    try {
      const sceneEl = document.getElementById('ar-scene');
      if (!sceneEl) return;
      
      // Wait for A-Frame's loaded event if necessary
      if (!sceneEl.hasLoaded) {
        await new Promise(resolve => sceneEl.addEventListener('loaded', resolve, { once: true }));
      }
      
      // Obtain the scene element system
      const arSystem = sceneEl.systems['mindar-image-system'];
      if (arSystem) {
        setIsStarted(true);
        await arSystem.start();
        console.log('MindAR Camera initialized successfully!');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera could not start. Please check browser camera permissions and use HTTPS.');
    }
  };

  const switchCamera = async () => {
    const sceneEl = document.getElementById('ar-scene');
    if (sceneEl && sceneEl.systems['mindar-image-system']) {
      sceneEl.systems['mindar-image-system'].switchCamera();
    }
  };

  const exitScanner = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Head>
        <title>LiveMemories WebAR Camera Scanner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --sat: env(safe-area-inset-top, 0px);
          --sab: env(safe-area-inset-bottom, 0px);
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          height: 100dvh;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: transparent !important;
          background: transparent !important;
          -webkit-tap-highlight-color: transparent;
        }

        .a-canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          background-color: transparent !important;
          background: transparent !important;
        }

        #ios-start-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: rgba(7, 10, 18, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: #fff;
        }

        .start-cam-btn {
          margin-top: 24px;
          padding: 18px 38px;
          border-radius: 40px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          border: none;
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.5);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          touch-action: manipulation;
        }

        #ar-hud-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 999;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: max(16px, var(--sat)) 16px max(24px, var(--sab)) 16px;
        }

        .hud-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .back-home-btn {
          pointer-events: auto;
          background: rgba(244, 63, 94, 0.85);
          backdrop-filter: blur(14px);
          border: none;
          color: #fff;
          padding: 10px 18px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(244, 63, 94, 0.4);
        }

        .status-pill {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 20px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
          flex-shrink: 0;
        }

        .status-dot.found {
          background: #10b981;
          box-shadow: 0 0 12px #10b981;
        }

        .camera-switch-btn {
          pointer-events: auto;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .scanner-reticle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(290px, 75vw);
          height: min(290px, 75vw);
          border: 2px solid rgba(16, 185, 129, 0.4);
          border-radius: 24px;
          pointer-events: none;
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.2);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scanner-reticle.found {
          border-color: #10b981;
          box-shadow: 0 0 50px rgba(16, 185, 129, 0.55);
          transform: translate(-50%, -50%) scale(1.04);
        }

        .corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border-color: #10b981;
          border-style: solid;
        }

        .tl { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-top-left-radius: 18px; }
        .tr { top: -2px; right: -2px; border-width: 4px 4px 0 0; border-top-right-radius: 18px; }
        .bl { bottom: -2px; left: -2px; border-width: 0 0 4px 4px; border-bottom-left-radius: 18px; }
        .br { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-bottom-right-radius: 18px; }

        .laser-line {
          position: absolute;
          left: 8px;
          right: 8px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #10b981, #9fdbcc, transparent);
          box-shadow: 0 0 14px #10b981;
          animation: scanAnim 2.2s ease-in-out infinite alternate;
        }

        @keyframes scanAnim {
          0% { top: 10%; opacity: 0.2; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0.2; }
        }

        #target-toast {
          position: absolute;
          bottom: max(30px, var(--sab));
          left: 50%;
          transform: translateX(-50%);
          background: rgba(16, 185, 129, 0.95);
          color: #fff;
          padding: 10px 22px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          backdrop-filter: blur(12px);
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.5);
          display: none;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          max-width: 90vw;
        }
      `}} />

      {!isStarted && (
        <div id="ios-start-overlay">
          <div style={{width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px'}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <h2 style={{fontSize: '24px', fontWeight: '800', marginBottom: '10px', fontFamily: 'serif'}}>LiveMemories AR Camera</h2>
          <p style={{color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', maxWidth: '340px'}}>
            Tap below to start your iPhone camera and scan physical photos to play videos.
          </p>
          <button id="start-ar-btn" className="start-cam-btn" onClick={startCameraScanner}>
            📷 Start iPhone Camera Scanner
          </button>
        </div>
      )}

      {isStarted && (
        <div id="ar-hud-overlay">
          <div className="hud-header">
            <button id="exit-scanner-btn" className="back-home-btn" onClick={exitScanner}>✕ Exit</button>

            <div className="status-pill">
              <div id="status-dot" className={`status-dot ${isFound ? 'found' : ''}`}></div>
              <span id="status-text">{isFound ? 'Photo Lock Acquired! [LiveMemories Playing]' : 'Scanning Photo Print...'}</span>
            </div>

            <button id="camera-flip-btn" className="camera-switch-btn" title="Flip Camera" onClick={switchCamera}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8h-3l4 4 4-4h-3c0-3.3 2.7-6 6-6s6 2.7 6 6h3z"/>
                <path d="M4 14c0 4.4 3.6 8 8 8s8-3.6 8-8h3l-4-4-4 4h3c0 3.3-2.7 6-6 6s-6-2.7-6-6h-3z"/>
              </svg>
            </button>
          </div>

          <div id="reticle" className={`scanner-reticle ${isFound ? 'found' : ''}`}>
            <div className="corner tl"></div>
            <div className="corner tr"></div>
            <div className="corner bl"></div>
            <div className="corner br"></div>
            {!isFound && <div id="laser" className="laser-line"></div>}
          </div>

          <div id="target-toast" style={{ display: isFound ? 'flex' : 'none' }}>
            <span>✨ LIVEMEMORIES MATCH — Playing Video</span>
          </div>
        </div>
      )}

      {scriptsLoaded && (
        <div dangerouslySetInnerHTML={{__html: `
          <a-scene 
            id="ar-scene"
            mindar-image="imageTargetSrc: /targets/targets.mind; autoStart: false; filterMinCF: 0.00001; filterBeta: 0.0001; missTolerance: 18; warmupTolerance: 3; uiScanning: #reticle; uiLoading: no;" 
            color-space="sRGB" 
            renderer="colorManagement: true, physicallyCorrectLights: true, alpha: true" 
            vr-mode-ui="enabled: false" 
            device-orientation-permission-ui="enabled: false"
          >
            <a-assets id="scene-assets">
              <video id="ar-video-stream" loop crossorigin="anonymous" playsinline webkit-playsinline muted></video>
            </a-assets>

            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            <a-entity id="target-entity-0" mindar-image-target="targetIndex: 0">
              <a-video id="ar-video-plane" src="#ar-video-stream" position="0 0 0.05" width="1" height="0.75" rotation="0 0 0"></a-video>

              <a-torus position="0 0 0.1" radius="0.48" radius-tubular="0.015" material="color: #10b981; metalness: 0.8; opacity: 0.85; transparent: true"
                       animation="property: rotation; to: 0 360 360; loop: true; dur: 6000; easing: linear">
              </a-torus>

              <a-octahedron position="0 0 0.2" radius="0.18" material="color: #9fdbcc; wireframe: true; wireframeLinewidth: 2"
                            animation="property: rotation; to: 360 360 0; loop: true; dur: 4000; easing: linear">
              </a-octahedron>

              <a-text id="ar-title-text" value="LIVEMEMORIES VIDEO ACTIVE" position="0 -0.65 0.1" align="center" width="2.2" color="#10b981"
                      font="kelsonsans"
                      animation="property: position; to: 0 -0.6 0.15; dir: alternate; loop: true; dur: 1500; easing: easeInOutSine">
              </a-text>

              <a-light type="point" color="#10b981" intensity="2.5" distance="3" position="0 0 0.5"></a-light>
            </a-entity>
          </a-scene>
        `}} />
      )}
    </>
  );
}
