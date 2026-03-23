#!/usr/bin/env python3
"""
Re-fix Ball & Beam lessons with proper bullet point parsing.
The PDF uses \u200b (zero-width space) followed by newline as bullet markers.
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
    """Parse raw text content into structured JSON array with proper bullet handling."""
    content = []
    
    # Split on \u200b which marks bullet points in this PDF
    # First, replace the zero-width space + newline pattern with a special marker
    text = text.replace('\u200b\n', '\n@@BULLET@@')
    
    lines = text.strip().split('\n')
    current_paragraph = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            i += 1
            continue
        
        # Check for bullet marker
        if stripped.startswith('@@BULLET@@') or stripped.startswith(' @@BULLET@@'):
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            # Collect all bullet items
            bullets = []
            while i < len(lines):
                line_check = lines[i].strip()
                if '@@BULLET@@' in line_check:
                    bullet_text = line_check.replace('@@BULLET@@', '').strip()
                    if bullet_text:
                        bullets.append(bullet_text)
                    i += 1
                elif line_check and not line_check[0].isupper() and bullets:
                    # Continuation of previous bullet
                    bullets[-1] += ' ' + line_check
                    i += 1
                else:
                    break
            
            if bullets:
                content.append({"type": "bullets", "items": bullets})
            continue
        
        # Check for traditional bullet markers
        if stripped.startswith('●') or stripped.startswith('•') or stripped.startswith('- '):
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            bullets = []
            while i < len(lines):
                line_check = lines[i].strip()
                if line_check.startswith('●') or line_check.startswith('•'):
                    bullet_text = line_check[1:].strip()
                    if bullet_text:
                        bullets.append(bullet_text)
                    i += 1
                elif line_check.startswith('- '):
                    bullet_text = line_check[2:].strip()
                    if bullet_text:
                        bullets.append(bullet_text)
                    i += 1
                else:
                    break
            
            if bullets:
                content.append({"type": "bullets", "items": bullets})
            continue
        
        # Check for YouTube
        youtube_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)', stripped)
        if youtube_match or 'Video Coming Soon' in stripped:
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            if youtube_match:
                video_id = youtube_match.group(1)
                content.append({"type": "youtube", "url": f"https://www.youtube.com/watch?v={video_id}"})
            else:
                content.append({"type": "text", "content": stripped})
            i += 1
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
        if not in_section:
            if start_phrase in line:
                in_section = True
                result_lines.append(line)
            continue
        
        hit_end = False
        for end_phrase in end_phrases:
            if end_phrase != 'END_OF_DOCUMENT' and end_phrase in line:
                hit_end = True
                break
        
        if hit_end:
            break
        
        result_lines.append(line)
    
    return '\n'.join(result_lines)

# Read the PDF text
with open('/tmp/ballbeam_new.txt', 'r') as f:
    bb_content = f.read()

print("=" * 60)
print("RE-FIXING BALL & BEAM LESSONS WITH PROPER BULLET PARSING")
print("=" * 60)

# Task lessons need special bullet handling
bb_tasks = {
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
        print(f"  SKIP {lesson_id}: Content too short")
        return False
    
    content_json = parse_content_to_json(raw_content)
    
    if not content_json:
        print(f"  SKIP {lesson_id}: No content parsed")
        return False
    
    json_str = json.dumps(content_json)
    escaped = escape_sql(json_str)
    
    sql = f"UPDATE lessons SET content_json = '{escaped}' WHERE id = '{lesson_id}'"
    result = run_sql(sql)
    
    if result and 'success' in result.lower():
        # Count bullets
        bullet_count = sum(1 for item in content_json if item.get('type') == 'bullets')
        bullet_items = sum(len(item.get('items', [])) for item in content_json if item.get('type') == 'bullets')
        print(f"  OK {lesson_id}: {len(content_json)} sections, {bullet_count} bullet lists ({bullet_items} items)")
        return True
    else:
        print(f"  ERROR {lesson_id}")
        return False

# Update task lessons
for lesson_id, section in bb_tasks.items():
    text = extract_text_between(bb_content, section['start'], section['end'])
    print(f"Extracted {lesson_id}: {len(text)} chars")
    update_lesson(lesson_id, text)

print("\nDone!")
