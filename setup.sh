#!/bin/bash

# Course Management System - MySQL Setup Script
echo "🚀 Setting up Course Management System with MySQL..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p static/uploads
mkdir -p logs
mkdir -p instance

# Copy environment file
echo "⚙️ Setting up environment..."
cp .env.example .env

# Initialize database
echo "🗄️ Initializing database..."
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Create demo data
echo "👤 Creating demo user..."
flask init-db

echo "✅ Setup completed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Start XAMPP and ensure MySQL is running"
echo "2. Create database 'course_management' in phpMyAdmin"
echo "3. Run: python app.py"
echo "4. Open: http://localhost:5000"
echo ""
echo "🔐 Demo login:"
echo "   Email: demo@example.com"
echo "   Password: password"
