import React from 'react';
import { Mail, Smartphone, CreditCard, MapPin, Lock, Check } from 'lucide-react';

const QUESTS = [
  { id: 'emailVerified',    label: 'Verify Your Email',    icon: Mail, stars: 1 },
  { id: 'phoneVerified',    label: 'Add Your Phone',       icon: Smartphone, stars: 1 },
  { id: 'idUploaded',       label: 'Scan Your ID Card',    icon: CreditCard, stars: 2 },
  { id: 'addressConfirmed', label: 'Confirm Your Address', icon: MapPin, stars: 1 },
  { id: 'pinSet',           label: 'Set Your PIN',         icon: Lock, stars: 1 },
];

export default function QuestChecklist({ questProgress = {}, onComplete, loading }) {
  const completed = QUESTS.filter((q) => questProgress[q.id]).length;
  const total = QUESTS.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Your Quests</div>
          <div style={styles.subtitle}>{percent}% complete — you're almost there</div>
        </div>
        <div style={styles.percentBig}>{percent}%</div>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ marginBottom:'20px' }}>
        <div className="progress-fill" style={{ width:`${percent}%` }} />
      </div>

      {/* Quest list */}
      <div style={styles.list}>
        {QUESTS.map((q, i) => {
          const done = !!questProgress[q.id];
          const Icon = q.icon;
          return (
            <div
              key={q.id}
              style={{
                ...styles.questItem,
                opacity: done ? 1 : 0.9,
                borderColor: done ? 'var(--accent)30' : 'var(--border)',
                background: done ? 'rgba(255,214,0,0.04)' : 'var(--bg-elevated)',
                animationDelay: `${i * 60}ms`,
              }}
              className="animate-fade-in"
            >
              <div style={{ ...styles.questIcon, color: done ? 'var(--accent)' : 'var(--text-muted)' }}>
                {done ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ ...styles.questLabel, color: done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {q.label}
                </div>
                <div style={styles.questStar}>+{q.stars} star{q.stars > 1 ? 's' : ''}</div>
              </div>
              {!done && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ minWidth:'80px', fontSize:'0.78rem' }}
                  onClick={() => onComplete?.(q.id)}
                  disabled={loading}
                >
                  {loading ? '...' : 'Complete'}
                </button>
              )}
              {done && (
                <div style={{ color:'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem' }}>
                  Done
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  percentBig: {
    fontFamily: 'var(--font-display)',
    fontWeight: 900,
    fontSize: '2rem',
    color: 'var(--accent)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  questItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    transition: 'all 0.25s',
  },
  questIcon: {
    width: '32px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  questStar: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
};
