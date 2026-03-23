UPDATE lessons SET title = 'Introduction', content_json = '[
  {"type":"header","content":"Overview"},
  {"type":"text","content":"In this program you will design and implement a fully functioning smartwatch by combining low level driver development, embedded systems programming, and system-level integration."},
  {"type":"text","content":"You will work on the LilyGo T-Watch 2020 V3, a real commercial smartwatch platform, and write production-style firmware entirely in C and C++: the same languages used in industry for resource-constrained embedded systems"},
  {"type":"bullets","content":["C is used for low-level hardware control and communication","C++ enables modular design, abstraction, and higher-level application logic"]},
  {"type":"text","content":"Throughout the program you will build your system incrementally using provided training materials, reference implementations, and targeted code examples. These resources are designed to support you without removing the need for engineering decision making."},
  {"type":"text","content":"If you need help, email support@shortcct.com with your specific questions and a zip file including your project directory. Remember, virtual support is available for 3 months after your product delivery date."}
]' WHERE id = 'lesson-t-overview';
