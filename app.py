from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, date, timedelta
import os
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import json
import calendar
import math
import pymysql
from sqlalchemy import text
import logging
from logging.handlers import RotatingFileHandler
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import io

# Install PyMySQL as MySQLdb for compatibility
pymysql.install_as_MySQLdb()

app = Flask(__name__)

# Configuration
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-super-secret-key-change-in-production'
    
    # MySQL Database Configuration for XAMPP
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT') or 3306)
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or ''
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE') or 'course_management'
    
    # SQLAlchemy Configuration
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {
            'connect_timeout': 60,
            'read_timeout': 60,
            'write_timeout': 60
        }
    }
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

app.config.from_object(Config)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    profile_picture = db.Column(db.String(200), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    student_id = db.Column(db.String(50), unique=True, nullable=True, index=True)
    department = db.Column(db.String(100), nullable=True)
    year_of_study = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    login_count = db.Column(db.Integer, default=0)
    
    # Relationships
    subjects = db.relationship('Subject', backref='user', lazy=True, cascade='all, delete-orphan')
    timetable_entries = db.relationship('Timetable', backref='user', lazy=True, cascade='all, delete-orphan')
    academic_calendars = db.relationship('AcademicCalendar', backref='user', lazy=True, cascade='all, delete-orphan')
    attendance_records = db.relationship('AttendanceRecord', backref='user', lazy=True, cascade='all, delete-orphan')
    notes = db.relationship('Note', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

class Subject(db.Model):
    __tablename__ = 'subjects'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    code = db.Column(db.String(20), nullable=True, index=True)
    credits = db.Column(db.Integer, default=3)
    total_classes = db.Column(db.Integer, default=0)
    attended_classes = db.Column(db.Integer, default=0)
    required_attendance = db.Column(db.Integer, default=80)
    instructor_name = db.Column(db.String(100), nullable=True)
    instructor_email = db.Column(db.String(120), nullable=True)
    room_number = db.Column(db.String(20), nullable=True)
    description = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    is_auto_created = db.Column(db.Boolean, default=False)
    last_calculated = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    attendance_records = db.relationship('AttendanceRecord', backref='subject', lazy=True, cascade='all, delete-orphan')
    notes = db.relationship('Note', backref='subject', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Subject {self.name}>'
    
    @property
    def attendance_percentage(self):
        if self.total_classes == 0:
            return 0
        return round((self.attended_classes / self.total_classes) * 100, 2)
    
    @property
    def classes_needed(self):
        if self.total_classes == 0:
            return 0
        needed = math.ceil((self.required_attendance * self.total_classes) / 100 - self.attended_classes)
        return max(0, needed)
    
    @property
    def classes_to_maintain_percentage(self):
        """Calculate classes needed to maintain required attendance percentage"""
        if self.total_classes == 0:
            return 0
        
        current_percentage = self.attendance_percentage
        if current_percentage >= self.required_attendance:
            # Calculate how many classes can be missed while maintaining percentage
            max_absences = math.floor(self.total_classes * (100 - self.required_attendance) / 100)
            current_absences = self.total_classes - self.attended_classes
            return max(0, max_absences - current_absences)
        else:
            # Calculate classes needed to reach required percentage
            return self.classes_needed

class Timetable(db.Model):
    __tablename__ = 'timetable'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    day_of_week = db.Column(db.String(10), nullable=False, index=True)
    time_slot = db.Column(db.String(20), nullable=False, index=True)
    subject_name = db.Column(db.String(100), nullable=False)
    room_number = db.Column(db.String(20), nullable=True)
    instructor_name = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Timetable {self.day_of_week} {self.time_slot} - {self.subject_name}>'

class AcademicCalendar(db.Model):
    __tablename__ = 'academic_calendars'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    semester_name = db.Column(db.String(100), nullable=False)
    academic_year = db.Column(db.String(20), nullable=True)
    start_date = db.Column(db.Date, nullable=False, index=True)
    end_date = db.Column(db.Date, nullable=False, index=True)
    weekend_days = db.Column(db.Text, default='[0,6]')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    holidays = db.relationship('Holiday', backref='calendar', lazy=True, cascade='all, delete-orphan')
    holiday_periods = db.relationship('HolidayPeriod', backref='calendar', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<AcademicCalendar {self.semester_name}>'

class Holiday(db.Model):
    __tablename__ = 'holidays'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default='general')
    calendar_id = db.Column(db.Integer, db.ForeignKey('academic_calendars.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_recurring = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Holiday {self.name} - {self.date}>'

class HolidayPeriod(db.Model):
    __tablename__ = 'holiday_periods'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False, index=True)
    end_date = db.Column(db.Date, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default='vacation')
    calendar_id = db.Column(db.Integer, db.ForeignKey('academic_calendars.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<HolidayPeriod {self.name} ({self.start_date} - {self.end_date})>'

class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_records'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(db.String(10), nullable=False, index=True)
    notes = db.Column(db.Text, nullable=True)
    marked_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<AttendanceRecord {self.date} - {self.status}>'

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tags = db.Column(db.Text, nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_accessed = db.Column(db.DateTime, nullable=True)
    access_count = db.Column(db.Integer, default=0)
    is_favorite = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Note {self.original_filename}>'
    
    @property
    def is_image(self):
        return self.file_type.startswith('image/') or self.original_filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'))
    
    @property
    def is_pdf(self):
        return self.file_type == 'application/pdf' or self.original_filename.lower().endswith('.pdf')
    
    @property
    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)

# Helper Functions
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_file_icon(filename):
    """Get appropriate icon for file type"""
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if ext in ['pdf']:
        return 'file-text'
    elif ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']:
        return 'image'
    elif ext in ['doc', 'docx']:
        return 'file-text'
    elif ext in ['txt']:
        return 'file-text'
    else:
        return 'file'

def init_database():
    try:
        db.create_all()
        
        demo_user = User.query.filter_by(email='demo@example.com').first()
        if not demo_user:
            demo_user = User(
                username='demo',
                email='demo@example.com',
                full_name='Demo User',
                student_id='DEMO001',
                department='Computer Science',
                year_of_study=3
            )
            demo_user.set_password('password')
            db.session.add(demo_user)
            
            sample_subjects = [
                {'name': 'Data Structures', 'code': 'CS201', 'credits': 4, 'total_classes': 45, 'attended_classes': 38},
                {'name': 'Database Systems', 'code': 'CS301', 'credits': 3, 'total_classes': 40, 'attended_classes': 35},
                {'name': 'Web Development', 'code': 'CS302', 'credits': 3, 'total_classes': 35, 'attended_classes': 32},
                {'name': 'Software Engineering', 'code': 'CS401', 'credits': 4, 'total_classes': 50, 'attended_classes': 42}
            ]
            
            for subject_data in sample_subjects:
                subject = Subject(user_id=demo_user.id, **subject_data)
                db.session.add(subject)
            
            # Add sample timetable entries
            sample_timetable = [
                {'day_of_week': 'Monday', 'time_slot': '09:00-10:00', 'subject_name': 'Data Structures', 'room_number': 'CS-101', 'instructor_name': 'Dr. Smith'},
                {'day_of_week': 'Monday', 'time_slot': '10:00-11:00', 'subject_name': 'Database Systems', 'room_number': 'CS-102', 'instructor_name': 'Prof. Johnson'},
                {'day_of_week': 'Tuesday', 'time_slot': '09:00-10:00', 'subject_name': 'Web Development', 'room_number': 'CS-103', 'instructor_name': 'Dr. Brown'},
                {'day_of_week': 'Wednesday', 'time_slot': '11:00-12:00', 'subject_name': 'Software Engineering', 'room_number': 'CS-104', 'instructor_name': 'Prof. Davis'},
            ]
            
            for timetable_data in sample_timetable:
                timetable_entry = Timetable(user_id=demo_user.id, **timetable_data)
                db.session.add(timetable_entry)
            
            db.session.commit()
            print("✅ Demo user and sample data created successfully!")
        
        print("✅ Database initialized successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        db.session.rollback()
        return False

# Authentication Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash('Please enter both email and password.', 'error')
            return render_template('auth/login.html')
        
        try:
            user = User.query.filter_by(email=email, is_active=True).first()
            
            if user and user.check_password(password):
                user.last_login = datetime.utcnow()
                user.login_count += 1
                db.session.commit()
                
                session['user_id'] = user.id
                session['full_name'] = user.full_name
                session['email'] = user.email
                session['username'] = user.username
                
                flash(f'Welcome back, {user.full_name}!', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Invalid email or password. Please try again.', 'error')
                
        except Exception as e:
            app.logger.error(f'Login error: {str(e)}')
            flash('An error occurred during login. Please try again.', 'error')
    
    return render_template('auth/login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        try:
            full_name = request.form.get('full_name', '').strip()
            username = request.form.get('username', '').strip().lower()
            email = request.form.get('email', '').strip().lower()
            password = request.form.get('password', '')
            confirm_password = request.form.get('confirm_password', '')
            student_id = request.form.get('student_id', '').strip()
            department = request.form.get('department', '').strip()
            year_of_study = request.form.get('year_of_study')
            phone_number = request.form.get('phone_number', '').strip()
            
            if not all([full_name, username, email, password, confirm_password]):
                flash('Please fill in all required fields.', 'error')
                return render_template('auth/signup.html')
            
            if password != confirm_password:
                flash('Passwords do not match.', 'error')
                return render_template('auth/signup.html')
            
            if len(password) < 6:
                flash('Password must be at least 6 characters long.', 'error')
                return render_template('auth/signup.html')
            
            if User.query.filter_by(email=email).first():
                flash('Email address already registered.', 'error')
                return render_template('auth/signup.html')
            
            if User.query.filter_by(username=username).first():
                flash('Username already taken.', 'error')
                return render_template('auth/signup.html')
            
            user = User(
                full_name=full_name,
                username=username,
                email=email,
                student_id=student_id if student_id else None,
                department=department if department else None,
                year_of_study=int(year_of_study) if year_of_study else None,
                phone_number=phone_number if phone_number else None
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            session['user_id'] = user.id
            session['full_name'] = user.full_name
            session['email'] = user.email
            session['username'] = user.username
            
            flash(f'Account created successfully! Welcome, {user.full_name}!', 'success')
            return redirect(url_for('dashboard'))
            
        except Exception as e:
            db.session.rollback()
            app.logger.error(f'Signup error: {str(e)}')
            flash('An error occurred during registration. Please try again.', 'error')
    
    return render_template('auth/signup.html')

@app.route('/logout')
def logout():
    user_name = session.get('full_name', 'User')
    session.clear()
    flash(f'Goodbye, {user_name}! You have been logged out successfully.', 'success')
    return redirect(url_for('login'))

# Main Application Routes
@app.route('/')
@login_required
def dashboard():
    try:
        user_id = session['user_id']
        subjects = Subject.query.filter_by(user_id=user_id, is_active=True).all()
        
        total_subjects = len(subjects)
        avg_attendance = 0
        total_files = Note.query.filter_by(user_id=user_id).count()
        
        if subjects:
            total_attendance = sum(s.attendance_percentage for s in subjects)
            avg_attendance = round(total_attendance / len(subjects))
        
        recent_attendance = db.session.query(AttendanceRecord, Subject).join(Subject).filter(
            AttendanceRecord.user_id == user_id
        ).order_by(AttendanceRecord.created_at.desc()).limit(5).all()
        
        today = datetime.now().strftime('%A')
        today_classes = Timetable.query.filter_by(
            user_id=user_id, 
            day_of_week=today,
            is_active=True
        ).order_by(Timetable.time_slot).all()
        
        return render_template('dashboard.html', 
                             subjects=subjects,
                             total_subjects=total_subjects,
                             avg_attendance=avg_attendance,
                             total_files=total_files,
                             recent_attendance=recent_attendance,
                             today_classes=today_classes,
                             datetime=datetime)
                             
    except Exception as e:
        app.logger.error(f'Dashboard error: {str(e)}')
        flash('An error occurred loading the dashboard.', 'error')
        return render_template('dashboard.html', subjects=[], total_subjects=0, avg_attendance=0, total_files=0)

@app.route('/subjects')
@login_required
def subjects():
    try:
        user_id = session['user_id']
        subjects = Subject.query.filter_by(user_id=user_id, is_active=True).order_by(Subject.name).all()
        
        # Get file counts for each subject
        for subject in subjects:
            subject.file_count = Note.query.filter_by(subject_id=subject.id, user_id=user_id).count()
            subject.files = Note.query.filter_by(subject_id=subject.id, user_id=user_id).order_by(Note.upload_date.desc()).limit(5).all()
        
        return render_template('subjects.html', subjects=subjects)
    except Exception as e:
        app.logger.error(f'Subjects page error: {str(e)}')
        flash('An error occurred loading subjects.', 'error')
        return render_template('subjects.html', subjects=[])

@app.route('/subject/<int:subject_id>')
@login_required
def subject_detail(subject_id):
    try:
        user_id = session['user_id']
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id, is_active=True).first_or_404()
        
        # Get all files for this subject
        files = Note.query.filter_by(subject_id=subject_id, user_id=user_id).order_by(Note.upload_date.desc()).all()
        
        # Get attendance records for this subject
        attendance_records = AttendanceRecord.query.filter_by(
            subject_id=subject_id, 
            user_id=user_id
        ).order_by(AttendanceRecord.date.desc()).limit(10).all()
        
        return render_template('subject_detail.html', 
                             subject=subject, 
                             files=files, 
                             attendance_records=attendance_records)
    except Exception as e:
        app.logger.error(f'Subject detail error: {str(e)}')
        flash('An error occurred loading subject details.', 'error')
        return redirect(url_for('subjects'))

@app.route('/add_subject', methods=['POST'])
@login_required
def add_subject():
    try:
        user_id = session['user_id']
        
        name = request.form.get('name', '').strip()
        code = request.form.get('code', '').strip()
        credits = int(request.form.get('credits', 3))
        total_classes = int(request.form.get('total_classes', 0))
        attended_classes = int(request.form.get('attended_classes', 0))
        required_attendance = int(request.form.get('required_attendance', 80))
        instructor_name = request.form.get('instructor_name', '').strip()
        instructor_email = request.form.get('instructor_email', '').strip()
        room_number = request.form.get('room_number', '').strip()
        description = request.form.get('description', '').strip()
        
        if not name:
            flash('Subject name is required.', 'error')
            return redirect(url_for('subjects'))
        
        if attended_classes > total_classes:
            flash('Attended classes cannot be more than total classes.', 'error')
            return redirect(url_for('subjects'))
        
        existing_subject = Subject.query.filter_by(user_id=user_id, name=name, is_active=True).first()
        if existing_subject:
            flash(f'Subject "{name}" already exists.', 'error')
            return redirect(url_for('subjects'))
        
        subject = Subject(
            name=name,
            code=code if code else None,
            credits=credits,
            total_classes=total_classes,
            attended_classes=attended_classes,
            required_attendance=required_attendance,
            instructor_name=instructor_name if instructor_name else None,
            instructor_email=instructor_email if instructor_email else None,
            room_number=room_number if room_number else None,
            description=description if description else None,
            user_id=user_id
        )
        
        db.session.add(subject)
        db.session.commit()
        
        flash(f'Subject "{name}" added successfully!', 'success')
        
    except ValueError as e:
        flash('Please enter valid numbers for numeric fields.', 'error')
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Add subject error: {str(e)}')
        flash('An error occurred while adding the subject.', 'error')
    
    return redirect(url_for('subjects'))

@app.route('/edit_subject/<int:subject_id>', methods=['GET', 'POST'])
@login_required
def edit_subject(subject_id):
    try:
        user_id = session['user_id']
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id, is_active=True).first_or_404()
        
        if request.method == 'POST':
            name = request.form.get('name', '').strip()
            code = request.form.get('code', '').strip()
            credits = int(request.form.get('credits', 3))
            total_classes = int(request.form.get('total_classes', 0))
            attended_classes = int(request.form.get('attended_classes', 0))
            required_attendance = int(request.form.get('required_attendance', 80))
            instructor_name = request.form.get('instructor_name', '').strip()
            instructor_email = request.form.get('instructor_email', '').strip()
            room_number = request.form.get('room_number', '').strip()
            description = request.form.get('description', '').strip()
            
            if not name:
                flash('Subject name is required.', 'error')
                return render_template('edit_subject.html', subject=subject)
            
            if attended_classes > total_classes:
                flash('Attended classes cannot be more than total classes.', 'error')
                return render_template('edit_subject.html', subject=subject)
            
            subject.name = name
            subject.code = code if code else None
            subject.credits = credits
            subject.total_classes = total_classes
            subject.attended_classes = attended_classes
            subject.required_attendance = required_attendance
            subject.instructor_name = instructor_name if instructor_name else None
            subject.instructor_email = instructor_email if instructor_email else None
            subject.room_number = room_number if room_number else None
            subject.description = description if description else None
            subject.updated_at = datetime.utcnow()
            
            db.session.commit()
            flash(f'Subject "{subject.name}" updated successfully!', 'success')
            return redirect(url_for('subjects'))
        
        return render_template('edit_subject.html', subject=subject)
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Edit subject error: {str(e)}')
        flash('An error occurred while updating the subject.', 'error')
        return redirect(url_for('subjects'))

@app.route('/delete_subject/<int:subject_id>')
@login_required
def delete_subject(subject_id):
    try:
        user_id = session['user_id']
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id, is_active=True).first_or_404()
        
        subject_name = subject.name
        subject.is_active = False
        subject.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash(f'Subject "{subject_name}" deleted successfully!', 'success')
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Delete subject error: {str(e)}')
        flash('An error occurred while deleting the subject.', 'error')
    
    return redirect(url_for('subjects'))

# Timetable Management Routes
@app.route('/timetable')
@login_required
def timetable():
    try:
        user_id = session['user_id']
        timetable_entries = Timetable.query.filter_by(user_id=user_id, is_active=True).all()
        subjects = Subject.query.filter_by(user_id=user_id, is_active=True).all()
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        time_slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
                     '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']
        
        timetable_grid = {}
        for day in days:
            timetable_grid[day] = {}
            for slot in time_slots:
                timetable_grid[day][slot] = None
        
        for entry in timetable_entries:
            if entry.day_of_week in timetable_grid and entry.time_slot in timetable_grid[entry.day_of_week]:
                timetable_grid[entry.day_of_week][entry.time_slot] = entry
        
        current_day = datetime.now().strftime('%A')
        
        return render_template('timetable.html', 
                             timetable_grid=timetable_grid,
                             timetable_data=timetable_grid,
                             days=days,
                             time_slots=time_slots,
                             subjects=subjects,
                             current_day=current_day,
                             datetime=datetime)
    except Exception as e:
        app.logger.error(f'Timetable page error: {str(e)}')
        flash('An error occurred loading timetable.', 'error')
        return render_template('timetable.html', timetable_grid={}, days=[], time_slots=[])

@app.route('/add_timetable_entry', methods=['POST'])
@login_required
def add_timetable_entry():
    try:
        user_id = session['user_id']
        
        day_of_week = request.form.get('day_of_week', '').strip()
        time_slot = request.form.get('time_slot', '').strip()
        subject_name = request.form.get('subject_name', '').strip()
        room_number = request.form.get('room_number', '').strip()
        instructor_name = request.form.get('instructor_name', '').strip()
        
        if not all([day_of_week, time_slot, subject_name]):
            flash('Day, time slot, and subject name are required.', 'error')
            return redirect(url_for('timetable'))
        
        # Check if entry already exists for this time slot
        existing_entry = Timetable.query.filter_by(
            user_id=user_id,
            day_of_week=day_of_week,
            time_slot=time_slot,
            is_active=True
        ).first()
        
        if existing_entry:
            flash(f'A class is already scheduled for {day_of_week} at {time_slot}.', 'error')
            return redirect(url_for('timetable'))
        
        # Create new timetable entry
        timetable_entry = Timetable(
            user_id=user_id,
            day_of_week=day_of_week,
            time_slot=time_slot,
            subject_name=subject_name,
            room_number=room_number if room_number else None,
            instructor_name=instructor_name if instructor_name else None
        )
        
        db.session.add(timetable_entry)
        
        # Auto-create subject if it doesn't exist
        existing_subject = Subject.query.filter_by(
            user_id=user_id,
            name=subject_name,
            is_active=True
        ).first()
        
        if not existing_subject:
            new_subject = Subject(
                user_id=user_id,
                name=subject_name,
                instructor_name=instructor_name if instructor_name else None,
                room_number=room_number if room_number else None,
                is_auto_created=True
            )
            db.session.add(new_subject)
            flash(f'Subject "{subject_name}" was automatically created.', 'info')
        
        db.session.commit()
        flash(f'Class added successfully for {day_of_week} at {time_slot}!', 'success')
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Add timetable entry error: {str(e)}')
        flash('An error occurred while adding the class.', 'error')
    
    return redirect(url_for('timetable'))

@app.route('/edit_timetable_entry/<int:entry_id>', methods=['GET', 'POST'])
@login_required
def edit_timetable_entry(entry_id):
    try:
        user_id = session['user_id']
        entry = Timetable.query.filter_by(id=entry_id, user_id=user_id, is_active=True).first_or_404()
        
        if request.method == 'POST':
            day_of_week = request.form.get('day_of_week', '').strip()
            time_slot = request.form.get('time_slot', '').strip()
            subject_name = request.form.get('subject_name', '').strip()
            room_number = request.form.get('room_number', '').strip()
            instructor_name = request.form.get('instructor_name', '').strip()
            
            if not all([day_of_week, time_slot, subject_name]):
                flash('Day, time slot, and subject name are required.', 'error')
                return render_template('edit_timetable_entry.html', entry=entry)
            
            # Check if another entry exists for this time slot (excluding current entry)
            existing_entry = Timetable.query.filter_by(
                user_id=user_id,
                day_of_week=day_of_week,
                time_slot=time_slot,
                is_active=True
            ).filter(Timetable.id != entry_id).first()
            
            if existing_entry:
                flash(f'Another class is already scheduled for {day_of_week} at {time_slot}.', 'error')
                return render_template('edit_timetable_entry.html', entry=entry)
            
            # Update entry
            entry.day_of_week = day_of_week
            entry.time_slot = time_slot
            entry.subject_name = subject_name
            entry.room_number = room_number if room_number else None
            entry.instructor_name = instructor_name if instructor_name else None
            entry.updated_at = datetime.utcnow()
            
            db.session.commit()
            flash('Class updated successfully!', 'success')
            return redirect(url_for('timetable'))
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        time_slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
                     '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']
        
        return render_template('edit_timetable_entry.html', entry=entry, days=days, time_slots=time_slots)
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Edit timetable entry error: {str(e)}')
        flash('An error occurred while updating the class.', 'error')
        return redirect(url_for('timetable'))

@app.route('/delete_timetable_entry/<int:entry_id>')
@login_required
def delete_timetable_entry(entry_id):
    try:
        user_id = session['user_id']
        entry = Timetable.query.filter_by(id=entry_id, user_id=user_id, is_active=True).first_or_404()
        
        subject_name = entry.subject_name
        day_time = f"{entry.day_of_week} at {entry.time_slot}"
        
        entry.is_active = False
        entry.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash(f'Class "{subject_name}" removed from {day_time}!', 'success')
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Delete timetable entry error: {str(e)}')
        flash('An error occurred while deleting the class.', 'error')
    
    return redirect(url_for('timetable'))

# File Management Routes
@app.route('/upload_file/<int:subject_id>', methods=['POST'])
@login_required
def upload_file(subject_id):
    try:
        user_id = session['user_id']
        
        # Verify subject belongs to user
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id, is_active=True).first()
        if not subject:
            return jsonify({'success': False, 'message': 'Subject not found'})
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file selected'})
        
        file = request.files['file']
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'})
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            file.save(file_path)
            
            note = Note(
                subject_id=subject_id,
                user_id=user_id,
                title=title if title else filename,
                filename=unique_filename,
                original_filename=filename,
                file_size=os.path.getsize(file_path),
                file_type=file.content_type or 'application/octet-stream',
                description=description if description else None
            )
            
            db.session.add(note)
            db.session.commit()
            
            return jsonify({
                'success': True, 
                'message': f'File "{filename}" uploaded successfully!',
                'file': {
                    'id': note.id,
                    'title': note.title,
                    'filename': note.original_filename,
                    'size': note.file_size_mb,
                    'type': note.file_type,
                    'is_image': note.is_image,
                    'is_pdf': note.is_pdf,
                    'upload_date': note.upload_date.strftime('%Y-%m-%d %H:%M')
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid file type'})
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Upload file error: {str(e)}')
        return jsonify({'success': False, 'message': 'An error occurred while uploading the file'})

@app.route('/download_file/<int:file_id>')
@login_required
def download_file(file_id):
    try:
        user_id = session['user_id']
        note = Note.query.filter_by(id=file_id, user_id=user_id).first_or_404()
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], note.filename)
        
        if not os.path.exists(file_path):
            flash('File not found.', 'error')
            return redirect(url_for('subjects'))
        
        note.last_accessed = datetime.utcnow()
        note.access_count += 1
        db.session.commit()
        
        return send_file(file_path, as_attachment=True, download_name=note.original_filename)
        
    except Exception as e:
        app.logger.error(f'Download file error: {str(e)}')
        flash('An error occurred while downloading the file.', 'error')
        return redirect(url_for('subjects'))

@app.route('/delete_file/<int:file_id>')
@login_required
def delete_file(file_id):
    try:
        user_id = session['user_id']
        note = Note.query.filter_by(id=file_id, user_id=user_id).first_or_404()
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], note.filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'success': True, 'message': f'File "{note.original_filename}" deleted successfully!'})
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Delete file error: {str(e)}')
        return jsonify({'success': False, 'message': 'An error occurred while deleting the file'})

# Attendance Management Routes
@app.route('/attendance')
@login_required
def attendance():
    try:
        user_id = session['user_id']
        subjects = Subject.query.filter_by(user_id=user_id, is_active=True).all()
        recent_records = db.session.query(AttendanceRecord, Subject).join(Subject).filter(
            AttendanceRecord.user_id == user_id
        ).order_by(AttendanceRecord.created_at.desc()).limit(10).all()
        
        return render_template('attendance.html', subjects=subjects, recent_records=recent_records)
    except Exception as e:
        app.logger.error(f'Attendance page error: {str(e)}')
        flash('An error occurred loading attendance page.', 'error')
        return render_template('attendance.html', subjects=[], recent_records=[])

@app.route('/mark_attendance', methods=['POST'])
@login_required
def mark_attendance():
    try:
        user_id = session['user_id']
        subject_id = request.form.get('subject_id')
        status = request.form.get('status')
        notes = request.form.get('notes', '').strip()
        attendance_date = request.form.get('date', date.today().isoformat())
        
        if not all([subject_id, status]):
            return jsonify({'success': False, 'message': 'Missing required fields'})
        
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id, is_active=True).first()
        if not subject:
            return jsonify({'success': False, 'message': 'Subject not found'})
        
        attendance_date = datetime.strptime(attendance_date, '%Y-%m-%d').date()
        
        existing_record = AttendanceRecord.query.filter_by(
            subject_id=subject_id,
            user_id=user_id,
            date=attendance_date
        ).first()
        
        if existing_record:
            old_status = existing_record.status
            existing_record.status = status
            existing_record.notes = notes if notes else None
            existing_record.marked_at = datetime.utcnow()
            
            # Update subject attendance counts
            if old_status == 'present' and status != 'present':
                subject.attended_classes = max(0, subject.attended_classes - 1)
            elif old_status != 'present' and status == 'present':
                subject.attended_classes += 1
        else:
            record = AttendanceRecord(
                subject_id=subject_id,
                user_id=user_id,
                date=attendance_date,
                status=status,
                notes=notes if notes else None
            )
            db.session.add(record)
            
            # Update subject attendance counts
            if status == 'present':
                subject.attended_classes += 1
            
            # Increment total classes if this is a new date
            subject.total_classes += 1
        
        subject.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Attendance marked successfully',
            'attendance_percentage': subject.attendance_percentage,
            'classes_needed': subject.classes_needed
        })
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Mark attendance error: {str(e)}')
        return jsonify({'success': False, 'message': 'An error occurred'})

# Academic Calendar Routes
@app.route('/academic_calendar')
@login_required
def academic_calendar():
    try:
        user_id = session['user_id']
        calendars = AcademicCalendar.query.filter_by(user_id=user_id, is_active=True).all()
        holidays = Holiday.query.filter_by(user_id=user_id).all()
        holiday_periods = HolidayPeriod.query.filter_by(user_id=user_id).all()
        
        return render_template('academic_calendar.html', 
                             calendars=calendars, 
                             holidays=holidays, 
                             holiday_periods=holiday_periods)
    except Exception as e:
        app.logger.error(f'Academic calendar page error: {str(e)}')
        flash('An error occurred loading academic calendar.', 'error')
        return render_template('academic_calendar.html', calendars=[])

@app.route('/save_academic_calendar', methods=['POST'])
@login_required
def save_academic_calendar():
    try:
        user_id = session['user_id']
        
        semester_name = request.form.get('semester_name', '').strip()
        academic_year = request.form.get('academic_year', '').strip()
        start_date = request.form.get('start_date')
        end_date = request.form.get('end_date')
        
        # Get weekend days
        weekend_days = []
        for i in range(7):
            if request.form.get(f'weekend_{i}'):
                weekend_days.append(i)
        
        if not all([semester_name, start_date, end_date]):
            flash('Semester name, start date, and end date are required.', 'error')
            return redirect(url_for('academic_calendar'))
        
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        if start_date >= end_date:
            flash('End date must be after start date.', 'error')
            return redirect(url_for('academic_calendar'))
        
        # Deactivate existing calendars
        existing_calendars = AcademicCalendar.query.filter_by(user_id=user_id, is_active=True).all()
        for cal in existing_calendars:
            cal.is_active = False
        
        # Create new calendar
        calendar = AcademicCalendar(
            user_id=user_id,
            semester_name=semester_name,
            academic_year=academic_year if academic_year else None,
            start_date=start_date,
            end_date=end_date,
            weekend_days=json.dumps(weekend_days)
        )
        
        db.session.add(calendar)
        db.session.commit()
        
        flash('Academic calendar saved successfully!', 'success')
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Save academic calendar error: {str(e)}')
        flash('An error occurred while saving the calendar.', 'error')
    
    return redirect(url_for('academic_calendar'))

# Reports Routes
@app.route('/reports')
@login_required
def reports():
    try:
        user_id = session['user_id']
        subjects = Subject.query.filter_by(user_id=user_id, is_active=True).all()
        
        report_data = []
        for subject in subjects:
            report_data.append({
                'subject': subject,
                'attendance_percentage': subject.attendance_percentage,
                'classes_needed': subject.classes_needed,
                'classes_to_maintain': subject.classes_to_maintain_percentage,
                'status': 'Good' if subject.attendance_percentage >= subject.required_attendance else 'Warning'
            })
        
        return render_template('reports.html', report_data=report_data)
    except Exception as e:
        app.logger.error(f'Reports page error: {str(e)}')
        flash('An error occurred loading reports.', 'error')
        return render_template('reports.html', report_data=[])

@app.route('/generate_report_pdf')
@login_required
def generate_report_pdf():
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        subjects = Subject.query.filter_by(user_id=user_id, is_active=True).all()
        
        # Create PDF in memory
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, f"Attendance Report - {user.full_name}")
        
        # Date
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 70, f"Generated on: {datetime.now().strftime('%B %d, %Y')}")
        
        # Headers
        y = height - 120
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Subject")
        p.drawString(200, y, "Attendance %")
        p.drawString(300, y, "Classes")
        p.drawString(400, y, "Status")
        p.drawString(500, y, "Classes Needed")
        
        # Draw line
        p.line(50, y - 5, 550, y - 5)
        
        # Data
        y -= 25
        p.setFont("Helvetica", 10)
        
        for subject in subjects:
            if y < 100:  # New page if needed
                p.showPage()
                y = height - 50
            
            p.drawString(50, y, subject.name[:20])
            p.drawString(200, y, f"{subject.attendance_percentage}%")
            p.drawString(300, y, f"{subject.attended_classes}/{subject.total_classes}")
            
            status = "Good" if subject.attendance_percentage >= subject.required_attendance else "Warning"
            p.drawString(400, y, status)
            p.drawString(500, y, str(subject.classes_needed))
            
            y -= 20
        
        p.save()
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"attendance_report_{datetime.now().strftime('%Y%m%d')}.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        app.logger.error(f'Generate report PDF error: {str(e)}')
        flash('An error occurred while generating the report.', 'error')
        return redirect(url_for('reports'))

# Notes Routes
@app.route('/notes')
@login_required
def notes():
    try:
        user_id = session['user_id']
        subjects = Subject.query.filter_by(user_id=user_id, is_active=True).all()
        notes = Note.query.filter_by(user_id=user_id).order_by(Note.upload_date.desc()).all()
        return render_template('notes.html', subjects=subjects, notes=notes)
    except Exception as e:
        app.logger.error(f'Notes page error: {str(e)}')
        flash('An error occurred loading notes page.', 'error')
        return render_template('notes.html', subjects=[], notes=[])

# Settings Routes
@app.route('/settings')
@login_required
def settings():
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        return render_template('settings.html', user=user)
    except Exception as e:
        app.logger.error(f'Settings page error: {str(e)}')
        flash('An error occurred loading settings page.', 'error')
        return render_template('settings.html', user=None)

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        user.full_name = request.form.get('full_name', '').strip()
        user.email = request.form.get('email', '').strip().lower()
        user.phone_number = request.form.get('phone_number', '').strip()
        user.department = request.form.get('department', '').strip()
        user.year_of_study = int(request.form.get('year_of_study')) if request.form.get('year_of_study') else None
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Update session
        session['full_name'] = user.full_name
        session['email'] = user.email
        
        flash('Profile updated successfully!', 'success')
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Update profile error: {str(e)}')
        flash('An error occurred while updating profile.', 'error')
    
    return redirect(url_for('settings'))

@app.route('/change_password', methods=['POST'])
@login_required
def change_password():
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        current_password = request.form.get('current_password', '')
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if not user.check_password(current_password):
            flash('Current password is incorrect.', 'error')
            return redirect(url_for('settings'))
        
        if new_password != confirm_password:
            flash('New passwords do not match.', 'error')
            return redirect(url_for('settings'))
        
        if len(new_password) < 6:
            flash('New password must be at least 6 characters long.', 'error')
            return redirect(url_for('settings'))
        
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        flash('Password changed successfully!', 'success')
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Change password error: {str(e)}')
        flash('An error occurred while changing password.', 'error')
    
    return redirect(url_for('settings'))

# Route Testing
@app.route('/route_testing')
@login_required
def route_testing():
    try:
        routes = [
            {'name': 'Dashboard', 'path': '/', 'description': 'Main dashboard'},
            {'name': 'Subjects', 'path': '/subjects', 'description': 'Subject management'},
            {'name': 'Timetable', 'path': '/timetable', 'description': 'Schedule management'},
            {'name': 'Academic Calendar', 'path': '/academic_calendar', 'description': 'Calendar setup'},
            {'name': 'Attendance', 'path': '/attendance', 'description': 'Attendance tracking'},
            {'name': 'Reports', 'path': '/reports', 'description': 'Analytics and reports'},
            {'name': 'Notes', 'path': '/notes', 'description': 'File management'},
            {'name': 'Settings', 'path': '/settings', 'description': 'User preferences'},
        ]
        return render_template('route_testing.html', routes=routes)
    except Exception as e:
        app.logger.error(f'Route testing page error: {str(e)}')
        flash('An error occurred loading route testing page.', 'error')
        return render_template('route_testing.html', routes=[])

# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500

@app.errorhandler(403)
def forbidden_error(error):
    return render_template('errors/403.html'), 403

if __name__ == '__main__':
    with app.app_context():
        if init_database():
            print("✅ Database initialization completed!")
        else:
            print("❌ Database initialization failed!")
            exit(1)
    
    print("\n" + "="*60)
    print("🚀 STUDYTRACKER - PROFESSIONAL MATTE BLACK EDITION")
    print("="*60)
    print("🌐 Server: http://localhost:5000")
    print("🗄️  Database: MySQL (course_management)")
    print("🎨 Theme: Professional Matte Black")
    print("")
    print("✨ FEATURES:")
    print("   • Professional matte black design")
    print("   • Complete attendance tracking")
    print("   • Advanced subject management")
    print("   • File upload/download system")
    print("   • Academic calendar integration")
    print("   • Comprehensive reporting")
    print("   • Full timetable management")
    print("   • Mobile-responsive design")
    print("")
    print("🔐 DEMO LOGIN:")
    print("   Email: demo@example.com")
    print("   Password: password")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
