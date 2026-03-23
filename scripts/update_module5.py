#!/usr/bin/env python3
"""
Update Smartwatch Module 5 (Design Challenge) lessons in the D1 database.
"""

import subprocess
import json

def escape_sql(s):
    if not s:
        return ''
    return s.replace("'", "''")

def run_sql(sql):
    cmd = ['npx', 'wrangler', 'd1', 'execute', 'shortcircuits-db', '--remote', '--command', sql]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, cwd='/home/user/webapp')
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception: {e}")
        return False

def update_lesson(lesson_id, description, content_json):
    escaped_desc = escape_sql(description)
    escaped_content = escape_sql(json.dumps(content_json))
    sql = f"UPDATE lessons SET description='{escaped_desc}', content_json='{escaped_content}' WHERE id='{lesson_id}'"
    print(f"Updating {lesson_id}...", end=' ')
    if run_sql(sql):
        print("OK")
        return True
    else:
        print("FAILED")
        return False

lessons = []

# ============================================
# MODULE 5: DESIGN CHALLENGE
# ============================================

# lesson-5-overview: Short Circuit Design Challenge
lessons.append({
    "id": "lesson-5-overview",
    "description": "Learn about the Short Circuit Design Challenge and how to participate.",
    "content_json": [
        {"type":"text","content":"The Short Circuit Design Challenge is our way of recognizing exceptional engineering work. While our project kits establish a strong technical foundation, this challenge is designed for students who extend that foundation through innovation, thoughtful design, and rigorous execution."},
        {"type":"text","content":"Participants are encouraged to move beyond baseline functionality and demonstrate how engineering decisions, system architecture, and creativity come together in a cohesive final product."},
        {"type":"subheading","content":"Awards and Recognition"},
        {"type":"subheading","content":"Cash Prizes"},
        {"type":"bullets","content":["First Place: $1,000","Second Place: $750","Third Place: $500"]},
        {"type":"subheading","content":"Website Recognition"},
        {"type":"text","content":"Winning projects will be featured on the Short Circuit website and highlighted with a project demonstration and a short contributor profile. This public recognition can be shared with recruiters, academic programs, and professional networks."},
        {"type":"subheading","content":"Certificate of Achievement"},
        {"type":"text","content":"Recipients will earn a verified Certificate of Achievement acknowledging design excellence. This credential may be displayed on professional platforms such as LinkedIn or included in portfolios and resumes."},
        {"type":"subheading","content":"Exclusive Opportunities"},
        {"type":"text","content":"Winners will receive a complimentary future project kit and gain access to a private mentorship and career opportunities group, providing continued engagement with engineers, founders, and industry professionals."},
        {"type":"subheading","content":"Project Extension Opportunities"},
        {"type":"text","content":"To participate in the Design Challenge, students must meaningfully extend the baseline smartwatch project. The examples below illustrate possible directions for expansion."},
        {"type":"subheading","content":"System Architecture and Software Design"},
        {"type":"bullets","content":["Develop a desktop, web, or mobile dashboard to visualize live smartwatch data","Design a companion application for monitoring activity, battery status, or time statistics","Implement firmware update mechanisms or modular feature expansion"]},
        {"type":"subheading","content":"Power Management and Performance Optimization"},
        {"type":"bullets","content":["Design adaptive power management strategies based on user behavior","Implement advanced sleep and wake mechanisms to extend battery life","Analyze and visualize power consumption across system components"]},
        {"type":"subheading","content":"Health, Motion, and Activity Analysis"},
        {"type":"bullets","content":["Implement step counting, calorie estimation, and activity classification algorithms","Create daily, weekly, or long term activity summaries","Detect and classify motion patterns using accelerometer data"]},
        {"type":"subheading","content":"User Interface and User Experience"},
        {"type":"bullets","content":["Design custom watch faces or interactive display layouts","Implement gesture based navigation or animated transitions","Improve usability through thoughtful visual hierarchy and interaction design"]},
        {"type":"subheading","content":"Networking, Data, and Cloud Integration"},
        {"type":"bullets","content":["Synchronize data with cloud services or external databases","Develop analytics tools for long term data tracking","Implement secure data transfer and authentication mechanisms"]},
        {"type":"subheading","content":"Creative and Experimental Extensions"},
        {"type":"bullets","content":["Design productivity tools such as timers or focus modes","Create adaptive alarms or notifications based on sensor input","Integrate additional peripherals or explore novel interaction concepts"]},
        {"type":"text","content":"The examples provided are starting points. The strongest projects often explore ideas beyond those listed here."},
        {"type":"text","content":"We invite you to apply the concepts and techniques developed throughout this program to create a project that reflects your approach to engineering problem solving. We look forward to reviewing your work and recognizing outstanding contributions through the Short Circuit Design Challenge."},
        {"type":"callout","content":"You must be an active university student to enter the design challenge. You will need to provide a university email to get consideration."}
    ]
})

# lesson-5-baseline: Submit Your Final Project
lessons.append({
    "id": "lesson-5-baseline",
    "description": "Upload your completed baseline Smartwatch project.",
    "content_json": [
        {"type":"subheading","content":"Baseline Project Upload"},
        {"type":"text","content":"Upload a zip file with your basic project contents here. The zip file should include your entire project directory and your final working demo."},
        {"type":"submission","content":{"type":"final-project","requirements":["Complete project directory as ZIP file","Working demo video","Brief description of your implementation"]}}
    ]
})

# lesson-5-challenge: Design Challenge Submission
lessons.append({
    "id": "lesson-5-challenge",
    "description": "Upload your Design Challenge project with extensions beyond the baseline.",
    "content_json": [
        {"type":"subheading","content":"Design Challenge Upload"},
        {"type":"text","content":"Upload a zip file with your design challenge project contents here. The zip file should include your entire project directory and your final working demo."},
        {"type":"text","content":"Your submission should demonstrate meaningful extensions beyond the baseline project. Include documentation explaining your design decisions and the additional features you implemented."},
        {"type":"submission","content":{"type":"design-challenge","requirements":["Complete project directory as ZIP file","Working demo video showing extensions","Documentation of design decisions and additional features","University email for verification"]}}
    ]
})

if __name__ == '__main__':
    print(f"Updating {len(lessons)} Smartwatch Module 5 lessons...")
    success = 0
    for lesson in lessons:
        if update_lesson(lesson['id'], lesson['description'], lesson['content_json']):
            success += 1
    print(f"\nCompleted: {success}/{len(lessons)} lessons updated successfully.")
