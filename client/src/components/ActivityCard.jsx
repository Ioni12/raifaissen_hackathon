import React, { useState } from 'react';
import api from '../api/client';
import { Trophy, Gem, Hexagon, Square } from 'lucide-react';

const TIER_STYLES = {
  common:     { color: 'var(--tier-common)',    label: 'Common',    icon: Square },
  rare:       { color: 'var(--tier-rare)',      label: 'Rare',      icon: Hexagon },
  ultra_rare: { color: 'var(--tier-ultra)',     label: 'Ultra Rare', icon: Gem },
  legendary:  { color: 'var(--tier-legendary)', label: 'Legendary', icon: Trophy },
};

const TYPE_LABELS = {
  pull:               (p) => `unlocked ${p.tier?.replace('_',' ')} — ${p.rewardLabel}`,
  badge:              (p) => `earned the ${p.badgeLabel} badge`,
  quest_complete:     (p) => `completed quest: ${p.questLabel}`,
  onboarding_complete:(p) => `completed onboarding`,
  streak:             (p) => `${p.streakDays}-day streak`,
  referral:           (p) => `invited ${p.referredName} to Raiffeisen Youth`,
};

const TIME_AGO = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

export default function ActivityCard({ activity, onReact }) {
  const [reacting, setReacting] = useState(false);
  const { userId: user, type, payload, reactionCounts = {}, myReaction, isSelf } = activity;
  const tier = payload?.tier;
  const tierStyle = TIER_STYLES[tier] || null;
  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  const handleReact = async (reaction) => {
    if (reacting || isSelf) return;
    setReacting(true);
    try {
      const res = await api.post('/social/react', { activityId: activity._id, reaction });
      onReact?.(activity._id, res.data);
    } finally {
      setReacting(false);
    }
  };

  const reactions = ['👍', '🎉', '⭐'];

  return (
    <div style={{
      ...styles.card,
      borderColor: tierStyle ? tierStyle.color + '30' : 'var(--border)',
      background: tierStyle ? tierStyle.color + '08' : 'var(--bg-card)',
    }}>
      {/* User info */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div style={{ flex:1 }}>
          <div style={styles.userName}>
            {user?.name ?? 'Someone'}
            {isSelf && <span style={styles.selfTag}> · you</span>}
          </div>
          <div style={styles.timestamp}>{TIME_AGO(activity.createdAt)}</div>
        </div>
        {tierStyle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <tierStyle.icon size={14} color={tierStyle.color} />
            <span style={{ ...styles.tierLabel, color: tierStyle.color }}>
              {tierStyle.label}
            </span>
          </div>
        )}
      </div>

      {/* Activity text */}
      <div style={styles.body}>
        <span style={{ color:'var(--text-primary)', fontWeight:500 }}>
          {user?.name?.split(' ')[0] ?? 'Someone'}
        </span>{' '}
        <span style={{ color:'var(--text-secondary)' }}>
          {TYPE_LABELS[type]?.(payload) ?? type}
        </span>
      </div>

      {/* Unlock highlight */}
      {type === 'pull' && tier && (
        <div style={{ ...styles.unlockHighlight, borderColor: tierStyle.color + '30' }}>
          <tierStyle.icon size={24} color={tierStyle.color} />
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', color:'var(--text-primary)' }}>
              {payload.rewardLabel}
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>New unlock</div>
          </div>
        </div>
      )}

      {/* Reactions row */}
      <div style={styles.reactRow}>
        {!isSelf && reactions.map((reaction) => (
          <button
            key={reaction}
            style={{
              ...styles.reactBtn,
              background: myReaction === reaction ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              borderColor: myReaction === reaction ? 'var(--accent)50' : 'var(--border)',
              transform: myReaction === reaction ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={() => handleReact(reaction)}
            disabled={reacting}
          >
            {reaction}
            {reactionCounts[reaction] ? (
              <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginLeft:'2px' }}>{reactionCounts[reaction]}</span>
            ) : null}
          </button>
        ))}
        {isSelf && totalReactions > 0 && (
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
            {totalReactions} reaction{totalReactions > 1 ? 's' : ''}
          </div>
        )}
        {isSelf && totalReactions === 0 && (
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>No reactions yet</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid',
    borderRadius: 'var(--radius-lg)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'border-color 0.2s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--accent)',
    flexShrink: 0,
  },
  userName: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  selfTag: {
    color: 'var(--text-muted)',
    fontWeight: 400,
  },
  timestamp: {
    fontSize: '0.73rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  tierLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '0.72rem',
    textTransform: 'capitalize',
  },
  body: {
    fontSize: '0.92rem',
    lineHeight: 1.5,
  },
  unlockHighlight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    background: 'var(--bg-elevated)',
  },
  reactRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reactBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid',
    borderRadius: 'var(--radius-full)',
    padding: '4px 12px',
    fontSize: '1rem',
    cursor: 'pointer',
    background: 'var(--bg-elevated)',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
  },
};
