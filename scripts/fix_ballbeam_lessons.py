#!/usr/bin/env python3
"""
Fix Ball & Beam lessons with correct database IDs.
"""

import json
import subprocess
import re

def run_sql(command):
    """Execute a D1 SQL command remotely."""
    result = subprocess.run(
        ['npx', 'wrangler', 'd1', 'execute', 'shortcircuits-db', '--remote', '--command', command],
        capture_output=True, text=True, cwd='/home/user/webapp'
    )
    if result.returncode != 0:
        print(f"SQL Error: {result.stderr}")
        return None
    return result.stdout

def escape_sql(s):
    """Escape single quotes for SQL."""
    return s.replace("'", "''")

def parse_content_to_json(text):
    """Parse raw text content into structured JSON array."""
    content = []
    lines = text.strip().split('\n')
    
    current_paragraph = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Skip empty lines between paragraphs
        if not stripped:
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            i += 1
            continue
        
        # Check for YouTube embeds
        youtube_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)', stripped)
        if youtube_match or 'Embed this youtube video' in stripped or 'Video Coming Soon' in stripped:
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            # Extract YouTube URL or placeholder
            if youtube_match:
                video_id = youtube_match.group(1)
                content.append({"type": "youtube", "url": f"https://www.youtube.com/watch?v={video_id}"})
            else:
                content.append({"type": "text", "content": stripped})
            i += 1
            continue
        
        # Check for bullet points (various formats)
        if re.match(r'^[\u2022\u25cf\u25e6\u2023●•]\s*', stripped) or stripped.startswith('- ') or stripped.startswith('* '):
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            bullets = []
            while i < len(lines):
                line_check = lines[i].strip()
                if re.match(r'^[\u2022\u25cf\u25e6\u2023●•]\s*', line_check):
                    bullet_text = re.sub(r'^[\u2022\u25cf\u25e6\u2023●•]\s*', '', line_check)
                    if bullet_text:
                        bullets.append(bullet_text)
                    i += 1
                elif line_check.startswith('- ') or line_check.startswith('* '):
                    bullet_text = line_check[2:].strip()
                    if bullet_text:
                        bullets.append(bullet_text)
                    i += 1
                elif line_check.startswith('  '):  # Continuation of bullet
                    if bullets:
                        bullets[-1] += ' ' + line_check.strip()
                    i += 1
                else:
                    break
            
            if bullets:
                content.append({"type": "bullets", "items": bullets})
            continue
        
        # Regular paragraph text
        current_paragraph.append(stripped)
        i += 1
    
    # Don't forget last paragraph
    if current_paragraph:
        para_text = ' '.join(current_paragraph).strip()
        if para_text:
            content.append({"type": "text", "content": para_text})
    
    return content

def extract_text_between(full_text, start_phrase, end_phrases):
    """Extract text from start phrase until any of the end phrases."""
    lines = full_text.split('\n')
    result_lines = []
    in_section = False
    
    for i, line in enumerate(lines):
        # Check if we hit start
        if not in_section:
            if start_phrase in line:
                in_section = True
                result_lines.append(line)
            continue
        
        # Check if we hit any end marker
        hit_end = False
        for end_phrase in end_phrases:
            if end_phrase != 'END_OF_DOCUMENT' and end_phrase in line:
                hit_end = True
                break
        
        if hit_end:
            break
        
        result_lines.append(line)
    
    return '\n'.join(result_lines)

# Read the full ball & beam documentation
with open('/tmp/ballbeam_full.txt', 'r') as f:
    bb_content = f.read()

print("=" * 60)
print("FIXING BALL & BEAM LESSONS")
print("=" * 60)

# Correct mapping of sections to actual database IDs
bb_updates = {
    # Overview module
    'bb-lesson-intro': {
        'start': 'Introduction',
        'end': ['Recommended Background'],
    },
    'bb-lesson-background': {
        'start': 'Recommended Background',
        'end': ['Industry Alignment'],
    },
    'bb-lesson-industry': {
        'start': 'Industry Alignment',
        'end': ['Documentation'],
    },
    
    # Training module
    'bb-lesson-t-overview': {
        'start': 'Complete Project Overview',
        'end': ['Basic Embedded Systems'],
    },
    'bb-lesson-t-embedded': {
        'start': 'Basic Embedded Systems',
        'end': ['Circuit Creation'],
    },
    'bb-lesson-t-circuits': {
        'start': 'Circuit Creation and Breadboarding',
        'end': ['Motors and Motor Controllers'],
    },
    'bb-lesson-t-motors': {
        'start': 'Motors and Motor Controllers',
        'end': ['Distance Sensing'],
    },
    'bb-lesson-t-sensing': {
        'start': 'Distance Sensing',
        'end': ['Filtering Techniques'],
    },
    'bb-lesson-t-filtering': {
        'start': 'Filtering Techniques',
        'end': ['PID Control'],
    },
    'bb-lesson-t-pid': {
        'start': 'PID Control',
        'end': ['Project Modules'],
    },
    
    # Controller Implementation module
    'bb-lesson-task1': {
        'start': 'Task 1: Implement the Real-Time Control Loop',
        'end': ['Task 2: Implement the PID Algorithm'],
    },
    'bb-lesson-task2': {
        'start': 'Task 2: Implement the PID Algorithm',
        'end': ['Task 3: Integrate the Motor Driver'],
    },
    'bb-lesson-task3': {
        'start': 'Task 3: Integrate the Motor Driver',
        'end': ['Task 4: Tune the Controller'],
    },
    'bb-lesson-task4': {
        'start': 'Task 4: Tune the Controller',
        'end': ['Deliverables and File Structure'],
    },
    'bb-lesson-demo': {
        'start': 'Deliverables and File Structure',
        'end': ['END_OF_DOCUMENT'],
    },
}

def update_lesson(lesson_id, raw_content):
    """Parse content and update the lesson in the database."""
    if not raw_content or len(raw_content) < 50:
        print(f"  SKIP {lesson_id}: Content too short ({len(raw_content) if raw_content else 0} chars)")
        return False
    
    # Parse the content into structured JSON
    content_json = parse_content_to_json(raw_content)
    
    if not content_json:
        print(f"  SKIP {lesson_id}: No content parsed")
        return False
    
    # Convert to JSON string
    json_str = json.dumps(content_json)
    escaped = escape_sql(json_str)
    
    # Update database
    sql = f"UPDATE lessons SET content_json = '{escaped}' WHERE id = '{lesson_id}'"
    result = run_sql(sql)
    
    if result and 'success' in result.lower():
        print(f"  OK {lesson_id}: {len(content_json)} sections, {len(json_str)} chars")
        return True
    else:
        print(f"  ERROR {lesson_id}: {result[:200] if result else 'No result'}")
        return False

# Extract and update all Ball & Beam lessons
success_count = 0
for lesson_id, section in bb_updates.items():
    text = extract_text_between(bb_content, section['start'], section['end'])
    print(f"Extracted {lesson_id}: {len(text)} chars")
    if update_lesson(lesson_id, text):
        success_count += 1

print(f"\nBall & Beam lessons updated: {success_count}/{len(bb_updates)}")

# Also update the final project lesson
print("\nUpdating final project lesson...")
final_project_content = """Submit Your Final Project

After completing all modules, submit your final Ball and Beam project for review.

Your submission should include:
- Complete source code with proper file structure (controller.h/.cpp, actuator.h/.cpp, sensor.h/.cpp, main.cpp)
- A demonstration video showing the ball stabilizing at the setpoint
- Documentation of your PID tuning process and final gain values
- Any additional features or improvements you implemented

Upload your complete project directory as a zip file along with your demo video.

We look forward to seeing your work!"""

final_json = parse_content_to_json(final_project_content)
json_str = json.dumps(final_json)
escaped = escape_sql(json_str)
sql = f"UPDATE lessons SET content_json = '{escaped}' WHERE id = 'lesson-bb-final-project'"
result = run_sql(sql)
if result and 'success' in result.lower():
    print("  OK lesson-bb-final-project updated")
else:
    print(f"  ERROR: {result[:200] if result else 'No result'}")

print("\nDone!")
