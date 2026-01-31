import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Upload as UploadIcon, X, Music, Check } from 'lucide-react';

const Upload = ({ onCancel, onUploadSuccess }) => {
    const { uploadVideo } = useApp();
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handlePost = async () => {
        if (!file) return;
        setIsUploading(true);

        const success = await uploadVideo(file, caption);

        setIsUploading(false);

        if (success) {
            onUploadSuccess();
        } else {
            alert('Upload failed. Please try again.');
        }
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'black', zIndex: 200, display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', borderBottom: '1px solid #333'
            }}>
                <X size={24} onClick={onCancel} style={{ cursor: 'pointer' }} />
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Post</span>
                {!file ? <div style={{ width: 24 }} /> : (
                    <Check size={24} color="#FE2C55" onClick={handlePost} style={{ cursor: 'pointer' }} />
                )}
            </div>

            {/* Content */}
            {!file ? (
                <div style={{
                    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px'
                }}>
                    <div
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            padding: '40px', border: '2px dashed #444', borderRadius: '12px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', backgroundColor: '#111'
                        }}
                    >
                        <UploadIcon size={40} color="#888" />
                        <span style={{ color: '#888', fontWeight: '600' }}>Select video to upload</span>
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>MP4 or WebM</span>
                    </div>
                    <input
                        type="file"
                        accept="video/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Preview Area */}
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#111' }}>
                        <video
                            src={previewUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            autoPlay
                            loop
                            muted
                        />
                        <div style={{
                            position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                            backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <Music size={16} />
                                <span style={{ fontSize: '0.9rem' }}>Original Sound</span>
                            </div>
                            <input
                                placeholder="Describe your post... #hashtags"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                style={{
                                    width: '100%', background: 'transparent', border: 'none', color: 'white',
                                    fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Post Button Area for easier access */}
                    <div style={{ padding: '20px' }}>
                        <button
                            onClick={handlePost}
                            disabled={isUploading}
                            style={{
                                width: '100%', padding: '15px',
                                backgroundColor: isUploading ? '#555' : '#FE2C55',
                                color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold'
                            }}
                        >
                            {isUploading ? 'Posting...' : 'Post'}
                        </button>
                        <button
                            onClick={() => setFile(null)}
                            style={{
                                width: '100%', padding: '15px', marginTop: '10px',
                                backgroundColor: 'transparent', color: '#888', border: 'none'
                            }}
                        >
                            Discard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
