import React from 'react';
import { Trophy, Medal, Award, Crown, Gem } from 'lucide-react';

export default function Leaderboard({ entries = [] }) {
  const RANK_ICONS = { 1: Trophy, 2: Medal, 3: Award };

  return (
    <div style={styles.wrapper}>
      <div style={styles.heading}>
        <Trophy size={16} color="var(--accent)" /> Friends Leaderboard
        <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:400 }}>
          {entries.length} player{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {entries.length === 0 && (
        <div style={{ textAlign:'center', padding:'32px', color:'var(--text-muted)', fontSize:'0.9rem' }}>
          Invite friends to see the leaderboard
        </div>
      )}

      {entries.map((entry, i) => {
        const RankIcon = RANK_ICONS[entry.rank];
        return (
          <div
            key={entry.id}
            style={{
              ...styles.row,
              background: entry.isSelf ? 'rgba(255,214,0,0.06)' : 'var(--bg-elevated)',
              borderColor: entry.isSelf ? 'var(--accent)30' : 'var(--border)',
              animationDelay: `${i * 50}ms`,
            }}
            className="animate-fade-in"
          >
            {/* Rank */}
            <div style={styles.rank}>
              {RankIcon ? (
                <RankIcon size={18} color={entry.rank <= 3 ? 'var(--accent)' : 'var(--text-muted)'} />
              ) : (
                <span style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--text-muted)', fontSize:'1rem' }}>
                  #{entry.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div style={{ ...styles.avatar, borderColor: entry.isSelf ? 'var(--accent)' : 'var(--border)' }}>
              {entry.name?.[0]?.toUpperCase() ?? '?'}
            </div>

            {/* Info */}
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', color:'var(--text-primary)' }}>
                {entry.name} {entry.isSelf && <span style={{ color:'var(--accent)', fontSize:'0.75rem' }}>· you</span>}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'2px', display:'flex', alignItems:'center', gap:'8px' }}>
                {entry.legendaryCount > 0 && (
                  <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <Crown size={12} color="var(--tier-legendary)" /> {entry.legendaryCount}
                  </span>
                )}
                {entry.ultraRareCount > 0 && (
                  <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <Gem size={12} color="var(--tier-ultra)" /> {entry.ultraRareCount}
                  </span>
                )}
                <span>{entry.totalPulls} unlocks</span>
              </div>
            </div>

            {/* Score */}
            <div style={styles.score}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', color: entry.rank <= 3 ? 'var(--accent)' : 'var(--text-primary)' }}>
                {entry.score.toLocaleString()}
              </div>
              <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textAlign:'right' }}>pts</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1rem',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    transition: 'all 0.2s',
  },
  rank: {
    width: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatar: {
    width: '36px', height: '36px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '0.95rem',
    color: 'var(--accent)',
    flexShrink: 0,
  },
  score: {
    textAlign: 'right',
    flexShrink: 0,
  },
};
