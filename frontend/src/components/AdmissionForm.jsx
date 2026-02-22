import React, { useState } from 'react';
import '../form-styles.css';
import '../form-styles.css';

const AdmissionForm = ({ onSubmit, isLoading }) => {
    // ... state ...
    const [formData, setFormData] = useState(() => {
        const savedData = sessionStorage.getItem('admissionFormData');
        return savedData ? JSON.parse(savedData) : {
            name: '',
            dob: '',
            qualification: '12th',
            stream: 'Computer Science',
            marks: '',
            subject_marks: {},
            preferred_course: '',
            career_interest: ''
        };
    });

    // Persist form data to session storage
    React.useEffect(() => {
        sessionStorage.setItem('admissionFormData', JSON.stringify(formData));
    }, [formData]);

    // ... courses object ...
    const courses = {
        '12th': {
            'Biology': {
                'Arts and Science Courses': [
                    { name: "B.Sc Biochemistry", cutoff: 50 },
                    { name: "B.Sc Microbiology", cutoff: 50 },
                    { name: "B.Sc Hotel Management", cutoff: 45 },
                    { name: "BA (Bachelor of Arts)", cutoff: 40 },
                    { name: "BBA (Bachelor of Business Administration)", cutoff: 50 },
                    { name: "B.Com (General)", cutoff: 60 }
                ],
                'Engineering Courses': [
                    { name: "Biomedical Engineering", cutoff: 70 }
                ]
            },
            'Computer Science': {
                'Engineering Courses': [
                    { name: "Computer Science and Engineering (CSE)", cutoff: 75 },
                    { name: "Electronics and Communication Engineering (ECE)", cutoff: 70 },
                    { name: "Data Science & Analytics Engineering", cutoff: 75 }
                ],
                'Arts and Science Courses': [
                    { name: "B.Sc Computer Science", cutoff: 60 },
                    { name: "B.Sc Data Science", cutoff: 65 },
                    { name: "BCA (Bachelor of Computer Applications)", cutoff: 60 }
                ],
                'Diploma Courses': [
                    { name: "Diploma in Computer Engineering", cutoff: 40 }
                ]
            },
            'Commerce': {
                'Arts and Science Courses': [
                    { name: "B.Com (General)", cutoff: 60 },
                    { name: "B.Com Computer Applications (CA)", cutoff: 65 },
                    { name: "BBA (Bachelor of Business Administration)", cutoff: 60 },
                    { name: "BCA (Bachelor of Computer Applications)", cutoff: 60 },
                    { name: "BA (Bachelor of Arts)", cutoff: 40 }
                ]
            },
            'Vocational': {
                'Engineering Courses': [
                    { name: "Mechanical Engineering", cutoff: 65 },
                    { name: "Civil Engineering", cutoff: 65 },
                    { name: "Electrical Engineering", cutoff: 70 },
                    { name: "Chemical Engineering", cutoff: 75 }
                ],
                'Diploma Courses': [
                    { name: "Diploma in Computer Engineering", cutoff: 40 },
                    { name: "Diploma in Mechanical Engineering", cutoff: 40 },
                    { name: "Diploma in Electrical & Electronics Engineering", cutoff: 40 },
                    { name: "Diploma in Civil Engineering", cutoff: 40 },
                    { name: "Diploma in Electronics & Communication Engineering", cutoff: 40 },
                    { name: "Diploma in Mechatronics Engineering", cutoff: 40 },
                    { name: "Diploma in Automobile Engineering", cutoff: 40 }
                ]
            }
        },
        '10th': {
            'General': {
                'Diploma Courses': [
                    { name: "Diploma in Computer Engineering", cutoff: 35 },
                    { name: "Diploma in Mechanical Engineering", cutoff: 35 },
                    { name: "Diploma in Electrical & Electronics Engineering", cutoff: 35 },
                    { name: "Diploma in Civil Engineering", cutoff: 35 },
                    { name: "Diploma in Electronics & Communication Engineering", cutoff: 35 },
                    { name: "Diploma in Mechatronics Engineering", cutoff: 35 },
                    { name: "Diploma in Automobile Engineering", cutoff: 35 }
                ]
            }
        }
    };

    const availableCategories = (courses[formData.qualification] && courses[formData.qualification][formData.stream]) || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Reset stream if qualification changes
            if (name === 'qualification') {
                newData.stream = value === '10th' ? 'General' : 'Computer Science';
                newData.preferred_course = '';
            }
            // Reset course if stream changes
            if (name === 'stream') {
                newData.preferred_course = '';
            }
            return newData;
        });
    };

    const getSubjects = () => {
        if (formData.qualification === '10th') return ['General'];
        const groupSubjects = {
            'Biology': ['Chemistry', 'Physics', 'Maths', 'Biology'],
            'Computer Science': ['Computer Science', 'Physics', 'Chemistry', 'Maths'],
            'Commerce': ['Accountancy', 'Commerce', 'Economics', 'Business Maths', 'Computer Application'],
            'Vocational': ['Computer Application', 'Agriculture', 'Electrical Technology', 'Automobile Technology', 'Textile', 'Fashion']
        };
        return groupSubjects[formData.stream] || [];
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Age Validation
        if (!validateAge(formData.dob)) {
            alert("You must be at least 17 years old to apply.");
            return;
        }

        // Sanitize subject_marks: remove empty entries and convert to numbers
        const cleanedSubjectMarks = {};
        Object.entries(formData.subject_marks).forEach(([key, value]) => {
            if (value !== '' && value !== null && !isNaN(parseFloat(value))) {
                cleanedSubjectMarks[key] = parseFloat(value);
            }
        });

        // Rule: Fail if any subject < 35
        const failedSubjects = Object.entries(cleanedSubjectMarks).filter(([sub, marks]) => marks < 35);
        if (failedSubjects.length > 0) {
            alert(`Not eligible for application.\nreason: Failed in ${failedSubjects.map(s => s[0]).join(', ')} (Marks below 35).`);
            return;
        }

        onSubmit({
            ...formData,
            marks: parseFloat(formData.marks),
            subject_marks: cleanedSubjectMarks,
            career_interest: formData.career_interest
        });
    };

    const handleSubjectMarkChange = (subject, value) => {
        // Validate 0-100
        if (value === '') {
            setFormData(prev => ({
                ...prev,
                subject_marks: { ...prev.subject_marks, [subject]: value }
            }));
            return;
        }

        const numValue = parseFloat(value);
        if (numValue < 0 || numValue > 100) return;

        setFormData(prev => ({
            ...prev,
            subject_marks: {
                ...prev.subject_marks,
                [subject]: value
            }
        }));
    };

    // Automatically calculate percentage when subject marks change
    React.useEffect(() => {
        const subjects = getSubjects();
        const hasEntries = subjects.some(sub => formData.subject_marks[sub] !== undefined && formData.subject_marks[sub] !== '');

        if (subjects.length > 0 && hasEntries) {
            const total = subjects.reduce((sum, subject) => {
                const val = parseFloat(formData.subject_marks[subject]);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);

            // Calculate average percentage with 1 decimal place
            const percentage = (total / subjects.length).toFixed(1);

            setFormData(prev => {
                if (prev.marks === percentage) return prev;
                return { ...prev, marks: percentage };
            });
        }
    }, [formData.subject_marks, formData.stream, formData.qualification]);

    // specific validation for 17 years age
    const validateAge = (dob) => {
        if (!dob) return false;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 17;
    };

    // Calculate Date Constraints
    const today = new Date();
    const maxDateRaw = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const minDateRaw = new Date(today.getFullYear() - 40, today.getMonth(), today.getDate());

    const maxDate = maxDateRaw.toISOString().split('T')[0];
    const minDate = minDateRaw.toISOString().split('T')[0];

    return (

        <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '90%', maxWidth: '1600px', margin: '0 auto' }}>
            <div className="form-header">
                <h2 className="form-title">Student Profile Details</h2>
                <div className="divider"></div>
            </div>

            {/* Section 1: Personal Info */}
            <div className="section-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h3 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Personal Information</h3>
                </div>

                <div className="form-grid-2">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            required
                            style={{ height: '50px', fontSize: '1.05rem' }}
                        />
                    </div>

                    <div className="input-group">
                        <label>Date of Birth (Min Age: 17)</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            max={maxDate}
                            min={minDate}
                            style={{ height: '50px', fontSize: '1.05rem' }}
                        />
                        {formData.dob && !validateAge(formData.dob) && (
                            <small style={{ color: '#ef4444', fontWeight: '600' }}>Age must be 17+ years.</small>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 2: Academic Core */}
            <div className="section-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                    </div>
                    <h3 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Academic Background</h3>
                </div>

                <div className="form-grid-3">
                    <div className="input-group">
                        <label>Qualification</label>
                        <select name="qualification" value={formData.qualification} onChange={handleChange} style={{ height: '50px', fontSize: '1.05rem' }}>
                            <option value="10th">10th Grade</option>
                            <option value="12th">12th Grade</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Stream / Group</label>
                        <select name="stream" value={formData.stream} onChange={handleChange} style={{ height: '50px', fontSize: '1.05rem' }}>
                            {formData.qualification === '12th' ? (
                                <>
                                    <option value="Biology">Biology</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Vocational">Vocational</option>
                                </>
                            ) : (
                                <option value="General">General</option>
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* AI Analysis Data: Subject Marks & Career Interests */}
            <div className="section-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-4"></path><path d="M8 18v-2"></path><path d="M16 18v-6"></path></svg>
                    </div>
                    <h3 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Subject Performance</h3>
                </div>

                <div className="subject-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {getSubjects().map(subject => (
                        <div key={subject} style={{ background: 'var(--bg-off-white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', height: '32px', display: 'flex', alignItems: 'center' }}>
                                {subject}
                            </label>
                            <input
                                type="number"
                                onChange={(e) => handleSubjectMarkChange(subject, e.target.value)}
                                placeholder="0-100"
                                min="0"
                                max="100"
                                value={formData.subject_marks[subject] || ''}
                                style={{ width: '100%', height: '45px', fontSize: '1.2rem', fontWeight: '600', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(37,99,235,0.2)' }}>
                    <div>
                        <label style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Overall Percentage</label>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Auto-calculated</div>
                    </div>
                    <div className="input-group" style={{ width: '150px' }}>
                        <input
                            type="text"
                            name="marks"
                            value={formData.marks ? `${formData.marks}%` : ''}
                            readOnly
                            placeholder="--%"
                            style={{ background: '#fff', cursor: 'default', fontWeight: '800', fontSize: '1.5rem', textAlign: 'right', color: 'var(--primary-color)', border: 'none', boxShadow: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--secondary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--secondary-color)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    </div>
                    <h3 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Career Goals</h3>
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>What is your dream job?</label>
                    <input
                        type="text"
                        name="career_interest"
                        value={formData.career_interest}
                        onChange={handleChange}
                        placeholder="e.g. Data Scientist, Surgeon, Software Engineer, Architect..."
                        style={{ height: '55px', fontSize: '1.1rem' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--secondary-color)', fontSize: '0.9rem', fontWeight: '500' }}>
                        <span>✨</span> AI will recommend courses based on this goal.
                    </div>
                </div>
            </div>

            {/* Preference */}
            <div className="section-card">
                <h3 className="section-title">Course Preferences</h3>
                <div className="input-group">
                    <label>Targeted Course Preference (Optional)</label>
                    <select name="preferred_course" value={formData.preferred_course} onChange={handleChange} style={{ width: '100%' }}>
                        <option value="">-- Let AI Suggest All Best Matches --</option>
                        {Object.entries(availableCategories).map(([category, courseList]) => (
                            <optgroup key={category} label={category}>
                                {courseList
                                    .map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: '300px', fontSize: '1.1rem', padding: '1rem 2rem' }}>
                    {isLoading ? 'Processing Information...' : 'Fetch Admission Matches'}
                </button>
            </div>
        </form>
    );
};

export default AdmissionForm;
