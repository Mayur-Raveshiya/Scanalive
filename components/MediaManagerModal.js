import React, { useState, useEffect } from 'react';
import { X, Upload, Video, Image as ImageIcon, Share2, Copy, Check, Sparkles, ExternalLink, Trash2, Film, Link as LinkIcon } from 'lucide-react';
import { uploadMediaToSupabase, saveMediaAssetRecord, isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { getMockMediaAssets, addMockMediaAsset } from '../lib/mockAuth';

export default function MediaManagerModal({ isOpen, onClose, user, onSelectMediaForAR }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'gallery'
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  const [targetIndex, setTargetIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [mediaAssets, setMediaAssets] = useState([]);
  const supabaseActive = isSupabaseConfigured();

  const loadMediaAssets = async () => {
    if (supabaseActive) {
      try {
        const { data, error } = await supabase
          .from('media_assets')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setMediaAssets(data);
        } else {
          setMediaAssets(getMockMediaAssets());
        }
      } catch (err) {
        setMediaAssets(getMockMediaAssets());
      }
    } else {
      setMediaAssets(getMockMediaAssets());
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMediaAssets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const isVid = selected.type.startsWith('video');
      if (isVid && !['video/mp4', 'video/webm'].includes(selected.type)) {
        setErrorMessage('Unsupported video format. Please select an MP4 or WEBM video.');
        return;
      }
      setErrorMessage('');
      setFile(selected);
      setMediaType(isVid ? 'video' : 'image');
      setFilePreview(URL.createObjectURL(selected));
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsUploading(true);

    let finalMediaUrl = customUrl;

    // Handle Supabase file upload if file is selected
    if (file) {
      if (supabaseActive) {
        const uploadRes = await uploadMediaToSupabase(file, user);
        if (uploadRes.error) {
          setErrorMessage(`Upload error: ${uploadRes.error}. (Make sure 'ar-media' bucket exists in Supabase Storage)`);
          setIsUploading(false);
          return;
        }
        finalMediaUrl = uploadRes.publicUrl;
      } else {
        // Demo mode fallback URL
        finalMediaUrl = filePreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
      }
    }

    if (!finalMediaUrl) {
      setErrorMessage('Please select a file to upload or enter a media URL.');
      setIsUploading(false);
      return;
    }

    const assetObj = {
      user_id: user?.id || 'demo_user',
      target_index: Number(targetIndex),
      title: title || 'Shared WebAR Overlay Asset',
      media_url: finalMediaUrl,
      media_type: mediaType
    };

    if (supabaseActive) {
      const saveRes = await saveMediaAssetRecord(assetObj);
      if (saveRes.error) {
        setErrorMessage(`Save error: ${saveRes.error.message}`);
      } else {
        setSuccessMessage('Media asset uploaded and linked successfully!');
        loadMediaAssets();
        setActiveTab('gallery');
      }
    } else {
      addMockMediaAsset(assetObj);
      setSuccessMessage('Media asset added! Shareable link generated.');
      loadMediaAssets();
      setActiveTab('gallery');
    }

    setIsUploading(false);
    setFile(null);
    setFilePreview('');
    setCustomUrl('');
    setTitle('');
  };

  const getShareableLink = (asset) => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/?mediaUrl=${encodeURIComponent(asset.media_url)}&mediaType=${asset.media_type}&title=${encodeURIComponent(asset.title)}`;
  };

  const handleCopyShareLink = (asset) => {
    const link = getShareableLink(asset);
    navigator.clipboard.writeText(link);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
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
      <div className="glass-panel" style={{
        maxWidth: '740px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.2) 100%)',
            border: '1px solid rgba(16,185,129,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)'
          }}>
            <Share2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              WebAR Photo & Video Storage & Sharing
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Upload media to Supabase Storage & generate shareable links for AR target prints
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
          <button 
            onClick={() => setActiveTab('upload')} 
            className={activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 18px', fontSize: '13px', minHeight: '38px' }}
          >
            <Upload size={14} /> Upload New Media
          </button>
          <button 
            onClick={() => setActiveTab('gallery')} 
            className={activeTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 18px', fontSize: '13px', minHeight: '38px' }}
          >
            <Film size={14} /> Shared Media Library ({mediaAssets.length})
          </button>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#fda4af'
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#6ee7b7'
          }}>
            {successMessage}
          </div>
        )}

        {/* TAB 1: UPLOAD FORM */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: '#fff', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                1. Select Video or Photo File to Upload
              </label>
              
              <div style={{
                border: '2px dashed rgba(0, 242, 254, 0.3)',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.5)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={handleFileChange} 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                
                {filePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {mediaType === 'video' ? (
                      <video src={filePreview} controls style={{ maxHeight: '160px', borderRadius: '10px' }} />
                    ) : (
                      <img src={filePreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '10px', objectFit: 'contain' }} />
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>Selected: {file?.name}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Upload size={32} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>Click or Drag Photo / Video file here</span>
                    <span style={{ fontSize: '12px' }}>Supports MP4, WEBM, PNG, JPG, GIF up to 50MB</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Media Asset Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. My Shared Event Video" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Attach to Physical Target Print</label>
                <select 
                  value={targetIndex} 
                  onChange={(e) => setTargetIndex(e.target.value)}
                  className="input-field"
                  style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#fff' }}
                >
                  <option value={0}>Target Print #1 (Default Target)</option>
                  <option value={1}>Target Print #2 (Secondary Target)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Or Paste Public Video / Photo Direct URL</label>
              <input 
                type="url" 
                placeholder="https://example.com/shared-video.mp4" 
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (e.target.value.includes('.mp4') || e.target.value.includes('.webm')) {
                    setMediaType('video');
                  }
                }}
                className="input-field" 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary btn-emerald" disabled={isUploading}>
                {isUploading ? 'Uploading to Supabase...' : 'Upload & Create Shareable Link'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SHARED MEDIA GALLERY */}
        {activeTab === 'gallery' && (
          <div>
            {mediaAssets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No media uploaded yet. Switch to the Upload tab to add photos or videos!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {mediaAssets.map((asset) => (
                  <div key={asset.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}>
                        {asset.media_type === 'video' ? (
                          <video src={asset.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={asset.media_url} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'var(--accent-cyan)',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {asset.media_type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                          {asset.media_type.toUpperCase()}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                        {asset.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Linked to: Target Print #{Number(asset.target_index) + 1}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleCopyShareLink(asset)}
                        className="btn-primary"
                        style={{ padding: '8px 14px', fontSize: '12px', flex: 1, minHeight: '36px' }}
                      >
                        {copiedId === asset.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === asset.id ? 'Copied Link!' : 'Copy Shareable Link'}
                      </button>

                      <button 
                        onClick={() => {
                          if (onSelectMediaForAR) onSelectMediaForAR(asset);
                          onClose();
                        }}
                        className="btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12px', minHeight: '36px' }}
                        title="View in WebAR Lens"
                      >
                        <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} /> Test AR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
