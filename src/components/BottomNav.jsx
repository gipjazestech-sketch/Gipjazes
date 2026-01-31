import React from 'react';
import { Home, Users, Plus, MessageSquare, User } from 'lucide-react';

const BottomNav = ({ activeTab, onChange }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 'var(--bottom-nav-height)',
      backgroundColor: '#000000',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <NavItem icon={Home} label="Home" active={activeTab === 'home'} onClick={() => onChange('home')} />
      <NavItem icon={Users} label="Friends" active={activeTab === 'friends'} onClick={() => onChange('friends')} />

      {/* Upload Button */}
      <div style={{
        position: 'relative',
        width: '45px',
        height: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
      }} onClick={() => onChange('upload')}>
        <div style={{
          position: 'absolute',
          left: '0px',
          width: '38px',
          height: '100%',
          background: 'cyan',
          borderRadius: '8px',
          opacity: 0.8
        }} />
        <div style={{
          position: 'absolute',
          right: '0px',
          width: '38px',
          height: '100%',
          background: 'red',
          borderRadius: '8px',
          opacity: 0.8
        }} />
        <div style={{
          position: 'relative',
          width: '38px',
          height: '30px',
          background: 'white',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2
        }}>
          <Plus color="black" size={20} strokeWidth={3} />
        </div>
      </div>

      <NavItem icon={MessageSquare} label="Inbox" badge={12} active={activeTab === 'inbox'} onClick={() => onChange('inbox')} />
      <NavItem icon={User} label="Me" active={activeTab === 'profile'} onClick={() => onChange('profile')} />
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: active ? 1 : 0.6,
    cursor: 'pointer',
    width: '20%', // Ensure equal click targets
    color: active ? 'white' : 'rgba(255,255,255,0.6)'
  }}>
    <div style={{ position: 'relative' }}>
      <Icon size={24} strokeWidth={active ? 3 : 2} />
      {badge && (
        <div style={{
          position: 'absolute',
          top: -5,
          right: -8,
          background: 'red',
          color: 'white',
          fontSize: '10px',
          padding: '2px 4px',
          borderRadius: '10px',
          fontWeight: 'bold'
        }}>{badge}</div>
      )}
    </div>
    <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

export default BottomNav;
