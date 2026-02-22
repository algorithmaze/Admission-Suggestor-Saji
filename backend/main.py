from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import json
import os
from groq import AsyncGroq, AuthenticationError
from dotenv import load_dotenv
import asyncio
import random

from database import engine, Base, get_db
from models import Application
from sqlalchemy.orm import Session
from fastapi import Depends

Base.metadata.create_all(bind=engine)

load_dotenv() # Reloads env vars
# Trigger reload for config update
api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key) if api_key else None

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,    
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load Knowledge Base
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_FILE = os.path.join(BASE_DIR, "knowledge_base.json")

knowledge_base = []

def load_kb():
    global knowledge_base
    if os.path.exists(KB_FILE):
        with open(KB_FILE, "r") as f:
            knowledge_base = json.load(f)
    else:
        print(f"Warning: {KB_FILE} not found.")

load_kb()

# Models
class StudentInput(BaseModel):
    name: str
    dob: str
    qualification: str  # "10th" or "12th"
    stream: str         # "Science", "Arts", "Commerce", "Diploma", etc.
    marks: float = Field(..., ge=0, le=100)       # Average percentage
    subject_marks: dict = {}                      # e.g. {"Physics": 85, "Maths": 90}
    preferred_course: str = ""                    # Optional specific course selection
    career_interest: str = ""                     # Optional career goal

class CourseSuggestion(BaseModel):
    college_name: str
    course_name: str
    fees: int
    address: str
    contact: str
    match_reason: str
    ai_analysis: str = ""  # New field for AI analysis
    relevance_score: float = 0.0 # Internal scoring for sorting



async def get_ai_analysis(student: StudentInput, course_name: str, college_name: str, use_real_ai: bool = True):
    """Get AI analysis for a specific course suggestion. Falls back to templates if rate limited or lower priority."""
    
    # Identify strong subjects
    strong_subjects = [sub for sub, mark in student.subject_marks.items() if float(mark) >= 75]
    strong_subjects_str = ", ".join(strong_subjects) if strong_subjects else "your academic profile"

    # Fallback Template Generator
    def generate_smart_template():
        templates = [
            f"Great choice! {college_name} is known for {course_name}, and your marks fit well.",
            f"Based on your score, this course at {college_name} is a solid option for your career.",
            f"Your profile matches the eligibility for {course_name} at {college_name} perfectly.",
        ]
        
        # customized templates based on subjects
        course_lower = course_name.lower()
        if "computer" in course_lower and "Computer Science" in strong_subjects:
            templates.append(f"Your strong performance in Computer Science makes you a top candidate for this course!")
        if "math" in course_lower and "Maths" in strong_subjects:
             templates.append(f"With your good Maths score, you'll find the curriculum at {college_name} very manageable.")
        if "bio" in course_lower and "Biology" in strong_subjects:
             templates.append(f"Your Biology marks suggest you have the right aptitude for this field.")

        return random.choice(templates)

    if not use_real_ai or not os.getenv("GROQ_API_KEY"):
        return generate_smart_template()
    
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": f"""
                    Act as an admission counselor. Write a very brief note to student {student.name}.
                    
                    Context:
                    - Student is applying for: {course_name} at {college_name} # {student.stream} stream
                    - Student's Subject Marks: {student.subject_marks}
                    - Student's Career Goal: {student.career_interest}
                    
                    Task: explain EXACTLY why this course is suggested based on their specific HIGH MARKS in related subjects (if any) or their career goal.
                    
                    Constraints:
                    - STRICTLY 1 or 2 short sentences.
                    - Max 35 words.
                    - Be enthusiastic but professional.
                    - "Recommended because [Specific Reason tied to marks/goal]."
                    """
                }
            ],
            temperature=0.8,
            max_tokens=60,
            top_p=1,
            stream=False,
            stop=None,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"AI API Error (falling back to template): {str(e)}")
        return generate_smart_template()

async def analyze_career_goal(career_goal: str, kb: list) -> list:
    """Ask AI to map a career goal to relevant course names from the KB."""
    if not career_goal or not os.getenv("GROQ_API_KEY"):
        return []

    # Extract all unique course names
    all_courses = list(set([item["course_name"] for item in kb]))
    
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert career counselor. Map the user's dream job to the most relevant courses from the provided list."
                },
                {
                    "role": "user",
                    "content": f"""
                    User's Career Goal: "{career_goal}"
                    
                    Available Courses:
                    {json.dumps(all_courses)}
                    
                    Task: Return a JSON list of strictly the course names from the list above that are best suited for this career.
                    Example Output: ["B.E Computer Science", "BCA"]
                    Rules: 
                    - Only pick courses that actually exist in the list. 
                    - Be smart (e.g., 'Google' -> Computer Science, 'Doctor' -> Biomedical/etc if available). 
                    - Return ONLY the JSON list.
                    """
                }
            ],
            temperature=0.3,
            max_tokens=200
        )
        response_content = completion.choices[0].message.content.strip()
        # Clean up code blocks if ai sends them
        if "```" in response_content:
            response_content = response_content.replace("```json", "").replace("```", "")
        
        suggested_courses = json.loads(response_content)
        if isinstance(suggested_courses, list):
            return [c.lower() for c in suggested_courses]
        return []
        
    except Exception as e:
        print(f"Career AI Analysis Error: {e}")
        return []

@app.post("/suggest-admission", response_model=List[CourseSuggestion])
async def suggest_admission(student: StudentInput):
    suggestions = []
    
    # helper to check if student has a specific subject with passing marks
    def has_subject(sub_name, min_mark=35):
        for key, mark in student.subject_marks.items():
            if sub_name.lower() in key.lower():
                try:
                    if float(mark) >= min_mark:
                        return True
                except (ValueError, TypeError):
                    continue # Skip invalid marks
        return False

    # AI Career Analysis (Pre-fetch)
    ai_suggested_courses_lower = []
    if student.career_interest:
        print(f"Analyzing career: {student.career_interest}")
        ai_suggested_courses_lower = await analyze_career_goal(student.career_interest, knowledge_base)
        print(f"AI Suggested Courses: {ai_suggested_courses_lower}")

    for item in knowledge_base:
        course_name = item["course_name"]
        course_name_lower = course_name.lower()
        
        is_eligible = False
        rejection_reason = ""
        special_note = ""

        # ==========================================
        #  RULE 1: Qualification Based Filtering
        # ==========================================
        if student.qualification == "10th":
            # 10th -> ONLY Diploma
            if "diploma" in course_name_lower:
                is_eligible = True
                special_note = "3 Years Full Time"
            else:
                continue # Strictly no degrees for 10th

        elif student.qualification == "12th":
            # 12th -> Degrees OR Diploma (Lateral Entry)
            if "diploma" in course_name_lower:
                is_eligible = True
                special_note = "Direct 2nd Year (Lateral Entry)"
            else:
                # ==========================================
                #  RULE 2: Stream & Subject Eligibility (Indian Context)
                # ==========================================
                is_degree_eligible = False
                
                # A. ENGINEERING (B.E / B.Tech)
                if any(x in course_name_lower for x in ["engineering", "b.e", "b.tech"]):
                    # Commerce/Arts students -> NO Engineering
                    if student.stream in ["Commerce", "Arts"]:
                        rejection_reason = "Stream Mismatch"
                    
                    # Vocational -> Eligible (Generally)
                    elif student.stream == "Vocational":
                        is_degree_eligible = True

                    # Science (Bio/Math/Computer)
                    else:
                        # Bio students -> Only Biomedical/Bio-related unless they have Math
                        if student.stream == "Biology" and not has_subject("Math"):
                            if "biomedical" in course_name_lower or "biotech" in course_name_lower:
                                is_degree_eligible = True
                            else:
                                rejection_reason = "Requires Maths"
                        
                        # Math/Computer students -> All Engineering
                        elif has_subject("Math") or has_subject("Physics"):
                            is_degree_eligible = True
                        
                        # Check strict subject reqs for specific branches
                        if "computer" in course_name_lower:
                             # CSE requires Math or Computer Science
                             # If stream is CS, we assume they have it.
                             if student.stream == "Computer Science":
                                 pass
                             elif not (has_subject("Math") or has_subject("Computer")):
                                 is_degree_eligible = False
                                 rejection_reason = "CSE Requires Maths/Computer Sc."

                # B. ARTS & SCIENCE (B.Sc, BCA, B.Com, B.A)
                elif "b.sc" in course_name_lower:
                    # B.Sc Computer/Data -> Needs Math or CS
                    if "computer" in course_name_lower or "data" in course_name_lower:
                        if (student.stream == "Computer Science") or has_subject("Math") or has_subject("Computer"):
                            is_degree_eligible = True
                    # B.Sc Bio/Micro -> Needs Biology
                    elif "bio" in course_name_lower or "microbiology" in course_name_lower:
                        if (student.stream == "Biology") or has_subject("Biology") or has_subject("Botany"):
                            is_degree_eligible = True
                    else:
                        # General B.Sc -> Science Stream mostly
                        if student.stream not in ["Commerce", "Arts"]:
                            is_degree_eligible = True

                elif "bca" in course_name_lower:
                    # BCA -> Any stream, but Math/CS preferred. 
                    is_degree_eligible = True
                
                elif "b.com" in course_name_lower or "bba" in course_name_lower:
                    # FIX: allow Commerce stream explicitly
                    if (student.stream == "Commerce") or has_subject("Commerce") or has_subject("Accountancy") or has_subject("Business"):
                        is_degree_eligible = True
                
                elif "b.a" in course_name_lower or "arts" in course_name_lower:
                    is_degree_eligible = True # Open to all

                # Fallback
                elif student.stream in item.get("stream_eligibility", []):
                    is_degree_eligible = True
                
                if is_degree_eligible:
                    is_eligible = True
                else:
                    continue

        if not is_eligible:
            continue

        # ==========================================
        #  RULE X: Medical (MBBS/BDS) - ENABLED
        # ==========================================
        # if any(x in course_name_lower for x in ["mbbs", "bds", "bachelor of medicine", "bachelor of dental"]):
        #     continue

        # ==========================================
        #  RULE 3: Percentage Logic (Tiered)
        # ==========================================
        # Hard limits from chatflow.md
        if student.marks < 35: continue # Fail
        
        # Engineering Degree Rules
        if "engineering" in course_name_lower and "diploma" not in course_name_lower:
            if student.marks < 60 and student.stream != "Vocational":
                # < 60% -> Suggest Diploma instead of Degree
                continue 
            
            # High Demand Branches (CSE/ECE/Data) need 70%+
            if any(x in course_name_lower for x in ["cse", "computer science", "data", "electronics"]):
                 if student.marks < 65: # Relaxed slightly from 70 to 65 for usability
                     continue

        # ==========================================
        #  SCORING: Rules 4, 5, 6
        # ==========================================
        relevance_score = 50 # Base
        match_reasons = []

        # Qualification Match
        if special_note:
            match_reasons.append(f"**{special_note}**")

        # 1. High Mark Boost (Rule 6: Top Colleges/Courses)
        if student.marks >= 80:
            relevance_score += 20
            match_reasons.append("Excellent academic record.")
        elif student.marks >= 70:
            relevance_score += 10
        
        # 2. Subject Strength (Rule 4)
        if "engineering" in course_name_lower:
            if has_subject("Math", 80):
                relevance_score += 15
                match_reasons.append("Strong Maths score.")
            if has_subject("Physics", 80):
                relevance_score += 10
        
        if "bio" in course_name_lower and has_subject("Biology", 80):
             relevance_score += 15
             match_reasons.append("Strong Biology score.")

        # 3. Career Interest Match (Rule 5)
        if student.career_interest:
            interest_lower = student.career_interest.lower()
            if "computer" in interest_lower or "code" in interest_lower or "software" in interest_lower:
                if "computer" in course_name_lower or "bca" in course_name_lower or "data" in course_name_lower:
                    relevance_score += 25
                    match_reasons.append("Matches your career goal.")
            
            elif "doctor" in interest_lower or "medical" in interest_lower:
                 if "bio" in course_name_lower or "medical" in course_name_lower:
                    relevance_score += 25
                    relevance_score += 25
                    match_reasons.append("Aligns with medical aspirations.")
            
            # AI Direct Match Boost
            if course_name_lower in ai_suggested_courses_lower:
                relevance_score += 40 # Huge boost for AI match
                match_reasons.append("🤖 AI Recommended for your Career Goal")
        
        # 4. Diploma vs Degree Weighting (Rule 1 refinement)
        if student.qualification == "12th":
            if "diploma" in course_name_lower:
                # Always show Diplomas as valid options (Lateral Entry)
                # Boost if marks are low (Primary option)
                if student.marks < 65:
                    relevance_score += 25
                    match_reasons.append("Recommended foundation course.")
                else:
                    # For high marks, we don't penalize, just provide a smaller boost compared to degrees
                    relevance_score += 5 
                    match_reasons.append("Direct 2nd Year Option.")
            else:
                # Degree Courses
                if student.marks >= 70:
                    relevance_score += 15 # Prioritize Degrees for good students
        
        # 5. Preferred Course Match (Rule 10)
        if student.preferred_course:
             if student.preferred_course.lower() in course_name_lower:
                 relevance_score += 100 # Top Priority
                 match_reasons.append("✨ Your Preferred Course")

        if not match_reasons:
             match_reasons.append("Eligible option.")

        final_reason = " ".join(match_reasons)
        
        suggestions.append(CourseSuggestion(
            college_name=item["college_name"],
            course_name=item["course_name"],
            fees=item["fees"],
            address=item.get("address", "Tiruchirappalli"),
            contact=item.get("contact", "N/A"),
            match_reason=final_reason,
            relevance_score=relevance_score,
            ai_analysis="" 
        ))
    
    # Sort: Relevance High -> Fees Low
    suggestions.sort(key=lambda x: (-x.relevance_score, x.fees))
    
    # Balancing Logic for 12th Grade: Top 60 (20 Engineering, 20 Arts/Science, 20 Diploma)
    if student.qualification == "12th":
        eng_list = []
        arts_list = []
        diploma_list = []
        other_list = []
        
        for res in suggestions:
            name_lower = res.course_name.lower()
            if "diploma" in name_lower or "lateral" in res.match_reason.lower():
                if len(diploma_list) < 20: diploma_list.append(res)
            elif any(x in name_lower for x in ["b.e", "b.tech", "engineering", "archi"]):
                if len(eng_list) < 20: eng_list.append(res)
            elif any(x in name_lower for x in ["b.sc", "b.a", "b.com", "bba", "bca", "arts"]):
                if len(arts_list) < 20: arts_list.append(res)
            else:
                # Catch-all
                if len(other_list) < 10: other_list.append(res)
        
        # Combine all buckets
        final_suggestions = eng_list + arts_list + diploma_list + other_list
        # Return all found (capped by the buckets themselves)
        return final_suggestions
        
    return suggestions[:50]

class ChatInput(BaseModel):
    message: str

def retrieve_context(query: str, kb: list) -> list:
    """Keyword-based retrieval with stop-word filtering to allow short acronyms (e.g. BCA, CSE)."""
    
    stop_words = {
        "what", "which", "where", "when", "how", "who", "whom", "whose", "why",
        "is", "are", "was", "were", "be", "been", "being",
        "the", "a", "an", "and", "or", "but", "if", "then", "else", "when",
        "at", "by", "for", "from", "in", "into", "of", "off", "on", "onto", "out", "over", "to", "up", "with",
        "can", "could", "will", "would", "shall", "should", "may", "might", "must",
        "tell", "me", "about", "give", "list", "show", "find", "best", "good", "top", "colleges", "college", "courses"
    }

    # Normalize and split tokens
    raw_tokens = query.lower().replace("?", "").replace(".", " ").replace(",", " ").split()
    
    # Filter tokens: Keep if length >= 2 AND not in stop_words
    # Exception: Keep 'ai' even though it's length 2, it's relevant (though maybe matched by other means)
    tokens = [t for t in raw_tokens if len(t) >= 2 and t not in stop_words]
    
    # Debug: Print tokens (visible in server logs if needed)
    print(f"Search tokens: {tokens}")

    # If no specific keywords found (e.g. query was just stop words), provide a summary
    if not tokens:
        overview = []
        seen = set()
        for item in kb:
            key = (item['college_name'], item['course_name'])
            if key not in seen:
                overview.append({"college": item['college_name'], "course": item['course_name']})
                seen.add(key)
        return overview[:30]

    scored_items = []
    for item in kb:
        score = 0
        # Create a searchable string from the item's relevant fields
        # Weighting: Course name and College name are most important
        item_str = (item["course_name"] + " " + item["college_name"] + " " + item.get("stream_eligibility", [""])[0]).lower()
        
        for token in tokens:
            if token in item_str:
                score += 1
                
                # Bonus score for exact Matches in the Course Name (e.g. "BCA" in "BCA (Bachelor...)")
                # Add spaces to ensure we match whole words if possible, or just rely on substring
                if token in item["course_name"].lower().split():
                     score += 2 # Heavy weight for course name match
        
        if score > 0:
            scored_items.append((score, item))
            
    # Sort by relevance (Score DESC)
    scored_items.sort(key=lambda x: x[0], reverse=True)
    
    # Return top 20 most relevant items
    return [item for score, item in scored_items[:20]]

@app.post("/ai-chat")
async def ai_chat(chat: ChatInput):
    """Handle interactive AI chat for admission guidance."""
    if not os.getenv("GROQ_API_KEY"):
        return {"reply": "I'm sorry, my AI brain is currently disconnected (API key missing)."}
    
    # Filter knowledge base to find relevant info
    context_data = retrieve_context(chat.message, knowledge_base)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a warm, professional, and encouraging student admission counselor.
                    
                    Data Source:
                    <data>
                    {json.dumps(context_data)}
                    </data>

                    Platform User Guide (How to use this App):
                    1. **Step 1: Fill Profile**: Enter your name, marks (10th/12th), stream (Science/Arts/etc.), and career goal (e.g., 'Doctor', 'Engineer') in the main form.
                    2. **Step 2: Get Suggestions**: Click 'Fetch Admission Matches'. Our AI analyzes your marks and career goal to find the best college & course matches.
                    3. **Step 3: AI Insights**: Review the results. We show 'Top Choices' and provide explanations for *why* a course fits you (e.g., "Strong Maths score").
                    4. **Step 4: Apply**: Click 'Apply Now' on your preferred college. Review your pre-filled application form and submit it. You will receive an email confirmation.

                    Guidelines:
                    1. **Tone**: Be sweet, polite, and professional. Use natural, conversational language (e.g., "I'd be happy to help!", "Here are some excellent options for you").
                    2. **Transparency**: NEVER say "Based on the provided data", "According to my database", or "The colleges in our data". Speak as if you know this information personally.
                    3. **Accuracy**: strictly answer using ONLY the provided data. Do not invent facts.
                    4. **Missing Info**: If the info is missing, politely say, "I apologize, but I don't have information on that specific topic right now."
                    5. **Formatting**: When listing colleges or courses, YOU MUST use a clean bullet-point format. 
                    6. **Readability**: Keep general answers concise (2-4 sentences). Ensure the output is professional, clear, and easy to read.
                    """
                },
                {
                    "role": "user",
                    "content": chat.message
                }
            ],
            temperature=0.7,
            max_tokens=300,
            top_p=1,
            stream=False,
            stop=None,
        )
        return {"reply": completion.choices[0].message.content.strip()}
    except AuthenticationError:
        return {"reply": "I'm sorry, but my connection to the AI brain is currently unauthorized (Invalid API Key). Please update the configuration."}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}

@app.get("/")
def read_root():
    return {"message": "Student Admission Suggester API is running. POST to /suggest-admission to get results."}

# Email & Application Logic
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class ApplicationInput(BaseModel):
    college: str
    studentName: str
    parentName: str
    email: str
    phone: str
    gender: str
    dob: str
    community: str
    address: str
    # New Fields
    qualification: str = "N/A"
    stream: str = "N/A"
    marksPercentage: str = "N/A"
    courseApplied: str = "N/A"
    message: str = ""


# In-memory storage for applications
applications_db = []

@app.post("/submit-application")
async def submit_application(application: ApplicationInput, db: Session = Depends(get_db)):
    # 1. Duplicate Check
    existing_app = db.query(Application).filter(
        Application.college == application.college,
        (Application.email == application.email) | (Application.phone == application.phone)
    ).first()

    if existing_app:
        raise HTTPException(status_code=400, detail="Application already submitted for this college with this Email or Phone.")

    # 2. Generate Reference ID
    # Abbreviation: First letter of each word in uppercase
    import datetime
    current_year = datetime.datetime.now().year
    
    # Simple abbreviation logic
    ignore_words = ["of", "and", "the", "in", "for"]
    college_abbr = "".join([word[0].upper() for word in application.college.split() if word.lower() not in ignore_words and word.isalnum()])
    
    # Ensure at least 2 chars
    if len(college_abbr) < 2:
        college_abbr = application.college[:3].upper()
        
    random_digits = random.randint(10000, 99999)
    ref_id = f"{college_abbr}{current_year}{random_digits}"
    
    # 3. Save application (SQLite Persistence)
    try:
        marks_percentage = float(application.marksPercentage) if application.marksPercentage != "N/A" else 0.0
    except ValueError:
        marks_percentage = 0.0

    new_app = Application(
        college=application.college,
        studentName=application.studentName,
        parentName=application.parentName,
        email=application.email,
        phone=application.phone,
        gender=application.gender,
        dob=application.dob,
        community=application.community,
        address=application.address,
        qualification=application.qualification,
        stream=application.stream,
        marksPercentage=marks_percentage,
        courseApplied=application.courseApplied,
        message=application.message,
        reference_id=ref_id
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    print(f"Received Application for {application.college} from {application.studentName} ({application.email}) - Ref: {ref_id}")

    # 4. Configure SMTP (Get from ENV)
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    # Response message
    response_msg = "Application submitted successfully!"

    # Create Email (HTML)
    msg = MIMEMultipart('alternative')
    msg['From'] = smtp_user if smtp_user else "admission@college.edu"
    msg['To'] = application.email
    msg['Subject'] = f"✅ Admission Received: {application.courseApplied} @ {application.college}"

    # Plain Text Fallback
    text_body = f"""
    Dear {application.studentName},
    
    We have received your application for {application.college}.
    Course: {application.courseApplied}
    Reference ID: {ref_id}
    
    Our team will contact you shortly.
    """

    # HTML Content
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #130924 0%, #2e1065 100%); padding: 30px; text-align: center; color: white; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 700; }}
            .content {{ padding: 30px; color: #333333; }}
            .summary-box {{ background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
            .summary-item {{ margin-bottom: 10px; font-size: 14px; }}
            .label {{ font-weight: bold; color: #4b5563; width: 140px; display: inline-block; }}
            .footer {{ background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
            .btn {{ display: inline-block; background-color: #7c3aed; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 20px; }}
            .section-title {{ color: #7c3aed; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 20px; margin-bottom: 15px; font-weight: bold; font-size: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Admission Application Received</h1>
            </div>
            <div class="content">
                <p style="font-size: 16px;">Dear <strong>{application.studentName}</strong>,</p>
                <p>Congratulations! We have successfully received your application for admission to <strong>{application.college}</strong>.</p>
                
                <div class="summary-box">
                    <div style="text-align: center; margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #111;">
                        {ref_id}
                    </div>

                    <div class="section-title">Course Details</div>
                    <div class="summary-item"><span class="label">Course Applied:</span> {application.courseApplied}</div>
                    <div class="summary-item"><span class="label">College:</span> {application.college}</div>

                    <div class="section-title">Personal Details</div>
                    <div class="summary-item"><span class="label">Applicant Name:</span> {application.studentName}</div>
                    <div class="summary-item"><span class="label">Parent Name:</span> {application.parentName}</div>
                    <div class="summary-item"><span class="label">Date of Birth:</span> {application.dob}</div>
                    <div class="summary-item"><span class="label">Gender:</span> {application.gender}</div>
                    <div class="summary-item"><span class="label">Category:</span> {application.community}</div>
                    
                    <div class="section-title">Academic Profile</div>
                    <div class="summary-item"><span class="label">Qualification:</span> {application.qualification}</div>
                    <div class="summary-item"><span class="label">Stream:</span> {application.stream}</div>
                    <div class="summary-item"><span class="label">Marks:</span> {application.marksPercentage}%</div>
                    
                    <div class="section-title">Contact</div>
                    <div class="summary-item"><span class="label">Phone:</span> {application.phone}</div>
                    <div class="summary-item"><span class="label">Email:</span> {application.email}</div>
                    <div class="summary-item"><span class="label">Address:</span> {application.address}</div>
                </div>

                <p>Our admissions team will review your profile and get back to you within 3-5 business days regarding the next steps.</p>
                
                <a href="#" class="btn">View Application Status</a>
            </div>
            <div class="footer">
                <p>&copy; 2026 Student Admission Suggester. All rights reserved.</p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(text_body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    # CHECK: IF Credentials are missing, Save to File instead of Crashing/Erroring
    if not smtp_user or not smtp_password:
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"email_simulation_{timestamp}.html"
        file_path = os.path.join(BASE_DIR, filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_body)
            
        print(f"Simulated Email Saved to: {file_path}")
        return {"message": f"Application submitted! (Email simulated)", "reference_id": ref_id}

    try:
        # Send Real Email (Sync operation in thread)
        def send_email_sync():
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password.replace(" ", ""))
                server.send_message(msg)

        await asyncio.to_thread(send_email_sync)
        response_msg += " Confirmation email sent successfully."

    except Exception as e:
        print(f"Error sending email: {e}")
        response_msg += f" (Note: Email sending failed: {str(e)})"

    return {"message": response_msg, "reference_id": ref_id}

# Dashboard Authentication Logic
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
async def login(req: LoginRequest):
    # Hardcoded dashboard users
    if req.username == "admin" and req.password == "shaji":
        return {"message": "Login successful", "token": f"token_{req.username}", "role": "Super Admin"}
    
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.get("/applications")
async def get_applications(db: Session = Depends(get_db)):
    """Fetch all applications for dashboard view."""
    applications = db.query(Application).all()
    return applications

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
