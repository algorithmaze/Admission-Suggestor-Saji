import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AdmissionForm from './components/AdmissionForm';
import ApplicationForm from './components/ApplicationForm';
import Footer from './components/Footer';
import AIChat from './components/AIChat';
import ResultsPage from './pages/ResultsPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import confetti from 'canvas-confetti';

import { endpoints } from './config';

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleFormSubmit = async (formData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(endpoints.suggestAdmission, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail
                    ? (Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail)
                    : 'Failed to fetch suggestions. Ensure backend is running.';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            // Navigate to results page with data
            navigate('/results', { state: { results: data, studentData: formData } });

        } catch (err) {
            console.error(err);
            setError('Could not connect to the backend. Please make sure the FastAPI server is running on port 8000.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <HeroSection />
            <FeaturesSection />

            <div className="container" id="predictor-section" style={{ paddingBottom: '6rem', paddingTop: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>🤖 Admission Predictor</span>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>Enter Your Details</h2>
                    <p style={{ color: '#94a3b8' }}>Our AI will analyze your profile and suggest the best colleges.</p>
                </div>

                <AdmissionForm onSubmit={handleFormSubmit} isLoading={loading} />

                {error && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '10px', color: '#fca5a5' }}>
                        {error}
                    </div>
                )}
            </div>
            <Footer />
            <AIChat />
        </>
    );
};

const SessionHandler = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        let timeout;
        const EVENTS = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Timeout Action
                sessionStorage.clear();
                alert("Session timed out due to inactivity (2 mins). Returning to Home.");
                window.location.href = "/";
            }, 120000); // 2 minutes
        };

        // Attach listeners
        EVENTS.forEach(event => window.addEventListener(event, resetTimer));

        // Initial start
        resetTimer();

        // Cleanup
        return () => {
            clearTimeout(timeout);
            EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);

    return null;
};

function App() {
    return (
        <Router>
            <SessionHandler />
            <div style={{ width: '100%', overflowX: 'hidden' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
