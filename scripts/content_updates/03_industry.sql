UPDATE lessons SET content_json = '[
  {"type":"text","content":"We analyzed the most in-demand skills across 50+ companies hiring embedded systems engineering interns. Below is how the Smartwatch Project aligns with those skills."},
  {"type":"text","content":"Core skills are fully covered in the base project."},
  {"type":"text","content":"Extendable skills can be developed through optional project extensions and the design challenge."},
  {"type":"text","content":"Not Covered indicates skills that are outside the scope of the core project."},
  {"type":"header","content":"Documentation"},
  {"type":"text","content":"Here is the relevant documentation that you will need to use throughout the development of your project:"},
  {"type":"subheader","content":"Datasheets"},
  {"type":"bullets","content":["AXP202 Datasheet","PCF8563 Datasheet","ST7789V Datasheet","FT6236U Datasheet","BMA423 Datasheet"]},
  {"type":"subheader","content":"Libraries"},
  {"type":"bullets","content":["TFT_eSPI Library","AXP202X_Library","BMA423_Library"]},
  {"type":"subheader","content":"Other"},
  {"type":"bullets","content":["T-Watch Pinout","T-Watch Schematic"]}
]' WHERE id = 'lesson-sw-industry';
