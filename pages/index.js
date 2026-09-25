import { useState, useEffect } from 'react';
import TargetShowcaseModal from '../components/TargetShowcaseModal';
import { optimizeTargetPhotoForAR } from '../lib/imageContrastOptimizer';
import { getGlobalARPairings, registerGlobalARPairing, removeGlobalARPairing } from '../lib/arRegistry';
import { 
  Camera, Sparkles, Upload, Video, Image as ImageIcon, Copy, Check, 
  Share2, ArrowRight, Play, RefreshCw, Layers, ShieldCheck, Sun, Zap,
  BookOpen, Heart, Palette, Gift, CheckCircle, ChevronRight, Smartphone, Eye, Trash2, Users 
} from 'lucide-react';

export default function LiveMemoriesApp() {
  const [targetImage, setTargetImage] = useState(null);
  const [targetImagePreview, setTargetImagePreview] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const [globalCatalog, setGlobalCatalog] = useState([]);
  const [showTargetShowcase, setShowTargetShowcase] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewingVideo, setPreviewingVideo] = useState(null);

  const loadCatalog = async () => {
    const pairings = await getGlobalARPairings();
    setGlobalCatalog(pairings);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleTargetPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsOptimizing(true);
      setTargetImage(file);
      const optimized = await optimizeTargetPhotoForAR(file);
      setTargetImagePreview(optimized.previewUrl || URL.createObjectURL(file));
      setIsOptimizing(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['video/mp4', 'video/webm'].includes(file.type)) {
        alert('Unsupported video format. Please select an MP4 or WEBM video.');
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setCustomVideoUrl(url);
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const openCameraScanner = (mediaObj = null) => {
    let videoUrlToUse = mediaObj?.video_url || mediaObj?.media_url || videoPreview || customVideoUrl || '';
    let titleToUse = mediaObj?.title || customTitle || 'LiveMemories Video Overlay';

    if (typeof window !== 'undefined') {
      if (videoUrlToUse) {
        localStorage.setItem('ACTIVE_AR_MEDIA', JSON.stringify({
          media_url: videoUrlToUse,
          media_type: 'video',
          title: titleToUse
        }));
      }

      window.location.href = `/ar-lens-engine${videoUrlToUse ? `?videoUrl=${encodeURIComponent(videoUrlToUse)}&title=${encodeURIComponent(titleToUse)}` : ''}`;
    }
  };

  const handleRegisterAndLaunchAR = async () => {
    const finalVideoUrl = videoPreview || customVideoUrl || '';
    const finalPhotoUrl = targetImagePreview || '/targets/sample-target-1.png';
    const finalTitle = customTitle || 'LiveMemories Video Overlay';

    const newPair = {
      photoUrl: finalPhotoUrl,
      videoUrl: finalVideoUrl,
      title: finalTitle
    };

    const updatedCatalog = await registerGlobalARPairing(newPair);
    setGlobalCatalog(updatedCatalog);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      openCameraScanner(newPair);
    }, 600);
  };

  const handleDeletePair = async (pairId) => {
    if (window.confirm("Are you sure you want to delete this Photo & Video pair from the catalog?")) {
      const updated = await removeGlobalARPairing(pairId);
      setGlobalCatalog(updated);
    }
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* LIVEMEMORIES HEADER NAVBAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        background: 'rgba(7, 10, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--shadow-glow-emerald)'
            }}>
              <Camera size={22} />
            </div>
            <div>
              <span className="font-serif text-gradient" style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                LiveMemories
              </span>
              <span style={{ fontSize: '11px', color: 'var(--accent-mint)', display: 'block', fontWeight: '600', marginTop: '-2px' }}>
                Augmented Reality Print Studio
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => openCameraScanner()}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '14px' }}
            >
              <Camera size={18} /> Open Camera Scanner
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section style={{ padding: '60px 24px 40px 24px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-mint)', letterSpacing: '0.05em' }}>
            NO QR CODES REQUIRED • IPHONE SAFARI COMPATIBLE
          </span>
        </div>

        <h1 className="font-serif text-gradient" style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px' }}>
          Bring Your Printed Memories & Artwork to Life
        </h1>

        <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '720px', margin: '0 auto 32px auto' }}>
          Scan any printed photo, magazine, album, or poster with your smartphone camera to reveal hidden videos, animations, and sound.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => openCameraScanner()}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '16px' }}
          >
            <Camera size={22} /> Scan Photo Print Now
          </button>

          <a 
            href="#create-studio" 
            className="btn-secondary"
            style={{ padding: '16px 28px', fontSize: '15px' }}
          >
            <Upload size={18} /> Create Your LiveMemories
          </a>
        </div>
      </section>

      {/* STUDIO OPTIONS CONTAINER */}
      <section id="create-studio" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '28px', marginBottom: '48px' }}>
          
          {/* OPTION 1: SCAN PRINTED PHOTO */}
          <div className="glass-panel glass-panel-interactive" style={{
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 0 35px rgba(16, 185, 129, 0.12)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)'
                }}>
                  <Smartphone size={26} />
                </div>

                <span className="pulse-badge">
                  <Zap size={12} /> iPhone & Android Compatible
                </span>
              </div>

              <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
                1. Scan Printed Photo
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '24px' }}>
                Tap below to open your phone camera. Point your camera at any printed photo or sample target card to reveal the augmented video overlay instantly!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => openCameraScanner()}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              >
                <Camera size={20} /> Launch iPhone Camera Scanner
              </button>

              <button 
                onClick={() => setShowTargetShowcase(true)}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ImageIcon size={16} /> Printable Sample Target Cards
              </button>
            </div>
          </div>

          {/* OPTION 2: PAIR PHOTO & VIDEO */}
          <div className="glass-panel glass-panel-interactive" style={{
            padding: '36px',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            boxShadow: '0 0 35px rgba(0, 242, 254, 0.12)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'rgba(0, 242, 254, 0.15)',
                border: '1px solid rgba(0, 242, 254, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}>
                <Upload size={26} />
              </div>

              <span className="pulse-badge" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.35)' }}>
                <Sun size={12} /> Flares & Blur Enhanced
              </span>
            </div>

            <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
              2. Upload Photo & Video Pair
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '20px' }}>
              Upload your <strong>Target Photo</strong> and attach the <strong>Video</strong> that plays when scanned.
            </p>

            {/* Photo Input */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                  📸 TARGET PHOTO (Picture to scan)
                </label>
                {isOptimizing && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={11} className="spin-anim" /> Sharpening contrast...
                  </span>
                )}
              </div>

              <div style={{
                border: '1.5px dashed rgba(0, 242, 254, 0.4)',
                borderRadius: '14px',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <input type="file" accept="image/*" onChange={handleTargetPhotoChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                {targetImagePreview ? (
                  <img src={targetImagePreview} alt="Target" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <ImageIcon size={20} />
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    {targetImage ? targetImage.name : 'Select or Drop Target Photo'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auto-enhanced for glare & blur</div>
                </div>
              </div>
            </div>

            {/* Video Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                🎬 OVERLAY VIDEO (Video to play when scanned)
              </label>
              <div style={{
                border: '1.5px dashed rgba(16, 185, 129, 0.4)',
                borderRadius: '14px',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <input type="file" accept="video/*" onChange={handleVideoChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                {videoPreview ? (
                  <video src={videoPreview} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Video size={20} />
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    {videoFile ? videoFile.name : 'Select or Drop Video File'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MP4, WEBM video file</div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleRegisterAndLaunchAR}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
            >
              {saveSuccess ? <Check size={18} /> : <Play size={18} />}
              {saveSuccess ? 'Saved! Launching Scanner...' : 'Save Pair & Open Scanner'}
            </button>
          </div>
        </div>

        {/* COMMUNITY & CREATED PHOTO-VIDEO GALLERY */}
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Users size={22} style={{ color: 'var(--accent-emerald)' }} />
                <h3 className="font-serif" style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
                  Community & Created Photo-Video Frames ({globalCatalog.length})
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Anyone visiting the site can scan these target photos to reveal their augmented video overlays!
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {globalCatalog.map((item, idx) => (
              <div key={item.id || idx} className="glass-panel" style={{
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}>
                <div>
                  {/* Photo Target & Video Thumbnails side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    
                    {/* Target Photo */}
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3', background: '#000', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                      <img 
                        src={item.photo_url || '/targets/sample-target-1.png'} 
                        alt="Target Photo" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', fontWeight: '700', background: 'rgba(0,0,0,0.75)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px' }}>
                        TARGET PHOTO
                      </span>
                    </div>

                    {/* Overlay Video */}
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3', background: '#000', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <video 
                        src={item.video_url || item.media_url} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button 
                        onClick={() => setPreviewingVideo(item)}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Preview Video"
                      >
                        <Play size={24} style={{ fill: '#fff' }} />
                      </button>
                      <span style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', fontWeight: '700', background: 'rgba(0,0,0,0.75)', color: 'var(--accent-emerald)', padding: '2px 6px', borderRadius: '4px' }}>
                        VIDEO OVERLAY
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                        {item.title || item.target_name}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Created by: <span style={{ color: 'var(--accent-mint)' }}>{item.creator || 'Community User'}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeletePair(item.id)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#fda4af',
                        borderRadius: '8px',
                        padding: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete Frame Pair"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => openCameraScanner(item)}
                    className="btn-primary"
                    style={{ padding: '10px 16px', fontSize: '13px', flex: 1 }}
                  >
                    <Camera size={15} /> Scan This Photo
                  </button>

                  <button 
                    onClick={() => setPreviewingVideo(item)}
                    className="btn-secondary"
                    style={{ padding: '10px 14px', fontSize: '13px' }}
                    title="Watch Video Preview"
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW LIVEMEMORIES WORKS */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="font-serif text-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              How LiveMemories Works in 3 Easy Steps
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No QR codes on your prints. Pure image recognition technology.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-emerald)', marginBottom: '12px' }}>01</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Upload Target Photo</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Select any photo, picture, or artwork you want to print or display on wall frames, albums, or books.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-cyan)', marginBottom: '12px' }}>02</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Attach Overlay Video</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Attach a video memory, animation, or audio recording that will reveal itself when the photo is scanned.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-mint)', marginBottom: '12px' }}>03</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Scan & Watch It Come Alive</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Point your iPhone or Android camera at the photo print. The video streams seamlessly over the print in 3D WebAR!
              </p>
            </div>
          </div>
        </div>

        {/* USE CASES GRID */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="font-serif text-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              Endless Possibilities for Your Prints
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <Heart size={24} style={{ color: 'var(--accent-emerald)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Wedding & Photo Albums</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bring static wedding photo books to life with full HD video memories.</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <BookOpen size={24} style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Magazines & Books</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enhance print publications with interactive video demonstrations.</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <Palette size={24} style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Art & Gallery Prints</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reveal behind-the-scenes creation videos over gallery artwork prints.</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <Gift size={24} style={{ color: 'var(--accent-amber)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Greeting Cards & Gifts</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send personalized video messages embedded inside printed cards.</p>
            </div>
          </div>
        </div>

        {/* Video Preview Modal */}
        {previewingVideo && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(7, 10, 18, 0.85)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '24px', position: 'relative' }}>
              <button onClick={() => setPreviewingVideo(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>{previewingVideo.title}</h3>
              <video src={previewingVideo.video_url || previewingVideo.media_url} controls autoPlay style={{ width: '100%', borderRadius: '12px', maxHeight: '360px' }} />
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => openCameraScanner(previewingVideo)} className="btn-primary">
                  <Camera size={16} /> Scan Target Photo
                </button>
              </div>
            </div>
          </div>
        )}

        <TargetShowcaseModal 
          isOpen={showTargetShowcase} 
          onClose={() => setShowTargetShowcase(false)} 
          onOpenScanner={() => openCameraScanner()}
        />
      </section>
    </div>
  );
}
