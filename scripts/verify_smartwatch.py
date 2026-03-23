#!/usr/bin/env python3
"""
Compare Smartwatch PDF content with database content.
"""

import subprocess
import json
import re

def run_sql(command):
    result = subprocess.run(
        ['npx', 'wrangler', 'd1', 'execute', 'shortcircuits-db', '--remote', '--command', command],
        capture_output=True, text=True, cwd='/home/user/webapp'
    )
    return result.stdout

# Read PDF text
with open('/tmp/smartwatch_new.txt', 'r') as f:
    pdf_text = f.read()

def normalize(text):
    """Normalize text for comparison."""
    text = re.sub(r'\s+', ' ', text)
    text = text.strip().lower()
    return text

# Define sections to compare
training_sections = {
    'Modular Architecture': ('Modular Architecture', 'File Structure', 'lesson-t-modular'),
    'File Structure': ('File Structure', 'Project Layers', 'lesson-t-files'),
    'Project Layers': ('Project Layers', 'Pointers and References', 'lesson-t-layers'),
    'Pointers and References': ('Pointers and References', 'Bit Manipulation', 'lesson-t-pointers'),
    'Bit Manipulation': ('Bit Manipulation', 'I2C Communication', 'lesson-t-bits'),
    'I2C Communication': ('I2C Communication', 'Object-Oriented Basics', 'lesson-t-i2c'),
    'Object-Oriented Basics': ('Object-Oriented Basics', 'Real Time Operating System', 'lesson-t-oop'),
    'RTOS': ('Real Time Operating System', 'Static and Volatile Keywords', 'lesson-t-rtos'),
    'Static and Volatile': ('Static and Volatile Keywords', 'Timing and Scheduling', 'lesson-t-static-volatile'),
    'Timing and Scheduling': ('Timing and Scheduling', 'Interrupts and ISRs', 'lesson-t-timing'),
    'Interrupts and ISRs': ('Interrupts and ISRs', 'Finite State Machine', 'lesson-t-interrupts'),
    'Finite State Machine': ('Finite State Machine', 'Networking', 'lesson-t-fsm'),
    'Networking': ('Networking', 'Project Modules', 'lesson-t-networking'),
}

print("=" * 70)
print("SMARTWATCH TRAINING CONTENT VERIFICATION")
print("=" * 70)
print(f"PDF text length: {len(pdf_text)} characters ({len(pdf_text)/1024:.1f} KB)")
print()

total_pdf_chars = 0
total_db_chars = 0
all_match = True

for name, (start, end, lesson_id) in training_sections.items():
    # Extract PDF section
    start_idx = pdf_text.find(start)
    end_idx = pdf_text.find(end) if end != 'END' else len(pdf_text)
    
    if start_idx == -1:
        print(f"[ERROR] Cannot find '{start}' in PDF")
        continue
    
    pdf_section = pdf_text[start_idx:end_idx].strip()
    pdf_normalized = normalize(pdf_section)
    total_pdf_chars += len(pdf_normalized)
    
    # Get DB content length
    result = run_sql(f"SELECT LENGTH(content_json) as len FROM lessons WHERE id='{lesson_id}'")
    match = re.search(r'"len":\s*(\d+)', result)
    db_len = int(match.group(1)) if match else 0
    total_db_chars += db_len
    
    # Check sample sentences
    pdf_sentences = [s.strip() for s in pdf_section.split('.') if len(s.strip()) > 30][:15]
    
    # Get DB text for sentence matching
    result2 = run_sql(f"SELECT content_json FROM lessons WHERE id='{lesson_id}'")
    match2 = re.search(r'"content_json":\s*"(\[.*?\])"', result2, re.DOTALL)
    
    if match2:
        json_str = match2.group(1).replace('\\"', '"').replace('\\\\', '\\').replace('\\n', ' ')
        try:
            content = json.loads(json_str)
            db_texts = []
            for item in content:
                if item.get('type') == 'text':
                    db_texts.append(item.get('content', ''))
                elif item.get('type') == 'bullets':
                    db_texts.extend(item.get('items', []))
            db_combined = ' '.join(db_texts)
            db_normalized = normalize(db_combined)
            
            # Check sentence matches
            found = sum(1 for s in pdf_sentences if normalize(s)[:40] in db_normalized)
            match_pct = (found / len(pdf_sentences) * 100) if pdf_sentences else 0
            
            status = "OK" if match_pct >= 80 else "CHECK"
            if match_pct < 80:
                all_match = False
            
            print(f"[{status}] {name}")
            print(f"     PDF: {len(pdf_section):,} chars | DB: {db_len:,} chars | Match: {found}/{len(pdf_sentences)} ({match_pct:.0f}%)")
        except:
            print(f"[ERROR] {name} - JSON parse failed")
            all_match = False
    else:
        print(f"[ERROR] {name} - No DB content found")
        all_match = False

print()
print("=" * 70)
print("MODULE CONTENT CHECK")
print("=" * 70)

# Check module tasks
module_lessons = [
    ('Module 1 Task 1', 'Task 1: Initialize System Power', 'Task 2: Display Text', 'lesson-1-task1'),
    ('Module 1 Task 2', 'Task 2: Display Text Using TFT_eSPI', 'Task 3: Implement a Hardware Interrupt', 'lesson-1-task2'),
    ('Module 1 Task 3', 'Task 3: Implement a Hardware Interrupt', 'Add the video labeled Module 1', 'lesson-1-task3'),
    ('Module 2 Task 1', 'Task 1: Implement Real Time Clock', 'Task 2: Synchronization Time', 'lesson-2-task1'),
    ('Module 2 Task 2', 'Task 2: Synchronization Time Using Wi-Fi', 'Task 3: Display Time and Date', 'lesson-2-task2'),
    ('Module 2 Task 3', 'Task 3: Display Time and Date', 'Add the video labeled Module 2', 'lesson-2-task3'),
    ('Module 3 Task 1', 'Task 1: Read and Display touch', 'Add the video labeled Module 3 Task 1', 'lesson-3-task1'),
    ('Module 3 Task 2', 'Task 2: Design the Accelerometer', 'Add the video labeled Module 3 Task 2', 'lesson-3-task2'),
    ('Module 3 Task 3', 'Task 3: Design the Wi-Fi Status', 'Add the video labeled Module 3 Task 3', 'lesson-3-task3'),
    ('Module 4 Task 1', 'Task 1: Design a Stopwatch', 'Task 2: Implement Screen Navigation', 'lesson-4-task1'),
    ('Module 4 Task 2', 'Task 2: Implement Screen Navigation', 'Task 3: Display Live Battery', 'lesson-4-task2'),
    ('Module 4 Task 3', 'Task 3: Display Live Battery', 'Task 4: Design an RTOS', 'lesson-4-task3'),
    ('Module 4 Task 4', 'Task 4: Design an RTOS Based', 'Add the video labeled Module 4', 'lesson-4-task4'),
]

for name, start, end, lesson_id in module_lessons:
    start_idx = pdf_text.find(start)
    end_idx = pdf_text.find(end) if end else len(pdf_text)
    
    if start_idx == -1:
        print(f"[ERROR] {name} - Cannot find in PDF")
        continue
    
    pdf_section = pdf_text[start_idx:end_idx].strip()
    
    result = run_sql(f"SELECT LENGTH(content_json) as len FROM lessons WHERE id='{lesson_id}'")
    match = re.search(r'"len":\s*(\d+)', result)
    db_len = int(match.group(1)) if match else 0
    
    print(f"[{'OK' if db_len > 100 else 'CHECK'}] {name}: PDF {len(pdf_section):,} chars | DB {db_len:,} chars")

print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Training sections total: PDF ~{total_pdf_chars:,} chars normalized")
print(f"All training sections match: {'YES' if all_match else 'NO - Some sections need review'}")
