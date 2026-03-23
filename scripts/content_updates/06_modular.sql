UPDATE lessons SET content_json = '[
  {"type":"text","content":"In professional embedded systems, firmware is rarely written as a single file. Instead, it is structured to be modular, maintainable, and scalable so that systems can grow, be debugged efficiently, and be worked on my multiple engineers"},
  {"type":"text","content":"We organize code into clear layers and clean file boundaries. This makes each component independent and easier to debug, extend, or replace. In PlatformIO it is recommended that you use the /include and /src for your header (.h) and source (.c/.cpp) files respectively"}
]' WHERE id = 'lesson-t-modular';
