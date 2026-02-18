import React from 'react';

const HeroSection = () => {
    return (
        <section style={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            paddingTop: '2rem',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-off-white)'
        }}>
            {/* Background Glows - Professional Blue/Green */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '20%',
                width: '400px',
                height: '400px',
                background: 'rgba(37, 99, 235, 0.05)', /* Primary Blue very subtle */
                filter: 'blur(80px)',
                borderRadius: '50%'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '15%',
                width: '500px',
                height: '500px',
                background: 'rgba(16, 185, 129, 0.05)', /* Secondary Green very subtle */
                filter: 'blur(100px)',
                borderRadius: '50%'
            }}></div>

            <div className="container" style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                <div className="animate-fade-in">
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: 'rgba(37, 99, 235, 0.1)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        borderRadius: '50px',
                        color: 'var(--primary-color)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem'
                    }}>
                        ✨ AI-Powered Admission Guidance
                    </span>

                    <h1 style={{
                        fontSize: 'clamp(3rem, 5vw, 5.5rem)',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        lineHeight: '1.1',
                        letterSpacing: '-0.02em',
                        color: 'var(--text-main)'
                    }}>
                        Find Your Perfect <br />
                        <span className="text-gradient">College Match</span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem',
                        lineHeight: '1.6'
                    }}>
                        Use our intelligent system to discover the best engineering and arts colleges based on your marks, interests, and career goals.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => document.getElementById('predictor-section').scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-primary"
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                        >
                            Start Predicting 🚀
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
