import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('username');

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchApplications();
    }, [navigate]);

    const fetchApplications = async () => {
        try {
            const response = await fetch('http://localhost:8000/applications');
            if (response.ok) {
                const data = await response.json();

                // Filter logic based on logged in user:
                // If user is 'miet', only show TRP Engg College (placeholder logic)
                // In a real app we'd map this server side, but since the request asks for 'college wise view', 
                // we'll filter on the frontend for simplicity based on the knowledge base names.

                let filteredData = data;
                // 'admin' can see all
                if (currentUser === 'admin') {
                    filteredData = data;
                }
                if (currentUser === 'miet') {
                    filteredData = data.filter(app => app.college.toLowerCase().includes('trp') || app.college.toLowerCase().includes('miet'));
                } else if (currentUser === 'shaji') {
                    filteredData = data.filter(app => app.college.toLowerCase().includes('srm') || app.college.toLowerCase().includes('shaji'));
                }

                // If they don't explicitly belong to the hardcoded prefixes, show all or build a drop down filter.
                // Let's implement a universal dropdown filter instead so it's fully functional.

                setApplications(data); // Store all, filter visually
            } else {
                toast.error('Failed to load applications');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    // Derived state for filtering
    const [selectedCollege, setSelectedCollege] = useState('All');

    // Get unique colleges from applications
    const colleges = ['All', ...new Set(applications.map(app => app.college))];

    // Default filter based on username 
    useEffect(() => {
        if (applications.length > 0) {
            if (currentUser === 'admin') {
                setSelectedCollege('All');
            } else if (currentUser === 'miet') {
                const mietCollege = colleges.find(c => c.toLowerCase().includes('trp'));
                if (mietCollege) setSelectedCollege(mietCollege);
            } else if (currentUser === 'shaji') {
                const shajiCollege = colleges.find(c => c.toLowerCase().includes('srm'));
                if (shajiCollege) setSelectedCollege(shajiCollege);
            }
        }
    }, [applications.length, currentUser, colleges]);


    const displayedApplications = selectedCollege === 'All'
        ? applications
        : applications.filter(app => app.college === selectedCollege);

    if (loading) return <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>Loading data...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="form-title" style={{ margin: 0 }}>Dashboard</h1>
                <div>
                    <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>Welcome, Super Admin</span>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </div>

            <div className="glass-card section-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontWeight: 'bold' }}>Filter by College:</label>
                    <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        style={{ maxWidth: '400px' }}
                    >
                        {colleges.map((c, idx) => (
                            <option key={idx} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {displayedApplications.length === 0 ? (
                <div className="glass-card section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>No applications found for this college yet.</h3>
                </div>
            ) : (
                <div className="results-grid">
                    {displayedApplications.map((app) => (
                        <div key={app.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                <strong>{app.studentName}</strong>
                                <span className="tag" style={{ background: '#3b82f6', color: 'white' }}>Ref: {app.reference_id || 'N/A'}</span>
                            </div>

                            <div><span style={{ color: 'var(--text-muted)' }}>Course:</span> <strong>{app.courseApplied}</strong></div>
                            <div><span style={{ color: 'var(--text-muted)' }}>College:</span> {app.college}</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Qualification:</span> {app.qualification} - {app.stream}</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Marks:</span> {app.marksPercentage}%</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {app.phone}</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {app.email}</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>DOB:</span> {app.dob}</div>
                            </div>

                            {app.message && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-off-white)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                    <em>"{app.message}"</em>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
