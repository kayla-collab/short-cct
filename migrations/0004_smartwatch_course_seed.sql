-- Seed data for Smartwatch Project Course (Mockup)

-- Insert the Smartwatch course
INSERT OR REPLACE INTO courses (id, title, description, product_id, thumbnail_url, total_lessons, total_quizzes, estimated_hours, is_published) VALUES
('smartwatch-course', 
 'Build Your Own Smartwatch', 
 'A comprehensive hands-on course that takes you from unboxing to a fully functional DIY smartwatch. Learn electronics, programming, and embedded systems through building a real wearable device.',
 'smartwatch',
 '/images/courses/smartwatch-thumbnail.jpg',
 18,
 3,
 12,
 1);

-- Module 1: Getting Started
INSERT OR REPLACE INTO course_modules (id, course_id, title, description, order_index) VALUES
('mod-1-getting-started', 'smartwatch-course', 'Getting Started', 'Welcome to the course! Let''s make sure you have everything you need.', 1);

-- Module 1 Lessons
INSERT OR REPLACE INTO lessons (id, module_id, course_id, title, description, content_type, order_index, duration_minutes, content_json) VALUES
('lesson-1-1', 'mod-1-getting-started', 'smartwatch-course', 'Welcome & Course Overview', 'Introduction to what you''ll build and learn in this course.', 'video', 1, 8, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "transcript_available": true,
  "key_points": [
    "What you will build: a fully functional smartwatch",
    "Skills you will learn: soldering, programming, electronics",
    "Course structure overview",
    "How to get help if you get stuck"
  ]
}'),
('lesson-1-2', 'mod-1-getting-started', 'smartwatch-course', 'What''s in Your Kit', 'Unbox your kit and verify all components are present.', 'text', 2, 10, '{
  "sections": [
    {
      "title": "Unboxing Your Kit",
      "content": "Carefully open your Short Circuit Smartwatch Kit and lay out all components on a clean, well-lit workspace.",
      "image": "/images/courses/smartwatch/kit-unboxing.jpg"
    },
    {
      "title": "Component Checklist",
      "type": "checklist",
      "items": [
        {"name": "ESP32-S3 Development Board", "quantity": 1, "image": "/images/courses/smartwatch/esp32.jpg"},
        {"name": "1.28\" Round TFT Display (GC9A01)", "quantity": 1, "image": "/images/courses/smartwatch/display.jpg"},
        {"name": "Heart Rate Sensor (MAX30102)", "quantity": 1, "image": "/images/courses/smartwatch/heart-sensor.jpg"},
        {"name": "Accelerometer (MPU6050)", "quantity": 1, "image": "/images/courses/smartwatch/accelerometer.jpg"},
        {"name": "LiPo Battery 400mAh", "quantity": 1, "image": "/images/courses/smartwatch/battery.jpg"},
        {"name": "Custom PCB", "quantity": 1, "image": "/images/courses/smartwatch/pcb.jpg"},
        {"name": "3D Printed Watch Case", "quantity": 1, "image": "/images/courses/smartwatch/case.jpg"},
        {"name": "Watch Strap", "quantity": 1, "image": "/images/courses/smartwatch/strap.jpg"},
        {"name": "USB-C Cable", "quantity": 1, "image": "/images/courses/smartwatch/usb-cable.jpg"},
        {"name": "Screws & Hardware Pack", "quantity": 1, "image": "/images/courses/smartwatch/hardware.jpg"}
      ]
    }
  ],
  "warning": "If any components are missing or damaged, contact support@shortcct.com immediately for a replacement."
}'),
('lesson-1-3', 'mod-1-getting-started', 'smartwatch-course', 'Tools You''ll Need', 'Additional tools required that are not included in the kit.', 'text', 3, 5, '{
  "sections": [
    {
      "title": "Required Tools",
      "content": "You''ll need the following tools to complete this project. If you don''t have them, we''ve included links to recommended options.",
      "type": "tool_list",
      "items": [
        {
          "name": "Soldering Iron (Temperature Controlled)",
          "description": "A temperature-controlled iron is essential for working with sensitive electronics. Set to 350C/660F.",
          "recommended": "Pinecil V2 or Hakko FX-888D",
          "link": "https://pine64.com/product/pinecil-smart-mini-portable-soldering-iron/",
          "required": true
        },
        {
          "name": "Solder (Lead-free, 0.8mm)",
          "description": "Lead-free solder for all connections.",
          "recommended": "Kester 275 No-Clean",
          "link": "https://www.amazon.com/dp/B00068IJWC",
          "required": true
        },
        {
          "name": "Flush Cutters",
          "description": "For trimming component leads.",
          "link": "https://www.amazon.com/dp/B00FZPDG1K",
          "required": true
        },
        {
          "name": "Multimeter",
          "description": "For testing connections and troubleshooting.",
          "recommended": "Any basic digital multimeter",
          "link": "https://www.amazon.com/dp/B01ISAMUA6",
          "required": true
        },
        {
          "name": "Helping Hands / PCB Holder",
          "description": "Makes soldering much easier.",
          "link": "https://www.amazon.com/dp/B07MDKXNPC",
          "required": false
        },
        {
          "name": "Safety Glasses",
          "description": "Always protect your eyes when soldering.",
          "required": true
        }
      ]
    }
  ],
  "tip": "If this is your first soldering project, consider practicing on a cheap practice kit first!"
}'),
('lesson-1-4', 'mod-1-getting-started', 'smartwatch-course', 'Safety Guidelines', 'Important safety information before you begin.', 'text', 4, 5, '{
  "sections": [
    {
      "title": "Electrical Safety",
      "type": "accordion",
      "items": [
        {
          "title": "Working with LiPo Batteries",
          "content": "LiPo batteries can be dangerous if mishandled. Never puncture, short-circuit, or expose to extreme heat. Always use the provided charging circuit.",
          "icon": "warning"
        },
        {
          "title": "Soldering Safety",
          "content": "Always work in a well-ventilated area. The soldering iron tip reaches 350C+ - never touch it or leave it unattended. Keep the iron in its holder when not in use.",
          "icon": "fire"
        },
        {
          "title": "ESD Protection",
          "content": "Electronic components can be damaged by static electricity. Touch a grounded metal object before handling components, or use an ESD wrist strap.",
          "icon": "zap"
        }
      ]
    },
    {
      "title": "Workspace Setup",
      "content": "Set up your workspace with good lighting, a clean surface, and proper ventilation. Keep food and drinks away from your work area.",
      "image": "/images/courses/smartwatch/workspace.jpg"
    }
  ],
  "emergency": "If a LiPo battery starts swelling, smoking, or gets hot, immediately move it to a non-flammable surface away from anything combustible. Do not attempt to use or charge it."
}'),
('lesson-1-5', 'mod-1-getting-started', 'smartwatch-course', 'Quiz: Getting Started', 'Test your knowledge before we begin building.', 'quiz', 5, 10, '{
  "passing_score": 70,
  "show_correct_answers": true,
  "randomize_questions": false
}');

-- Quiz questions for Module 1
INSERT OR REPLACE INTO quiz_questions (id, lesson_id, question_text, question_type, options_json, correct_answer, explanation, order_index, points) VALUES
('q1-1', 'lesson-1-5', 'What is the recommended soldering temperature for this project?', 'multiple_choice', 
 '["200C / 390F", "350C / 660F", "450C / 840F", "500C / 930F"]', 
 '350C / 660F', 
 '350C (660F) is the optimal temperature for lead-free solder and safe for the electronic components in this kit.', 1, 1),
('q1-2', 'lesson-1-5', 'LiPo batteries are safe to puncture as long as they are not charged.', 'true_false',
 '["True", "False"]',
 'False',
 'LiPo batteries should NEVER be punctured regardless of charge level. They contain flammable electrolyte that can cause fires.', 2, 1),
('q1-3', 'lesson-1-5', 'What microcontroller is included in your kit?', 'multiple_choice',
 '["Arduino Uno", "ESP32-S3", "Raspberry Pi Pico", "STM32"]',
 'ESP32-S3',
 'The ESP32-S3 is a powerful microcontroller with built-in WiFi and Bluetooth, perfect for wearable projects.', 3, 1),
('q1-4', 'lesson-1-5', 'Which of these is NOT included in your kit?', 'multiple_choice',
 '["Soldering iron", "Heart rate sensor", "Display module", "Watch strap"]',
 'Soldering iron',
 'The soldering iron is a tool you need to provide yourself - it is not included in the kit.', 4, 1),
('q1-5', 'lesson-1-5', 'What should you do if a LiPo battery starts swelling?', 'multiple_choice',
 '["Continue using it carefully", "Put it in the freezer", "Move it to a non-flammable surface and do not use it", "Puncture it to release the gas"]',
 'Move it to a non-flammable surface and do not use it',
 'A swelling LiPo is dangerous. Move it away from flammable materials and dispose of it properly at an electronics recycling center.', 5, 1);

-- Module 2: Understanding Components
INSERT OR REPLACE INTO course_modules (id, course_id, title, description, order_index) VALUES
('mod-2-components', 'smartwatch-course', 'Understanding the Components', 'Deep dive into each component and how they work together.', 2);

INSERT OR REPLACE INTO lessons (id, module_id, course_id, title, description, content_type, order_index, duration_minutes, content_json) VALUES
('lesson-2-1', 'mod-2-components', 'smartwatch-course', 'ESP32-S3 Microcontroller', 'Learn about the brain of your smartwatch.', 'video', 1, 15, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "key_points": [
    "Dual-core processor running at 240MHz",
    "Built-in WiFi and Bluetooth",
    "Low power modes for battery life",
    "GPIO pins for connecting sensors"
  ],
  "resources": [
    {"name": "ESP32-S3 Datasheet", "url": "/downloads/esp32-s3-datasheet.pdf", "type": "pdf"},
    {"name": "Pinout Reference", "url": "/downloads/esp32-s3-pinout.pdf", "type": "pdf"}
  ]
}'),
('lesson-2-2', 'mod-2-components', 'smartwatch-course', 'Display Module Deep Dive', 'Understanding the round TFT display.', 'text', 2, 12, '{
  "sections": [
    {
      "title": "GC9A01 Display Overview",
      "content": "Your kit includes a beautiful 1.28 inch round TFT display with 240x240 pixel resolution. This display uses the GC9A01 driver and communicates via SPI.",
      "image": "/images/courses/smartwatch/display-closeup.jpg"
    },
    {
      "title": "Technical Specifications",
      "type": "specs_table",
      "specs": [
        {"label": "Size", "value": "1.28 inches (32.4mm)"},
        {"label": "Resolution", "value": "240 x 240 pixels"},
        {"label": "Colors", "value": "65K (16-bit)"},
        {"label": "Interface", "value": "SPI (4-wire)"},
        {"label": "Driver IC", "value": "GC9A01"},
        {"label": "Viewing Angle", "value": "Full angle IPS"},
        {"label": "Operating Voltage", "value": "3.3V"}
      ]
    },
    {
      "title": "Pin Connections",
      "type": "accordion",
      "items": [
        {"title": "VCC", "content": "Connect to 3.3V power supply"},
        {"title": "GND", "content": "Connect to ground"},
        {"title": "SCL", "content": "SPI Clock - connect to GPIO 18"},
        {"title": "SDA", "content": "SPI Data (MOSI) - connect to GPIO 23"},
        {"title": "RES", "content": "Reset pin - connect to GPIO 4"},
        {"title": "DC", "content": "Data/Command select - connect to GPIO 2"},
        {"title": "CS", "content": "Chip Select - connect to GPIO 15"},
        {"title": "BLK", "content": "Backlight control - connect to GPIO 32"}
      ]
    }
  ],
  "downloads": [
    {"name": "GC9A01 Datasheet", "url": "/downloads/gc9a01-datasheet.pdf", "type": "pdf"},
    {"name": "Display Library", "url": "https://github.com/moononournation/Arduino_GFX", "type": "link"}
  ]
}'),
('lesson-2-3', 'mod-2-components', 'smartwatch-course', 'Sensors Explained', 'Heart rate sensor and accelerometer overview.', 'video', 3, 18, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "chapters": [
    {"time": "0:00", "title": "Introduction to sensors"},
    {"time": "2:30", "title": "MAX30102 Heart Rate Sensor"},
    {"time": "8:45", "title": "How PPG (photoplethysmography) works"},
    {"time": "12:00", "title": "MPU6050 Accelerometer/Gyroscope"},
    {"time": "15:30", "title": "I2C communication basics"}
  ],
  "key_points": [
    "MAX30102 uses light to measure blood oxygen and heart rate",
    "MPU6050 detects motion in 6 axes (3 accelerometer + 3 gyroscope)",
    "Both sensors use I2C protocol for communication"
  ]
}'),
('lesson-2-4', 'mod-2-components', 'smartwatch-course', 'Quiz: Component Knowledge', 'Test your understanding of the components.', 'quiz', 4, 10, '{
  "passing_score": 70,
  "show_correct_answers": true
}');

-- Quiz questions for Module 2
INSERT OR REPLACE INTO quiz_questions (id, lesson_id, question_text, question_type, options_json, correct_answer, explanation, order_index, points) VALUES
('q2-1', 'lesson-2-4', 'What communication protocol does the display use?', 'multiple_choice',
 '["I2C", "SPI", "UART", "USB"]',
 'SPI',
 'The GC9A01 display uses SPI (Serial Peripheral Interface) for fast data transfer needed for graphics.', 1, 1),
('q2-2', 'lesson-2-4', 'The MAX30102 heart rate sensor uses light to measure heart rate.', 'true_false',
 '["True", "False"]',
 'True',
 'The MAX30102 uses photoplethysmography (PPG) - it shines LED light through your skin and measures the light absorbed by blood.', 2, 1),
('q2-3', 'lesson-2-4', 'What is the resolution of the display?', 'multiple_choice',
 '["128 x 128", "240 x 240", "320 x 320", "480 x 480"]',
 '240 x 240',
 'The GC9A01 round display has a resolution of 240x240 pixels.', 3, 1),
('q2-4', 'lesson-2-4', 'How many axes does the MPU6050 measure?', 'multiple_choice',
 '["3 axes", "4 axes", "6 axes", "9 axes"]',
 '6 axes',
 'The MPU6050 has a 3-axis accelerometer and 3-axis gyroscope, for 6 total axes of motion detection.', 4, 1);

-- Module 3: Hardware Assembly
INSERT OR REPLACE INTO course_modules (id, course_id, title, description, order_index) VALUES
('mod-3-assembly', 'smartwatch-course', 'Hardware Assembly', 'Time to build! Follow along as we assemble the hardware.', 3);

INSERT OR REPLACE INTO lessons (id, module_id, course_id, title, description, content_type, order_index, duration_minutes, content_json) VALUES
('lesson-3-1', 'mod-3-assembly', 'smartwatch-course', 'Soldering Basics', 'Essential soldering techniques for beginners.', 'video', 1, 20, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "chapters": [
    {"time": "0:00", "title": "Soldering iron setup"},
    {"time": "3:00", "title": "Tinning the tip"},
    {"time": "5:30", "title": "Through-hole soldering technique"},
    {"time": "10:00", "title": "Surface mount soldering basics"},
    {"time": "14:00", "title": "Common mistakes to avoid"},
    {"time": "17:00", "title": "Desoldering and fixing mistakes"}
  ],
  "key_points": [
    "Heat the pad AND the component lead together",
    "Apply solder to the heated joint, not the iron",
    "A good joint is shiny and cone-shaped",
    "Keep the tip clean and tinned"
  ]
}'),
('lesson-3-2', 'mod-3-assembly', 'smartwatch-course', 'PCB Assembly Step-by-Step', 'Solder all components to the PCB.', 'video', 2, 35, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "chapters": [
    {"time": "0:00", "title": "PCB overview and orientation"},
    {"time": "4:00", "title": "Installing the ESP32-S3 module"},
    {"time": "12:00", "title": "Soldering the display connector"},
    {"time": "18:00", "title": "Adding the heart rate sensor"},
    {"time": "24:00", "title": "Installing the accelerometer"},
    {"time": "28:00", "title": "Battery connector and power circuit"},
    {"time": "32:00", "title": "Final inspection"}
  ],
  "important": "Follow the component order exactly as shown - some components block access to others if installed first."
}'),
('lesson-3-3', 'mod-3-assembly', 'smartwatch-course', 'Wiring Diagram', 'Interactive wiring reference.', 'text', 3, 10, '{
  "sections": [
    {
      "title": "Complete Wiring Diagram",
      "content": "Reference this diagram while assembling your smartwatch. Click on any connection to see details.",
      "image": "/images/courses/smartwatch/wiring-diagram.png",
      "type": "interactive_diagram"
    },
    {
      "title": "Connection Reference",
      "type": "accordion",
      "items": [
        {
          "title": "Display Connections (SPI)",
          "content": "VCC->3.3V, GND->GND, SCL->GPIO18, SDA->GPIO23, RES->GPIO4, DC->GPIO2, CS->GPIO15, BLK->GPIO32"
        },
        {
          "title": "Heart Rate Sensor (I2C)",
          "content": "VCC->3.3V, GND->GND, SDA->GPIO21, SCL->GPIO22, INT->GPIO35"
        },
        {
          "title": "Accelerometer (I2C)",
          "content": "VCC->3.3V, GND->GND, SDA->GPIO21, SCL->GPIO22 (shared I2C bus)"
        },
        {
          "title": "Battery & Power",
          "content": "Battery+->BAT+, Battery-->BAT-, USB->Charging circuit"
        }
      ]
    }
  ],
  "downloads": [
    {"name": "High-res Wiring Diagram", "url": "/downloads/smartwatch-wiring.pdf", "type": "pdf"},
    {"name": "Schematic (KiCad)", "url": "/downloads/smartwatch-schematic.zip", "type": "zip"}
  ]
}'),
('lesson-3-4', 'mod-3-assembly', 'smartwatch-course', 'Enclosure Assembly', 'Put it all together in the watch case.', 'video', 4, 15, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "key_points": [
    "Insert the display first - it clips into the front bezel",
    "Route the battery cable before seating the PCB",
    "Do not overtighten screws - the case is 3D printed",
    "The strap attaches with spring bars"
  ]
}'),
('lesson-3-5', 'mod-3-assembly', 'smartwatch-course', 'Troubleshooting Guide', 'Common issues and how to fix them.', 'text', 5, 15, '{
  "sections": [
    {
      "title": "Troubleshooting Common Issues",
      "type": "accordion",
      "items": [
        {
          "title": "Display not turning on",
          "content": "1. Check all solder joints on the display connector\\n2. Verify VCC and GND connections\\n3. Measure voltage at display VCC pin (should be 3.3V)\\n4. Check that backlight pin is connected\\n5. Try a different GPIO for the backlight",
          "icon": "display"
        },
        {
          "title": "ESP32 not recognized by computer",
          "content": "1. Try a different USB cable (must be data cable, not charge-only)\\n2. Install CP2102 or CH340 drivers\\n3. Check for shorts around the USB connector\\n4. Try a different USB port",
          "icon": "usb"
        },
        {
          "title": "Heart rate sensor not working",
          "content": "1. Verify I2C connections (SDA, SCL)\\n2. Run I2C scanner to check if device is detected (address 0x57)\\n3. Make sure sensor is pressed firmly against skin\\n4. Check for cold solder joints",
          "icon": "heart"
        },
        {
          "title": "Accelerometer not responding",
          "content": "1. Verify I2C connections\\n2. Check device address (0x68 or 0x69 depending on AD0 pin)\\n3. Run I2C scanner\\n4. Verify 3.3V power to sensor",
          "icon": "activity"
        },
        {
          "title": "Battery not charging",
          "content": "1. Check battery polarity (red = positive)\\n2. Verify charging IC solder joints\\n3. Measure voltage at battery terminals during charging\\n4. Check USB connection",
          "icon": "battery"
        }
      ]
    },
    {
      "title": "Still Stuck?",
      "content": "If you have tried the troubleshooting steps and still have issues, reach out for help!",
      "links": [
        {"text": "Community Discord", "url": "https://discord.gg/shortcircuit"},
        {"text": "Email Support", "url": "mailto:support@shortcct.com"},
        {"text": "Video Call Support (Booking)", "url": "https://calendly.com/shortcircuit"}
      ]
    }
  ]
}'),
('lesson-3-6', 'mod-3-assembly', 'smartwatch-course', 'Checkpoint: Assembly Photo', 'Upload a photo of your completed assembly.', 'submission', 6, 5, '{
  "title": "Assembly Checkpoint",
  "description": "Upload a photo of your completed PCB assembly before we move on to software.",
  "requirements": [
    "Clear, well-lit photo showing the entire PCB",
    "All components should be visible",
    "Solder joints should be visible (close-up recommended)",
    "Optional: Include a photo of any issues you encountered"
  ],
  "allow_multiple_photos": true,
  "allow_video": true,
  "require_description": true
}');

-- Module 4: Software Setup
INSERT OR REPLACE INTO course_modules (id, course_id, title, description, order_index) VALUES
('mod-4-software', 'smartwatch-course', 'Software Setup', 'Set up your development environment and upload your first code.', 4);

INSERT OR REPLACE INTO lessons (id, module_id, course_id, title, description, content_type, order_index, duration_minutes, content_json) VALUES
('lesson-4-1', 'mod-4-software', 'smartwatch-course', 'Arduino IDE Setup', 'Install and configure Arduino IDE for ESP32.', 'video', 1, 15, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "chapters": [
    {"time": "0:00", "title": "Downloading Arduino IDE"},
    {"time": "2:00", "title": "Installing ESP32 board support"},
    {"time": "6:00", "title": "Selecting the right board"},
    {"time": "9:00", "title": "Installing USB drivers"},
    {"time": "12:00", "title": "Testing the connection"}
  ],
  "resources": [
    {"name": "Arduino IDE Download", "url": "https://www.arduino.cc/en/software", "type": "link"},
    {"name": "ESP32 Board Manager URL", "url": "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json", "type": "text"},
    {"name": "CP2102 Drivers", "url": "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers", "type": "link"}
  ]
}'),
('lesson-4-2', 'mod-4-software', 'smartwatch-course', 'Installing Libraries', 'Add all required libraries to Arduino IDE.', 'text', 2, 10, '{
  "sections": [
    {
      "title": "Required Libraries",
      "content": "Install these libraries through the Arduino Library Manager (Sketch > Include Library > Manage Libraries):",
      "type": "library_list",
      "items": [
        {
          "name": "Arduino_GFX",
          "author": "moononournation",
          "description": "Graphics library for the GC9A01 display",
          "version": "1.3.7+"
        },
        {
          "name": "MAX30105",
          "author": "SparkFun",
          "description": "Heart rate sensor library",
          "version": "1.1.2+"
        },
        {
          "name": "MPU6050",
          "author": "Electronic Cats",
          "description": "Accelerometer/gyroscope library",
          "version": "0.6.0+"
        },
        {
          "name": "RTClib",
          "author": "Adafruit",
          "description": "Real-time clock functions",
          "version": "2.1.1+"
        }
      ]
    },
    {
      "title": "Verification",
      "content": "After installing all libraries, restart Arduino IDE and verify they appear in Sketch > Include Library."
    }
  ]
}'),
('lesson-4-3', 'mod-4-software', 'smartwatch-course', 'Your First Sketch', 'Upload a test program to verify everything works.', 'video', 3, 20, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "code_download": "/downloads/smartwatch-test-sketch.zip",
  "key_points": [
    "Select ESP32-S3 Dev Module as your board",
    "Choose the correct COM port",
    "Hold BOOT button while uploading if needed",
    "Watch the serial monitor for debug output"
  ]
}'),
('lesson-4-4', 'mod-4-software', 'smartwatch-course', 'Quiz: Software Setup', 'Verify your development environment is ready.', 'quiz', 4, 8, '{
  "passing_score": 70,
  "show_correct_answers": true
}');

-- Quiz questions for Module 4
INSERT OR REPLACE INTO quiz_questions (id, lesson_id, question_text, question_type, options_json, correct_answer, explanation, order_index, points) VALUES
('q4-1', 'lesson-4-4', 'Which board should you select in Arduino IDE for this project?', 'multiple_choice',
 '["Arduino Uno", "ESP32 Dev Module", "ESP32-S3 Dev Module", "NodeMCU"]',
 'ESP32-S3 Dev Module',
 'The kit uses an ESP32-S3 chip, so you need to select ESP32-S3 Dev Module from the boards menu.', 1, 1),
('q4-2', 'lesson-4-4', 'The Arduino_GFX library is used for controlling the display.', 'true_false',
 '["True", "False"]',
 'True',
 'Arduino_GFX is a graphics library that supports many displays including the GC9A01 in your kit.', 2, 1),
('q4-3', 'lesson-4-4', 'If the ESP32 is not uploading, what should you try first?', 'multiple_choice',
 '["Replace the ESP32", "Hold the BOOT button during upload", "Use a different computer", "Contact support"]',
 'Hold the BOOT button during upload',
 'Holding the BOOT button puts the ESP32 into bootloader mode, which is often needed for the first upload.', 3, 1);

-- Module 5: Programming Features
INSERT OR REPLACE INTO course_modules (id, course_id, title, description, order_index) VALUES
('mod-5-features', 'smartwatch-course', 'Programming Features', 'Build out all the smartwatch features with code.', 5);

INSERT OR REPLACE INTO lessons (id, module_id, course_id, title, description, content_type, order_index, duration_minutes, content_json) VALUES
('lesson-5-1', 'mod-5-features', 'smartwatch-course', 'Watch Face & Time Display', 'Create beautiful watch faces.', 'video', 1, 25, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "code_download": "/downloads/watchface-code.zip"
}'),
('lesson-5-2', 'mod-5-features', 'smartwatch-course', 'Step Counter', 'Implement step counting with the accelerometer.', 'video', 2, 20, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "code_download": "/downloads/stepcounter-code.zip"
}'),
('lesson-5-3', 'mod-5-features', 'smartwatch-course', 'Heart Rate Monitor', 'Read and display heart rate data.', 'video', 3, 25, '{
  "video_id": "dQw4w9WgXcQ",
  "video_platform": "youtube",
  "code_download": "/downloads/heartrate-code.zip"
}'),
('lesson-5-4', 'mod-5-features', 'smartwatch-course', 'Checkpoint: Working Demo', 'Show us your smartwatch in action!', 'submission', 4, 5, '{
  "title": "Working Demo Checkpoint",
  "description": "Record a short video showing your smartwatch displaying time, counting steps, or reading heart rate.",
  "requirements": [
    "Video showing at least one working feature",
    "15-60 seconds long",
    "Can be uploaded to YouTube (unlisted) or submitted directly"
  ],
  "allow_multiple_photos": true,
  "allow_video": true,
  "require_description": true
}');

-- Module 6: Final Project
INSERT OR REPLACE INTO course_modules (id, course_id, title, description, order_index) VALUES
('mod-6-final', 'smartwatch-course', 'Final Project', 'Complete your smartwatch and earn your certificate!', 6);

INSERT OR REPLACE INTO lessons (id, module_id, course_id, title, description, content_type, order_index, duration_minutes, content_json) VALUES
('lesson-6-1', 'mod-6-final', 'smartwatch-course', 'Final Testing Checklist', 'Make sure everything works perfectly.', 'text', 1, 15, '{
  "sections": [
    {
      "title": "Final Testing Checklist",
      "type": "checklist",
      "items": [
        {"name": "Display shows time correctly", "required": true},
        {"name": "Step counter responds to movement", "required": true},
        {"name": "Heart rate sensor detects pulse", "required": true},
        {"name": "Battery charges via USB", "required": true},
        {"name": "Watch survives gentle handling", "required": true},
        {"name": "All buttons/touch inputs work", "required": false},
        {"name": "WiFi connects (if implemented)", "required": false},
        {"name": "Custom watch face displays", "required": false}
      ]
    }
  ]
}'),
('lesson-6-2', 'mod-6-final', 'smartwatch-course', 'Final Submission', 'Submit your completed project for certification.', 'submission', 2, 10, '{
  "title": "Final Project Submission",
  "description": "Submit your completed smartwatch project to earn your Certificate of Completion!",
  "requirements": [
    "Photo of completed smartwatch (worn or displayed)",
    "Video demonstration (30-120 seconds) showing all features",
    "Brief writeup describing your experience and any modifications you made"
  ],
  "allow_multiple_photos": true,
  "allow_video": true,
  "require_description": true,
  "triggers_certificate": true
}');
