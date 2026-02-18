import React from 'react';

const FeaturesSection = () => {
    const features = [
        {
            icon: "🎯",
            title: "Precision Matching",
            desc: "Our advanced algorithm analyzes your 10th/12th marks and career goals to find the colleges where you have the highest probability of admission.",
            color: "var(--primary-color)"
        },
        {
            icon: "📋",
            title: "Smart Applications",
            desc: "Apply to multiple colleges instantly. Track every application with a unique Reference ID and receive instant email confirmations.",
            color: "#10b981"
        },
        {
            icon: "💰",
            title: "Fee Transparency",
            desc: "View estimated fee structures for Merit and Management quotas upfront, helping you plan your education budget effectively.",
            color: "#f59e0b"
        },
        {
            icon: "🤖",
            title: "24/7 AI Counselor",
            desc: "Have doubts? Our AI Admission Assistant is always online to answer questions about courses, eligibility, and campus life.",
            color: "#8b5cf6"
        }
    ];

    return (
        <section id="features" style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '20%', left: '-5%', width: '300px', height: '300px', background: 'var(--primary-light)', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1, opacity: 0.6 }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '250px', height: '250px', background: 'var(--secondary-light)', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1, opacity: 0.6 }}></div>

            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>Why Choose Us?</span>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        Everything you need for your <span className="text-gradient">Best Future</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        We simplify the chaotic admission process into a smooth, guided experience.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                padding: '2.5rem',
                                textAlign: 'left',
                                transition: 'all 0.3s ease',
                                borderTop: `4px solid ${f.color}`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: `color-mix(in srgb, ${f.color} 10%, white)`,
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                marginBottom: '1.5rem',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                {f.title}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
