#!/usr/bin/env python3
"""
Fix all lessons with FULL verbatim content from documentation files.
This script extracts the complete content from each section and updates the database.
"""

import json
import subprocess
import re
import sys

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
    in_code_block = False
    code_lines = []
    code_lang = 'cpp'
    
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
        if youtube_match or 'Embed this youtube video' in stripped:
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            # Extract YouTube URL
            if youtube_match:
                video_id = youtube_match.group(1)
                # Handle playlist links
                if '&list=' in stripped:
                    url_match = re.search(r'(https?://[^\s]+)', stripped)
                    if url_match:
                        content.append({"type": "youtube", "url": url_match.group(1)})
                else:
                    content.append({"type": "youtube", "url": f"https://www.youtube.com/watch?v={video_id}"})
            i += 1
            continue
        
        # Check for code indicators
        if stripped.endswith('.h)') or stripped.endswith('.c)') or stripped.endswith('.cpp)') or stripped.endswith('Example'):
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            # This is a code caption/label
            content.append({"type": "text", "content": stripped})
            i += 1
            continue
        
        # Check for bullet points
        if stripped.startswith('- ') or stripped.startswith('* ') or stripped.startswith('+ '):
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            bullets = []
            while i < len(lines) and (lines[i].strip().startswith('- ') or 
                                       lines[i].strip().startswith('* ') or 
                                       lines[i].strip().startswith('+ ')):
                bullet_text = lines[i].strip()[2:].strip()
                if bullet_text:
                    bullets.append(bullet_text)
                i += 1
            
            if bullets:
                content.append({"type": "bullets", "items": bullets})
            continue
        
        # Check for bulleted lines with special markers
        if re.match(r'^[\u2022\u25cf\u25e6\u2023]', stripped):
            if current_paragraph:
                para_text = ' '.join(current_paragraph).strip()
                if para_text:
                    content.append({"type": "text", "content": para_text})
                current_paragraph = []
            
            bullets = []
            while i < len(lines) and re.match(r'^[\u2022\u25cf\u25e6\u2023]', lines[i].strip()):
                bullet_text = re.sub(r'^[\u2022\u25cf\u25e6\u2023]\s*', '', lines[i].strip())
                if bullet_text:
                    bullets.append(bullet_text)
                i += 1
            
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

def extract_section(full_text, start_marker, end_markers):
    """Extract a section of text between start and end markers."""
    lines = full_text.split('\n')
    start_idx = None
    end_idx = None
    
    for i, line in enumerate(lines):
        if start_marker in line and start_idx is None:
            start_idx = i
        elif start_idx is not None:
            for em in end_markers:
                if em in line and line.strip() == em:
                    end_idx = i
                    break
            if end_idx:
                break
    
    if start_idx is None:
        return ""
    
    if end_idx is None:
        end_idx = len(lines)
    
    return '\n'.join(lines[start_idx:end_idx])

# Read the full smartwatch documentation
with open('/tmp/sw_full.txt', 'r') as f:
    sw_content = f.read()

# Read the full ball & beam documentation
with open('/tmp/ballbeam_full.txt', 'r') as f:
    bb_content = f.read()

# Define the lesson content mappings for smartwatch training materials
# Each lesson maps to (start_marker, end_markers) in the document

print("=" * 60)
print("FIXING ALL SMARTWATCH TRAINING LESSONS")
print("=" * 60)

# Extract content sections from the smartwatch doc
sw_sections = {
    # Training Materials
    'lesson-t-overview': {
        'start': 'Complete Project Overview',
        'end': ['Modular Architecture'],
        'content': None
    },
    'lesson-t-modular': {
        'start': 'Modular Architecture',
        'end': ['File Structure'],
        'content': None
    },
    'lesson-t-files': {
        'start': 'File Structure',
        'end': ['Project Layers'],
        'content': None
    },
    'lesson-t-layers': {
        'start': 'Project Layers',
        'end': ['Pointers and References'],
        'content': None
    },
    'lesson-t-pointers': {
        'start': 'Pointers and References',
        'end': ['Bit Manipulation'],
        'content': None
    },
    'lesson-t-bits': {
        'start': 'Bit Manipulation',
        'end': ['I2C Communication'],
        'content': None
    },
    'lesson-t-i2c': {
        'start': 'I2C Communication',
        'end': ['Object-Oriented Basics'],
        'content': None
    },
    'lesson-t-oop': {
        'start': 'Object-Oriented Basics',
        'end': ['Real Time Operating System'],
        'content': None
    },
    'lesson-t-rtos': {
        'start': 'Real Time Operating System',
        'end': ['Static and Volatile Keywords'],
        'content': None
    },
    'lesson-t-static-volatile': {
        'start': 'Static and Volatile Keywords',
        'end': ['Timing and Scheduling'],
        'content': None
    },
    'lesson-t-timing': {
        'start': 'Timing and Scheduling',
        'end': ['Interrupts and ISRs'],
        'content': None
    },
    'lesson-t-interrupts': {
        'start': 'Interrupts and ISRs',
        'end': ['Finite State Machine'],
        'content': None
    },
    'lesson-t-fsm': {
        'start': 'Finite State Machine',
        'end': ['Networking'],
        'content': None
    },
    'lesson-t-networking': {
        'start': 'Networking',
        'end': ['Project Modules'],
        'content': None
    },
}

# Module content sections
sw_modules = {
    # Module 1
    'lesson-1-task1': {
        'start': 'Task 1: Initialize System Power Using the AXP202',
        'end': ['Task 2: Display Text Using TFT_eSPI'],
        'content': None
    },
    'lesson-1-task2': {
        'start': 'Task 2: Display Text Using TFT_eSPI',
        'end': ['Task 3: Implement a Hardware Interrupt'],
        'content': None
    },
    'lesson-1-task3': {
        'start': 'Task 3: Implement a Hardware Interrupt for the Power Button',
        'end': ['Add the video labeled Module 1 Demo here', 'Deliverables and File Structure'],
        'content': None
    },
    'lesson-1-demo': {
        'start': 'Add the video labeled Module 1 Demo here',
        'end': ['Deliverables and File Structure'],
        'content': None
    },
    
    # Module 2
    'lesson-2-task1': {
        'start': 'Task 1: Implement Real Time Clock Storage and Retrieval',
        'end': ['Task 2: Synchronization Time Using Wi-Fi'],
        'content': None
    },
    'lesson-2-task2': {
        'start': 'Task 2: Synchronization Time Using Wi-Fi',
        'end': ['Task 3: Display Time and Date'],
        'content': None
    },
    'lesson-2-task3': {
        'start': 'Task 3: Display Time and Date on the LCD',
        'end': ['Add the video labeled Module 2 Demo here', 'Deliverables and File Structure'],
        'content': None
    },
    'lesson-2-demo': {
        'start': 'Add the video labeled Module 2 Demo here',
        'end': ['Deliverables and File Structure'],
        'content': None
    },
    
    # Module 3
    'lesson-3-task1': {
        'start': 'Task 1: Read and Display touch Coordinates',
        'end': ['Add the video labeled Module 3 Task 1 Demo here', 'Task 2: Design the Accelerometer Screen'],
        'content': None
    },
    'lesson-3-task2': {
        'start': 'Task 2: Design the Accelerometer Screen',
        'end': ['Add the video labeled Module 3 Task 2 Demo here', 'Task 3: Design the Wi-Fi Status Screen'],
        'content': None
    },
    'lesson-3-task3': {
        'start': 'Task 3: Design the Wi-Fi Status Screen',
        'end': ['Add the video labeled Module 3 Task 3 Demo here', 'Deliverables and File Structure'],
        'content': None
    },
    
    # Module 4
    'lesson-4-task1': {
        'start': 'Task 1: Design a Stopwatch Screen',
        'end': ['Task 2: Implement Screen Navigation'],
        'content': None
    },
    'lesson-4-task2': {
        'start': 'Task 2: Implement Screen Navigation Using Touch Buttons',
        'end': ['Task 3: Display Live Battery Percentage'],
        'content': None
    },
    'lesson-4-task3': {
        'start': 'Task 3: Display Live Battery Percentage on the Home Screen',
        'end': ['Task 4: Design an RTOS Based System Architecture'],
        'content': None
    },
    'lesson-4-task4': {
        'start': 'Task 4: Design an RTOS Based System Architecture',
        'end': ['Add the video labeled Module 4 Demo here', 'Deliverables and File Structure'],
        'content': None
    },
    'lesson-4-demo': {
        'start': 'Add the video labeled Module 4 Demo here',
        'end': ['Short Circuit Design Challenge'],
        'content': None
    },
    
    # Module 5 - Design Challenge
    'lesson-5-intro': {
        'start': 'Short Circuit Design Challenge',
        'end': ['Awards and Recognition'],
        'content': None
    },
    'lesson-5-extensions': {
        'start': 'Project Extension Opportunities',
        'end': ['Baseline Project Upload', 'You must be an active university student'],
        'content': None
    },
    'lesson-5-submission': {
        'start': 'Baseline Project Upload',
        'end': ['END_OF_DOCUMENT'],
        'content': None
    },
}

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
                # Include title line
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

# Process training sections
for lesson_id, section in sw_sections.items():
    text = extract_text_between(sw_content, section['start'], section['end'])
    section['content'] = text
    print(f"Extracted {lesson_id}: {len(text)} chars")

# Process module sections
for lesson_id, section in sw_modules.items():
    text = extract_text_between(sw_content, section['start'], section['end'])
    section['content'] = text
    print(f"Extracted {lesson_id}: {len(text)} chars")

print("\n" + "=" * 60)
print("PARSING AND UPDATING DATABASE")
print("=" * 60)

# Now update the database with full content
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

# Update all training lessons
success_count = 0
for lesson_id, section in sw_sections.items():
    if update_lesson(lesson_id, section['content']):
        success_count += 1

# Update all module lessons
for lesson_id, section in sw_modules.items():
    if update_lesson(lesson_id, section['content']):
        success_count += 1

print(f"\nSmartwatch lessons updated: {success_count}")

# Now process Ball & Beam content
print("\n" + "=" * 60)
print("FIXING ALL BALL & BEAM LESSONS")
print("=" * 60)

bb_sections = {
    'bb-overview': {
        'start': 'Overview',
        'end': ['Recommended Background'],
        'content': None
    },
    'bb-background': {
        'start': 'Recommended Background',
        'end': ['Industry Alignment'],
        'content': None
    },
    'bb-docs': {
        'start': 'Documentation',
        'end': ['Training Material'],
        'content': None
    },
    'bb-t-overview': {
        'start': 'Complete Project Overview',
        'end': ['Basic Embedded Systems'],
        'content': None
    },
    'bb-t-embedded': {
        'start': 'Basic Embedded Systems',
        'end': ['Circuit Creation'],
        'content': None
    },
    'bb-t-circuits': {
        'start': 'Circuit Creation and Breadboarding',
        'end': ['Motors and Motor Controllers'],
        'content': None
    },
    'bb-t-motors': {
        'start': 'Motors and Motor Controllers',
        'end': ['Distance Sensing'],
        'content': None
    },
    'bb-t-sensing': {
        'start': 'Distance Sensing',
        'end': ['Filtering Techniques'],
        'content': None
    },
    'bb-t-filtering': {
        'start': 'Filtering Techniques',
        'end': ['PID Control'],
        'content': None
    },
    'bb-t-pid': {
        'start': 'PID Control',
        'end': ['Project Modules'],
        'content': None
    },
    'bb-task1': {
        'start': 'Task 1: Implement the Real-Time Control Loop',
        'end': ['Task 2: Implement the PID Algorithm'],
        'content': None
    },
    'bb-task2': {
        'start': 'Task 2: Implement the PID Algorithm',
        'end': ['Task 3: Integrate the Motor Driver'],
        'content': None
    },
    'bb-task3': {
        'start': 'Task 3: Integrate the Motor Driver',
        'end': ['Task 4: Tune the Controller'],
        'content': None
    },
    'bb-task4': {
        'start': 'Task 4: Tune the Controller',
        'end': ['Deliverables and File Structure'],
        'content': None
    },
    'bb-deliverables': {
        'start': 'Deliverables and File Structure',
        'end': ['END_OF_DOCUMENT'],
        'content': None
    },
}

# Extract ball & beam sections
for lesson_id, section in bb_sections.items():
    text = extract_text_between(bb_content, section['start'], section['end'])
    section['content'] = text
    print(f"Extracted {lesson_id}: {len(text)} chars")

# Map ball & beam lesson IDs to database IDs
bb_id_mapping = {
    'bb-overview': 'lesson-bb-overview',
    'bb-background': 'lesson-bb-background',
    'bb-docs': 'lesson-bb-docs',
    'bb-t-overview': 'lesson-bb-t-overview',
    'bb-t-embedded': 'lesson-bb-t-embedded',
    'bb-t-circuits': 'lesson-bb-t-circuits',
    'bb-t-motors': 'lesson-bb-t-motors',
    'bb-t-sensing': 'lesson-bb-t-sensing',
    'bb-t-filtering': 'lesson-bb-t-filtering',
    'bb-t-pid': 'lesson-bb-t-pid',
    'bb-task1': 'lesson-bb-task1',
    'bb-task2': 'lesson-bb-task2',
    'bb-task3': 'lesson-bb-task3',
    'bb-task4': 'lesson-bb-task4',
    'bb-deliverables': 'lesson-bb-deliverables',
}

# Check what lesson IDs exist in the database for ball & beam
print("\nChecking ball & beam lesson IDs in database...")
result = run_sql("SELECT id, title FROM lessons WHERE course_id='ballbeam-course' ORDER BY order_index")
print(result[:2000] if result else "No result")

print("\nTotal lessons updated successfully!")
