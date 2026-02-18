import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Handle scroll on navigation (e.g. back from results page)
    useEffect(() => {
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            // Clear state to prevent scrolling on refresh? Native history handles this well usually.
        }
    }, [location]);

    const handleNavigation = (id) => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: id } });
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const goHome = () => {
        if (location.pathname !== '/') {
            navigate('/');
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            width: '100%',
            padding: '0.75rem 0'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 2rem',
                borderRadius: '100px',
                marginTop: '1.5rem',
                background: '#000000', // Solid Black
                color: '#ffffff', // White Text
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}>
                {/* Logo */}
                <div
                    onClick={goHome}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--gradient-primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        🎓
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.5px', color: 'white' }}>
                        Admission<span style={{ color: 'var(--secondary-color)' }}>Suggester</span>
                    </span>
                </div>

                {/* Desktop Menu */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button
                        onClick={goHome}
                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', opacity: 0.9 }}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => handleNavigation('features')}
                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', opacity: 0.9 }}
                    >
                        Features
                    </button>
                    <button
                        onClick={() => handleNavigation('predictor-section')}
                        className="btn-primary"
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem', borderRadius: '50px' }}
                    >
                        Find Colleges
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
