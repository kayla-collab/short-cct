UPDATE lessons SET content_json = '[
  {"type":"text","content":"This projects is designed for students who want hands-on embedded firmware experience. You do not need a lot of experience, but some foundational knowledge is expected."},
  {"type":"subheader","content":"Required"},
  {"type":"bullets","content":["Introductory programming experience in C or C++","Comfort with basic programming concepts such as functions, control flow, arrays, and structs"]},
  {"type":"subheader","content":"Helpful"},
  {"type":"bullets","content":["Introductory exposure to embedded systems","Introductory electronics knowledge"]},
  {"type":"text","content":"If you find that you are missing some of this background, reach out to us at support@shortcct.com and we can explore options to get you up to speed!"}
]' WHERE id = 'lesson-sw-background';
