#!/usr/bin/env python3
"""
Verify Ball & Beam lesson content against PDF.
"""

import subprocess
import json

def run_sql(command):
    """Execute a D1 SQL command remotely."""
    result = subprocess.run(
        ['npx', 'wrangler', 'd1', 'execute', 'shortcircuits-db', '--remote', '--command', command],
        capture_output=True, text=True, cwd='/home/user/webapp'
    )
    return result.stdout

# Read the PDF text
with open('/tmp/ballbeam_new.txt', 'r') as f:
    pdf_text = f.read()

print("=" * 70)
print("BALL & BEAM CONTENT VERIFICATION")
print("=" * 70)
print(f"PDF text length: {len(pdf_text)} characters")
print()

# Key sections to verify
sections_to_check = [
    ('Basic Embedded Systems', 'bb-lesson-t-embedded'),
    ('Circuit Creation and Breadboarding', 'bb-lesson-t-circuits'),
    ('Motors and Motor Controllers', 'bb-lesson-t-motors'),
    ('Distance Sensing', 'bb-lesson-t-sensing'),
    ('Filtering Techniques', 'bb-lesson-t-filtering'),
    ('PID Control', 'bb-lesson-t-pid'),
]

# Check each section
for section_name, lesson_id in sections_to_check:
    # Find section in PDF
    pdf_start = pdf_text.find(section_name)
    if pdf_start == -1:
        print(f"[WARN] Section '{section_name}' not found in PDF")
        continue
    
    # Get a sample of PDF content (first 500 chars after title)
    pdf_sample = pdf_text[pdf_start:pdf_start+500].replace('\n', ' ')[:300]
    
    # Get DB content length
    result = run_sql(f"SELECT LENGTH(content_json) as len FROM lessons WHERE id='{lesson_id}'")
    
    # Extract length from result
    if '"len":' in result:
        import re
        match = re.search(r'"len":\s*(\d+)', result)
        db_len = int(match.group(1)) if match else 0
    else:
        db_len = 0
    
    print(f"[{lesson_id}] {section_name}")
    print(f"  PDF position: char {pdf_start}")
    print(f"  DB content_json length: {db_len} chars")
    print(f"  PDF sample: {pdf_sample[:100]}...")
    print()

# Now let's do a detailed comparison of the first training section
print("=" * 70)
print("DETAILED COMPARISON: Basic Embedded Systems")
print("=" * 70)

# Get the full content from DB
result = run_sql("SELECT content_json FROM lessons WHERE id='bb-lesson-t-embedded'")

# Find the JSON array in the result
import re
# Look for the content_json value
match = re.search(r'"content_json":\s*"(\[.*?\])"', result, re.DOTALL)
if match:
    json_str = match.group(1)
    # Unescape the JSON string
    json_str = json_str.replace('\\"', '"').replace('\\\\', '\\')
    try:
        content = json.loads(json_str)
        print(f"DB has {len(content)} content sections:")
        for i, item in enumerate(content[:10]):
            t = item.get('type', '?')
            c = str(item.get('content', item.get('items', '')))[:80]
            print(f"  {i+1}. [{t}] {c}...")
        if len(content) > 10:
            print(f"  ... and {len(content) - 10} more sections")
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"First 200 chars: {json_str[:200]}")
else:
    print("Could not find content_json in result")
    print(f"Result sample: {result[:500]}")

# Check PDF for the same section
print("\nPDF Basic Embedded Systems section:")
start = pdf_text.find('Basic Embedded Systems')
end = pdf_text.find('Circuit Creation and Breadboarding')
if start != -1 and end != -1:
    section = pdf_text[start:end]
    paragraphs = [p.strip() for p in section.split('\n\n') if p.strip()]
    print(f"  Found {len(paragraphs)} paragraphs in PDF")
    for i, p in enumerate(paragraphs[:5]):
        print(f"  {i+1}. {p[:80]}...")

print("\n" + "=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)
