import React from 'react';

const ResultCard = ({ result, onApply, isTopChoice }) => {
    return (
        <div className="glass-card animate-fade-in" style={{
            padding: '1.5rem',
            position: 'relative',
            border: isTopChoice ? '2px solid var(--secondary-color)' : '1px solid var(--border-color)',
            boxShadow: isTopChoice ? '0 10px 25px -5px rgba(16, 185, 129, 0.15)' : 'var(--shadow-md)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {isTopChoice && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'var(--gradient-success)',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    padding: '0.35rem 1rem',
                    borderRadius: '999px',
                    zIndex: 10,
                    boxShadow: 'var(--shadow-md)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                }}>
                    🏆 Top Choice
                </div>
            )}

            <div style={{ paddingRight: isTopChoice ? '140px' : '0' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.3 }}>
                    {result.college_name}
                </h4>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                    {result.course_name}
                </h3>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
                <span className="tag">{result.match_reason}</span>
            </div>

            <div style={{
                padding: '1rem',
                background: 'var(--bg-off-white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Annual Tuition</span>
                <div className="fee-badge">
                    ₹{result.fees ? result.fees.toLocaleString() : 'N/A'}
                </div>
            </div>

            {result.ai_analysis && (
                <div style={{
                    margin: '1.25rem 0',
                    padding: '1rem',
                    background: 'rgba(37, 99, 235, 0.04)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(37, 99, 235, 0.08)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    color: 'var(--text-main)'
                }}>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                        <span style={{ fontSize: '1.1rem' }}>✨</span> AI Insight
                    </div>
                    {result.ai_analysis}
                </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span>📍</span>
                    <span style={{ opacity: 0.9 }}>{result.address || 'Location N/A'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span>📞</span>
                    <span style={{ opacity: 0.9 }}>{result.contact || 'No Contact Info'}</span>
                </div>
            </div>

            <button
                onClick={() => onApply(result)}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', width: '100%' }}
            >
                Apply Now →
            </button>
        </div>
    );
};

export default ResultCard;
