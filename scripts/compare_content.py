#!/usr/bin/env python3
"""
Compare PDF text content with database content for Ball & Beam lessons.
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
with open('/tmp/ballbeam_new.txt', 'r') as f:
    pdf_text = f.read()

# Normalize text for comparison
def normalize(text):
    """Normalize text for comparison."""
    text = re.sub(r'\s+', ' ', text)  # Collapse whitespace
    text = text.strip().lower()
    return text

# Extract sections from PDF
sections = {
    'Basic Embedded Systems': ('Basic Embedded Systems', 'Circuit Creation'),
    'Circuit Creation': ('Circuit Creation and Breadboarding', 'Motors and Motor Controllers'),
    'Motors': ('Motors and Motor Controllers', 'Distance Sensing'),
    'Distance Sensing': ('Distance Sensing', 'Filtering Techniques'),
    'Filtering': ('Filtering Techniques', 'PID Control'),
    'PID Control': ('PID Control', 'Project Modules'),
}

lesson_ids = {
    'Basic Embedded Systems': 'bb-lesson-t-embedded',
    'Circuit Creation': 'bb-lesson-t-circuits',
    'Motors': 'bb-lesson-t-motors',
    'Distance Sensing': 'bb-lesson-t-sensing',
    'Filtering': 'bb-lesson-t-filtering',
    'PID Control': 'bb-lesson-t-pid',
}

print("=" * 70)
print("DETAILED CONTENT COMPARISON")
print("=" * 70)

for section_name, (start_marker, end_marker) in sections.items():
    lesson_id = lesson_ids[section_name]
    
    # Extract PDF section
    start = pdf_text.find(start_marker)
    end = pdf_text.find(end_marker) if end_marker else len(pdf_text)
    if start == -1:
        print(f"[ERROR] Cannot find '{start_marker}' in PDF")
        continue
    
    pdf_section = pdf_text[start:end].strip()
    pdf_normalized = normalize(pdf_section)
    
    # Get DB content
    result = run_sql(f"SELECT content_json FROM lessons WHERE id='{lesson_id}'")
    
    # Parse DB content
    match = re.search(r'"content_json":\s*"(\[.*?\])"', result, re.DOTALL)
    if not match:
        print(f"[ERROR] Cannot parse DB content for {lesson_id}")
        continue
    
    json_str = match.group(1).replace('\\"', '"').replace('\\\\', '\\').replace('\\n', ' ')
    try:
        content = json.loads(json_str)
    except:
        print(f"[ERROR] JSON parse failed for {lesson_id}")
        continue
    
    # Combine all DB text content
    db_texts = []
    for item in content:
        if item.get('type') == 'text':
            db_texts.append(item.get('content', ''))
        elif item.get('type') == 'bullets':
            db_texts.extend(item.get('items', []))
    
    db_combined = ' '.join(db_texts)
    db_normalized = normalize(db_combined)
    
    # Compare lengths
    print(f"\n[{section_name}] ({lesson_id})")
    print(f"  PDF section: {len(pdf_section)} chars ({len(pdf_normalized)} normalized)")
    print(f"  DB content:  {len(db_combined)} chars ({len(db_normalized)} normalized)")
    
    # Check key phrases from PDF are in DB
    # Split PDF into sentences and check
    pdf_sentences = [s.strip() for s in pdf_section.split('.') if len(s.strip()) > 30]
    
    missing_count = 0
    found_count = 0
    
    for sentence in pdf_sentences[:20]:  # Check first 20 sentences
        sentence_norm = normalize(sentence)[:50]  # First 50 chars
        if sentence_norm in db_normalized:
            found_count += 1
        else:
            missing_count += 1
            if missing_count <= 3:
                print(f"  [MAYBE MISSING] {sentence[:60]}...")
    
    total_checked = found_count + missing_count
    match_pct = (found_count / total_checked * 100) if total_checked > 0 else 0
    print(f"  Match rate: {found_count}/{total_checked} sentences ({match_pct:.0f}%)")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print("If match rate is high (>80%), content is properly transferred.")
print("Low match rates may indicate missing paragraphs.")
