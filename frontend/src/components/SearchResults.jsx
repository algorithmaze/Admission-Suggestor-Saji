import React, { useMemo } from 'react';
import ResultCard from './ResultCard';

const SearchResults = ({ results, onApply }) => {
    if (!results || results.length === 0) return null;

    // Split results into Top 3 and Rest
    const topPicks = results.slice(0, 3);
    const rest = results.slice(3);

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            {/* TOP 3 SECTION */}
            <div style={{ marginBottom: '4rem' }}>
                <h3 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '2rem' }}>
                    <span style={{
                        background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        🌟 Top 3 Recommendations
                    </span>
                </h3>

                <div className="results-grid" style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {topPicks.map((result, index) => (
                        <ResultCard
                            key={`top-${index}`}
                            result={result}
                            onApply={onApply}
                            isTopChoice={true}
                        />
                    ))}
                </div>
            </div>

            {/* REMAINING SECTION */}
            {rest.length > 0 && (
                <div>
                    <h4 style={{
                        fontSize: '1.5rem',
                        color: 'var(--text-main)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontWeight: '600'
                    }}>
                        📋 More Excellent Options
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    </h4>

                    <div className="results-grid">
                        {rest.map((result, index) => (
                            <ResultCard
                                key={`rest-${index}`}
                                result={result}
                                onApply={onApply}
                                isTopChoice={false}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
