from sqlalchemy import Column, Integer, String, Float, Text, Date
from database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    college = Column(String, index=True)
    studentName = Column(String)
    parentName = Column(String)
    email = Column(String)
    phone = Column(String)
    gender = Column(String)
    dob = Column(String)
    community = Column(String)
    address = Column(Text)
    qualification = Column(String)
    stream = Column(String)
    marksPercentage = Column(Float)
    courseApplied = Column(String)
    message = Column(Text, nullable=True)
    reference_id = Column(String, index=True)
