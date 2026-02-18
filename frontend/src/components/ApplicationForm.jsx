import React, { useState } from 'react';

const ApplicationForm = ({ college, studentData, onSubmit, onCancel }) => {
    const collegeName = college?.college_name || "";

    // Initialize with student data if available
    const [formData, setFormData] = useState({
        studentName: studentData?.name || '',
        parentName: '',
        email: '',
        phone: '',
        gender: 'Male',
        dob: studentData?.dob || '',
        community: 'General',
        address: '',
        qualification: studentData?.qualification || '12th',
        stream: studentData?.stream || '',
        marksPercentage: studentData?.marks || '',
        courseApplied: college?.course_name || '',
        message: ''
    });

    const [isPreview, setIsPreview] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsPreview(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const confirmSubmission = () => {
        const submissionData = {
            college: String(collegeName || ""),
            studentName: String(formData.studentName || ""),
            parentName: String(formData.parentName || ""),
            email: String(formData.email || ""),
            phone: String(formData.phone || ""),
            gender: String(formData.gender || ""),
            dob: String(formData.dob || ""),
            community: String(formData.community || ""),
            address: String(formData.address || ""),
            qualification: String(formData.qualification || ""),
            stream: String(formData.stream || ""),
            marksPercentage: String(formData.marksPercentage || ""),
            courseApplied: String(formData.courseApplied || ""),
            message: String(formData.message || "")
        };

        onSubmit(submissionData);
        setIsPreview(false);
        onCancel();
    };

    if (isPreview) {
        return (
            <div className="glass-card animate-fade-in print-container" style={{ marginTop: '2rem', borderTop: '4px solid var(--primary-color)' }}>
                <style>
                    {`
                        @media print {
                            body * { visibility: hidden; }
                            .print-container, .print-container * { visibility: visible; }
                            .print-container { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                            .no-print { display: none !important; }
                            .print-only { display: block !important; }
                            h2, h3 { color: black !important; text-align: center; }
                            .detail-row { border-bottom: 1px solid #eee; padding: 8px 0; display: flex; }
                            .detail-label { font-weight: bold; width: 200px; }
                        }
                    `}
                </style>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem', background: 'var(--bg-off-white)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800' }}>Application Preview</h2>
                    <h3 style={{ color: 'var(--primary-color)', margin: '0.5rem 0', fontSize: '1.4rem' }}>{collegeName}</h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span>📍 {college?.address}</span>
                        <span>📞 {college?.contact}</span>
                    </div>
                </div>

                <div className="preview-details" style={{ display: 'grid', gap: '1rem', marginBottom: '2rem', padding: '0 1rem' }}>
                    <h4 style={{ color: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>Personal Details</h4>
                    {[
                        ['Student Name', formData.studentName],
                        ['Parent Name', formData.parentName],
                        ['Gender', formData.gender],
                        ['Date of Birth', formData.dob],
                        ['Community', formData.community],
                    ].map(([label, value]) => (
                        <div key={label} className="detail-row" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', alignItems: 'center' }}>
                            <span className="detail-label" style={{ width: '180px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{label}</span>
                            <span style={{ fontWeight: '500' }}>{value}</span>
                        </div>
                    ))}

                    <h4 style={{ color: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>Academic & Course</h4>
                    {[
                        ['Qualifying Exam', formData.qualification],
                        ['Stream/Group', formData.stream],
                        ['Marks (%)', formData.marksPercentage],
                        ['Course Applied', formData.courseApplied],
                    ].map(([label, value]) => (
                        <div key={label} className="detail-row" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', alignItems: 'center' }}>
                            <span className="detail-label" style={{ width: '180px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{label}</span>
                            <span style={{ fontWeight: '500' }}>{value}</span>
                        </div>
                    ))}

                    <h4 style={{ color: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>Contact Details</h4>
                    {[
                        ['Email', formData.email],
                        ['Phone', formData.phone],
                        ['Address', formData.address],
                    ].map(([label, value]) => (
                        <div key={label} className="detail-row" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', alignItems: 'center' }}>
                            <span className="detail-label" style={{ width: '180px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{label}</span>
                            <span style={{ fontWeight: '500' }}>{value}</span>
                        </div>
                    ))}
                </div>

                <div className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button onClick={() => setIsPreview(false)} className="btn btn-secondary" style={{ marginRight: 'auto' }}>
                        ← Edit Details
                    </button>

                    <button onClick={handlePrint} className="btn" style={{ background: 'var(--bg-off-white)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        Download PDF 📥
                    </button>

                    <button onClick={confirmSubmission} className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
                        Confirm & Submit ✅
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card animate-fade-in" style={{ marginTop: '2rem', borderTop: '4px solid var(--primary-color)', width: '100%', maxWidth: '100%', margin: '2rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem', background: 'var(--bg-off-white)', padding: '2.5rem 1rem', borderRadius: 'var(--radius-lg)', margin: '-1px -1px 2rem -1px' }}>
                <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Admission Application Form</h2>
                <h3 style={{ color: 'var(--primary-color)', margin: '0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>{collegeName}</h3>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span style={{ marginRight: '1rem' }}>📍 {college?.address}</span>
                    <span>📞 {college?.contact}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '0 1rem 1rem' }}>
                {/* 1. Course Details */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                        <div style={{ width: '30px', height: '30px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Course Preference</h4>
                    </div>

                    <div className="input-group">
                        <label>Applying For</label>
                        <input type="text" name="courseApplied" value={formData.courseApplied} onChange={handleChange} readOnly style={{ background: 'var(--bg-off-white)', cursor: 'not-allowed', fontWeight: '600', color: 'var(--text-muted)' }} />
                    </div>
                </div>

                {/* 2. Personal Details */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                        <div style={{ width: '30px', height: '30px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Personal Information</h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label>Student Full Name</label>
                            <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required placeholder="Enter full name" />
                        </div>
                        <div className="input-group">
                            <label>Parent/Guardian Name</label>
                            <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} required placeholder="Parent or Guardian name" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Community</label>
                            <select name="community" value={formData.community} onChange={handleChange}>
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Academic Details */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                        <div style={{ width: '30px', height: '30px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Academic Records</h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label>Qualification</label>
                            <select name="qualification" value={formData.qualification} onChange={handleChange}>
                                <option value="12th">12th Standard</option>
                                <option value="10th">10th Standard</option>
                                <option value="Diploma">Diploma</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Stream / Group</label>
                            <input type="text" name="stream" value={formData.stream} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Marks (%)</label>
                            <input type="number" name="marksPercentage" value={formData.marksPercentage} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* 4. Contact Details */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                        <div style={{ width: '30px', height: '30px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Contact Information</h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                        </div>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Full Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="City, State, Zip" />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Preview Application <span style={{ marginLeft: '8px' }}>→</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ApplicationForm;
