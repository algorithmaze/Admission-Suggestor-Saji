import React from 'react';

const Footer = () => {
    return (
        <footer className="footer" style={{
            marginTop: '6rem',
            padding: '2rem 0',
            textAlign: 'center',
            fontSize: '0.9rem',
            width: '100%',
            position: 'relative'
        }}>
            <div className="container">
                <p>
                    &copy; {new Date().getFullYear()} <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>AdmissionSuggester</span>. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
