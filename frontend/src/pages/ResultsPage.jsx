import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchResults from '../components/SearchResults';
import Footer from '../components/Footer';
import ApplicationForm from '../components/ApplicationForm';
import confetti from 'canvas-confetti';

import { endpoints } from '../config';

const ResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const results = location.state?.results || [];

    const [selectedCollege, setSelectedCollege] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState(null); // 'submitting', 'success', 'error'
    const [serverMessage, setServerMessage] = useState("");
    const [referenceId, setReferenceId] = useState(null);

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleApply = (college) => {
        setSelectedCollege(college);
        setSubmissionStatus(null);
        setServerMessage("");
        setReferenceId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleApplicationSubmit = async (applicationData) => {
        setSubmissionStatus('submitting');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to show loader

        try {
            const response = await fetch(endpoints.submitApplication, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData),
            });

            const data = await response.json();

            if (response.ok) {
                // Simulate a "Best Matching" processing delay for effect
                setTimeout(() => {
                    setSubmissionStatus('success');
                    setServerMessage(data.message || "Application submitted successfully!");
                    setReferenceId(data.reference_id);
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#7c3aed', '#10b981', '#3b82f6']
                    });
                }, 2000); // 2 second delay to show the "Best Matching" animation
            } else {
                setSubmissionStatus('error');
                let errorMsg = "Failed to submit application. Please try again.";
                if (data.detail) {
                    if (typeof data.detail === 'string') {
                        errorMsg = data.detail;
                    } else if (Array.isArray(data.detail)) {
                        errorMsg = data.detail.map(e => `${e.msg}${e.loc ? ' (' + e.loc.join('.') + ')' : ''}`).join('\n');
                    } else {
                        errorMsg = JSON.stringify(data.detail);
                    }
                }
                alert(errorMsg);
                setSubmissionStatus(null); // Reset to form so they can fix it
            }
        } catch (error) {
            console.error(error);
            setSubmissionStatus('error');
            alert("Error connecting to server.");
            setSubmissionStatus(null);
        }
    };

    const copyToClipboard = () => {
        if (referenceId) {
            navigator.clipboard.writeText(referenceId);
            alert("Reference ID copied to clipboard!");
        }
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div className="container" style={{ flex: 1, paddingBottom: '4rem', paddingTop: '8rem' }}>
                <div style={{
                    marginBottom: '2rem',
                    position: 'sticky',
                    top: '90px',
                    zIndex: 40,
                    background: 'var(--primary-color)',
                    boxShadow: '0 4px 20px rgba(0, 71, 171, 0.3)',
                    color: 'white',
                    backdropFilter: 'blur(12px)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '0.6rem 1.2rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        ← Back to Search
                    </button>
                    <div style={{ color: 'white', fontWeight: '700' }}>
                        {submissionStatus === 'submitting' ? 'Processing...' :
                            submissionStatus === 'success' ? 'Application Status' :
                                selectedCollege ? 'Complete Application' : `Found ${results.length} Matches`}
                    </div>
                </div>

                {submissionStatus === 'submitting' ? (
                    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '5rem 2rem', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {/* "Best Matching Load Screen" Animation */}
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }} className="animate-pulse">🤖</div>
                        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>Processing Application...</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)' }}>
                            <span className="animate-pulse" style={{ animationDelay: '0s' }}>✅ Validating Credentials</span>
                            <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>🏫 Connecting with {selectedCollege?.college_name}</span>
                            <span className="animate-pulse" style={{ animationDelay: '1s' }}>📝 Generating Reference ID</span>
                        </div>
                    </div>
                ) : submissionStatus === 'success' ? (
                    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Application Submitted!</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                            {serverMessage}
                        </p>

                        {referenceId && (
                            <div style={{
                                background: 'var(--primary-light)',
                                border: '1px solid var(--primary-color)',
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-lg)',
                                maxWidth: '500px',
                                margin: '0 auto 2.5rem'
                            }}>
                                <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                                    Your Reference Number
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '1px' }}>
                                        {referenceId}
                                    </span>
                                    <button
                                        onClick={copyToClipboard}
                                        title="Copy to Clipboard"
                                        style={{
                                            background: 'white',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                sessionStorage.clear();
                                window.location.href = '/';
                            }}
                            className="btn btn-primary"
                        >
                            Finish & Return Home
                        </button>
                    </div>
                ) : selectedCollege ? (
                    <ApplicationForm
                        college={selectedCollege}
                        studentData={location.state?.studentData}
                        onSubmit={handleApplicationSubmit}
                        onCancel={() => setSelectedCollege(null)}
                    />
                ) : results.length === 0 ? (
                    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                        <h3>No matches found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Please try adjusting your search criteria.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <SearchResults
                        results={results}
                        onApply={handleApply}
                    />
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ResultsPage;
