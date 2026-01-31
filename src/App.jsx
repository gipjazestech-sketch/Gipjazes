import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import VideoFeed from './components/VideoFeed';
import BottomNav from './components/BottomNav';
import Profile from './components/Profile';
import Upload from './pages/Upload';
import Login from './pages/Login';
import { Search, Tv } from 'lucide-react';

// Separate core app logic to use context hook
const FlowStreamApp = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('foryou');
  const [currentView, setCurrentView] = useState('home');
  const [showUpload, setShowUpload] = useState(false);

  const [viewParams, setViewParams] = useState({});

  const handleNavChange = (view) => {
    if (view === 'upload') {
      if (!currentUser) {
        setCurrentView('profile'); // Will show login
        setViewParams({});
      } else {
        setShowUpload(true);
      }
    } else {
      setCurrentView(view);
      setViewParams({});
    }
  };

  const navigateToProfile = (username) => {
    setViewParams({ username });
    setCurrentView('profile');
  };

  if (showUpload) {
    return (
      <Upload
        onCancel={() => setShowUpload(false)}
        onUploadSuccess={() => {
          setShowUpload(false);
          setCurrentView('home');
        }}
      />
    );
  }

  // Determine what to render based on currentView
  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <Profile
          username={viewParams.username}
          onBack={viewParams.username ? () => setCurrentView('home') : null}
        />;
      case 'inbox':
        // Reuse login for inbox placeholder for now if not logged in
        if (!currentUser) return <Login onSuccess={() => { }} />;
        return <div className="flex-center full-size">Inbox (Coming Soon)</div>;
      case 'friends':
        if (!currentUser) return <Login onSuccess={() => { }} />;
        return <div className="flex-center full-size">Friends Feed (Coming Soon)</div>;
      case 'home':
      default:
        return <VideoFeed
          onProfileClick={navigateToProfile}
          filterType={activeTab}
        />;
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: 'black'
    }}>
      {/* Top Navigation Overlay - Only show on Home view */}
      {currentView === 'home' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          padding: '10px 20px',
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 50,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
          pointerEvents: 'none'
        }}>
          <div style={{ opacity: 0.8, pointerEvents: 'auto' }}><Tv color="white" size={24} /></div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '1.1rem', fontWeight: '600', pointerEvents: 'auto' }}>
            <span
              style={{ opacity: activeTab === 'following' ? 1 : 0.6, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              onClick={() => setActiveTab('following')}
            >
              Following
            </span>
            <span
              style={{ opacity: activeTab === 'foryou' ? 1 : 0.6, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              onClick={() => setActiveTab('foryou')}
            >
              For You
            </span>
          </div>

          <div style={{ opacity: 0.8, pointerEvents: 'auto' }}><Search color="white" size={24} /></div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{
        width: '100%',
        height: '100%',
        paddingBottom: 'var(--bottom-nav-height)'
      }}>
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={currentView} onChange={handleNavChange} />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <FlowStreamApp />
    </AppProvider>
  );
}

export default App;
