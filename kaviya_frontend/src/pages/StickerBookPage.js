import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import rewardsService from '../api/services/rewardsService';

/**
 * PUBLIC_INTERFACE
 * Rewards page shows pet stage and sticker inventory from backend.
 */
export default function StickerBookPage() {
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.userId || 'me';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr('');
    rewardsService
      .getRewards(userId)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e) => setErr(e?.message || 'Failed to load rewards'))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#1E3A8A' }}>Rewards</h2>
      {loading && <p>Loading...</p>}
      {err && <p style={{ color: '#DC2626' }}>{err}</p>}
      {!loading && !err && (
        <>
          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ marginTop: 0, color: '#6B7280' }}>Pet Stage</h4>
            <p>{data?.petStage || 'Hatchling'}</p>
          </div>
          <div style={{ marginTop: 12, background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ marginTop: 0, color: '#6B7280' }}>Stickers</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(data?.stickers || []).map((s, idx) => (
                <span key={idx} style={{ padding: '6px 10px', background: '#F59E0B', color: '#fff', borderRadius: 8 }}>
                  {s?.name || s}
                </span>
              ))}
              {(!data?.stickers || data.stickers.length === 0) && <p>No stickers yet</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
