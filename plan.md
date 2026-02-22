1. Project Overview
The Student Admission Suggester is a web-based application that helps students identify the best matching courses and colleges based on their academic profile.
Students enter basic academic details, and the system intelligently suggests suitable courses, colleges, and fee details using a predefined knowledge base.

2. Objectives


Collect student academic information through a simple form


Analyze marks, qualification, and stream


Suggest:


Best matching courses


Eligible colleges


Fee details




Reduce confusion during college admission decisions


Provide fast and accurate admission guidance



3. Technology Stack
Frontend


React.js


HTML5, CSS3


JavaScript (ES6+)


ngrock port forwarding


Backend


Python – FastAPI


Uvicorn (ASGI server)


Pydantic (data validation)


SQLAlchemy (SQLite Database)


Data Source


Given file used as Knowledge Base


Colleges


Courses


Eligibility


Cut-off marks


Fee structure





4. System Architecture
React Frontend  →  FastAPI Backend  →  Knowledge Base File



React handles UI and form submission


FastAPI processes data and applies admission logic


Knowledge base provides college & course information



5. Functional Requirements
5.1 Student Input Form (Frontend)
The admission suggester form will contain:


Student Name


Date of Birth


Qualification (10th / 12th)


Stream (Science / Arts / Commerce / Diploma)


Marks (Percentage or Subject-wise)


All fields will include:


Input validation


Required field checks



5.2 Admission Suggestion Output
After submission, the system will display:


Best matching course(s)


Eligible college name(s)


Fee details for each course


Admission eligibility status



6. Frontend Development Plan (React)
Pages / Components


Home Page


Project introduction


“Start Admission Suggestion” button




Admission Form Component


Controlled input fields


Dropdowns for qualification and stream


Submit button




Result Page / Component


Display suggested courses


College names


Fee details in cards or table format




Reusable Components


Header


Footer


Alert / Error message component




State Management


React useState for form data


useEffect for API response handling



7. Backend Development Plan (FastAPI)
API Design
Endpoint: /suggest-admission


Method: POST


Input: Student academic details


Output: Suggested courses, colleges, and fees


Backend Responsibilities


Validate student data using Pydantic models


Read and process the knowledge base file


Apply admission rules:


Match qualification (10th / 12th)


Check marks against course eligibility


Filter by stream




Return best-matching results



8. Admission Suggestion Logic


Identify qualification (10th / 12th)


Analyze marks


Match stream with available courses


Filter colleges based on:


Eligibility criteria


Cut-off marks




Attach fee details


Sort results by:


Best match


Lower fees (optional)





9. Knowledge Base Integration


The given file will be used as a static knowledge base


Data includes:


College Name


Course Name


Minimum Marks


Stream Eligibility


Fee Structure




Backend will parse and query this file dynamically



10. Validation & Error Handling


Invalid marks → user-friendly message


No matching course → suggest alternative streams


Backend error → safe fallback response



11. Security & Performance


Input validation on both frontend & backend


CORS configuration in FastAPI


Lightweight and fast API responses



12. Future Enhancements (Optional)


Login & student profile history


AI/ML-based prediction model


Location-based college filtering


Admin panel to update knowledge base


PDF download of admission suggestions



13. Conclusion
This Student Admission Suggester provides a structured, scalable, and user-friendly solution to guide students during college admissions.
Using React for frontend, FastAPI for backend, and SQLite for data persistence, the system ensures fast performance, clean architecture, and easy future expansion.
