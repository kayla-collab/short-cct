-- Full Smartwatch Course Content Migration
-- This populates the complete course structure from the official documentation

-- First, clear existing course data to avoid duplicates
DELETE FROM quiz_questions;
DELETE FROM lessons;
DELETE FROM course_modules;
DELETE FROM courses WHERE id = 'smartwatch-course';

-- Insert the main course
INSERT INTO courses (id, title, description, product_id, thumbnail_url, total_lessons, total_quizzes, estimated_hours, is_published)
VALUES (
  'smartwatch-course',
  'Build Your Own Smartwatch',
  'Design and implement a fully functioning smartwatch using the LilyGo T-Watch 2020 V3. Learn embedded C/C++ programming, RTOS, hardware drivers, and professional firmware architecture.',
  'smartwatch-kit',
  '/images/smartwatch-course-thumb.jpg',
  26,
  5,
  40,
  1
);

-- Module 0: Training Materials (Foundation)
INSERT INTO course_modules (id, course_id, title, description, order_index, is_published)
VALUES ('module-0', 'smartwatch-course', 'Training Materials', 'Core embedded systems concepts and programming fundamentals needed throughout the project.', 0, 1);

-- Training Material Lessons
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, content_json, order_index, duration_minutes, is_published)
VALUES 
('lesson-0-1', 'module-0', 'smartwatch-course', 'Modular Architecture', 'Learn how professional embedded firmware is structured for maintainability and scalability.', 'text', 
'{"sections":[{"title":"Overview","content":"In professional embedded systems, firmware is rarely written as a single file. Instead, it is structured to be modular, maintainable, and scalable. In PlatformIO it is recommended that you use the /include and /src directories for your header (.h) and source (.c/.cpp) files respectively."},{"title":"Key Concepts","content":"This separation ensures components are independent, easier to debug, and maintainable. Each module handles a specific responsibility (power, display, sensors) with clear interfaces."},{"title":"Directory Structure","content":"```\\n/include\\n  power.h\\n  display.h\\n  sensors.h\\n/src\\n  power.cpp\\n  display.cpp\\n  sensors.cpp\\n  main.cpp\\n```"}]}', 
0, 15, 1),

('lesson-0-2', 'module-0', 'smartwatch-course', 'File Structure', 'Understand header files, source files, and their roles in C/C++ projects.', 'text',
'{"sections":[{"title":"Header Files (.h)","content":"Define the interface and contain declarations (function prototypes, constants, structs, enums) but no executable code. They describe WHAT a module provides."},{"title":"C Source Files (.c)","content":"Contain implementation and logic. Helper functions are often marked as static to limit visibility to the file."},{"title":"C++ Source Files (.cpp)","content":"Used for C++ features like classes and objects, common when using Arduino or FreeRTOS libraries."},{"title":"Include Guards","content":"```c\\n#ifndef POWER_H\\n#define POWER_H\\n\\n// declarations here\\n\\n#endif\\n```"}]}',
1, 15, 1),

('lesson-0-3', 'module-0', 'smartwatch-course', 'Project Layers', 'Learn the five-layer model for well-structured embedded firmware.', 'text',
'{"sections":[{"title":"Layer 1: Hardware","content":"Physical electronics including sensors, MCU, display, and other components."},{"title":"Layer 2: Hardware Abstraction Layer (HAL)","content":"Lowest software level that interacts with hardware registers to provide readable APIs."},{"title":"Layer 3: OS/Middleware/Service","content":"Provides services like task scheduling (RTOS), timing, and communication stacks."},{"title":"Layer 4: Application Logic","content":"The brain that manages system states and decision-making."},{"title":"Layer 5: Application Interface","content":"Top layer responsible for the UI and exposing APIs to external systems."}]}',
2, 20, 1),

('lesson-0-4', 'module-0', 'smartwatch-course', 'Pointers and References', 'Master memory addresses, pointer arithmetic, and safe data passing techniques.', 'text',
'{"sections":[{"title":"What is a Pointer?","content":"A pointer is a variable that stores the memory address of another variable. Declared as: int *ptr;"},{"title":"Why Use Pointers?","content":"Direct hardware interaction, passing large data without copying, and dynamic memory management."},{"title":"Passing by Pointer vs Value","content":"```c\\nvoid modifyByValue(int x) { x = 10; } // Original unchanged\\nvoid modifyByPointer(int *x) { *x = 10; } // Original modified\\n```"},{"title":"The const Keyword","content":"Use const to protect data or pointer addresses from accidental modification."},{"title":"Volatile Keyword","content":"Shared variables in ISRs must use volatile to prevent compiler optimization issues."}]}',
3, 25, 1),

('lesson-0-5', 'module-0', 'smartwatch-course', 'Bit Manipulation', 'Learn bitwise operators and techniques for working with hardware registers.', 'text',
'{"sections":[{"title":"Why Bit Manipulation?","content":"Embedded hardware frequently represents information using individual bits, bit fields, and packed binary values. For example, the PCF8563 RTC stores hours in just 6 bits."},{"title":"Bitwise Operators","content":"AND (&) - clear/select bits\\nOR (|) - set bits\\nXOR (^) - flip bits\\nNOT (~) - invert all bits\\nLeft Shift (<<) - multiply by powers of 2\\nRight Shift (>>) - divide by powers of 2"},{"title":"Bit Masking Example","content":"```c\\n// Clear bit 7 using mask 0x7F (01111111)\\nuint8_t hours = raw_value & 0x7F;\\n```"},{"title":"Setting Bits","content":"```c\\n// Set bit 3\\nvalue |= (1 << 3);\\n```"}]}',
4, 20, 1),

('lesson-0-6', 'module-0', 'smartwatch-course', 'I2C Communication', 'Understand the I2C protocol used to communicate with sensors and peripherals.', 'text',
'{"sections":[{"title":"What is I2C?","content":"I2C (Inter-Integrated Circuit) is a two-wire serial communication protocol using SDA (data) and SCL (clock) lines."},{"title":"Hardware Requirements","content":"External pull-up resistors (typically 4.7k ohms) are required. Supports multiple slave devices with unique 7-bit addresses."},{"title":"Protocol Sequence","content":"START -> Slave Address + R/W bit -> ACK -> Data bytes -> STOP"},{"title":"ESP32 Implementation","content":"```cpp\\n#include <Wire.h>\\nWire.begin(SDA_PIN, SCL_PIN);\\nWire.beginTransmission(0x38); // Address\\nWire.write(register);\\nWire.endTransmission();\\n```"},{"title":"Error Handling","content":"Always check esp_err_t return values for ESP_OK to ensure successful communication."}]}',
5, 25, 1),

('lesson-0-7', 'module-0', 'smartwatch-course', 'Object-Oriented Basics', 'Learn C++ classes and objects for managing hardware complexity.', 'text',
'{"sections":[{"title":"Why OOP in Embedded?","content":"Object-oriented programming helps manage complexity by encapsulating hardware control logic within classes (display drivers, sensor interfaces)."},{"title":"Classes and Objects","content":"A class is a blueprint for data and functions. Objects are instances of a class in memory with their own internal state."},{"title":"Example Class","content":"```cpp\\nclass Display {\\nprivate:\\n    int brightness;\\npublic:\\n    void init();\\n    void drawText(const char* text);\\n};\\n```"},{"title":"Access Specifiers","content":"public - accessible outside the class\\nprivate - internal implementation only"}]}',
6, 20, 1),

('lesson-0-8', 'module-0', 'smartwatch-course', 'Real Time Operating System (RTOS)', 'Learn FreeRTOS fundamentals for concurrent task management.', 'text',
'{"sections":[{"title":"What is RTOS?","content":"A Real Time Operating System enables multiple pieces of code (tasks) to execute seemingly at the same time on a single processor through rapid context switching."},{"title":"Tasks","content":"Independent threads managed by a scheduler. They must never return and should use vTaskDelay() instead of blocking delays."},{"title":"Creating a Task","content":"```cpp\\nvoid myTask(void *param) {\\n    while(1) {\\n        // Do work\\n        vTaskDelay(pdMS_TO_TICKS(100));\\n    }\\n}\\nxTaskCreate(myTask, \"MyTask\", 2048, NULL, 1, NULL);\\n```"},{"title":"Semaphores and Mutexes","content":"Binary semaphores act as locks/flags for events. Mutexes protect shared resources like the I2C bus."},{"title":"Task Communication","content":"Use queues, task notifications, and event groups for inter-task communication."}]}',
7, 30, 1),

('lesson-0-9', 'module-0', 'smartwatch-course', 'Static and Volatile Keywords', 'Understand these critical keywords for embedded development.', 'text',
'{"sections":[{"title":"Static Keyword","content":"Inside functions: retains value between calls\\nFor global variables/functions: limits visibility to the specific source file (file-scoping)"},{"title":"Static Example","content":"```c\\nvoid counter() {\\n    static int count = 0; // Persists across calls\\n    count++;\\n}\\n```"},{"title":"Volatile Keyword","content":"Forces the compiler to always read the variable from memory, preventing optimizations that might miss changes made by ISRs or hardware."},{"title":"Combined Usage","content":"```c\\nstatic volatile bool buttonPressed = false;\\n```\\nOften used for variables shared between an ISR and main code within a single driver file."}]}',
8, 15, 1),

('lesson-0-10', 'module-0', 'smartwatch-course', 'Timing and Scheduling', 'Master blocking vs non-blocking delays and hardware timers.', 'text',
'{"sections":[{"title":"Blocking Delays","content":"Halt execution entirely. Discouraged in production as they waste power and freeze UI.\\n```cpp\\ndelay(1000); // Bad in production\\n```"},{"title":"Non-Blocking Delays","content":"Check elapsed time (polling) to allow other tasks to run.\\n```cpp\\nif (millis() - lastUpdate > 1000) {\\n    // Do work\\n    lastUpdate = millis();\\n}\\n```"},{"title":"RTOS Timing","content":"vTaskDelay() suspends tasks for a specific number of ticks (usually 1ms on ESP32), allowing other tasks to run."},{"title":"Hardware Timers","content":"Used for microsecond precision, bypassing the scheduler for time-critical operations."}]}',
9, 20, 1),

('lesson-0-11', 'module-0', 'smartwatch-course', 'Interrupts and ISRs', 'Learn low-latency hardware event handling.', 'text',
'{"sections":[{"title":"What is an Interrupt?","content":"A hardware or software signal that temporarily pauses normal program execution to respond to an event (button press, sensor data ready)."},{"title":"IRAM_ATTR Attribute","content":"On ESP32, ISR code must be placed in internal RAM to ensure availability if flash is busy.\\n```cpp\\nvoid IRAM_ATTR buttonISR() {\\n    buttonPressed = true;\\n}\\n```"},{"title":"Trigger Types","content":"Falling edge, rising edge, or level-based. T-Watch uses falling edge for touch and accelerometer interrupts."},{"title":"ISR Best Practices","content":"Keep ISRs extremely short - only set flags or signal semaphores. Defer all heavy logic to tasks."}]}',
10, 20, 1),

('lesson-0-12', 'module-0', 'smartwatch-course', 'Finite State Machine (FSM)', 'Model complex system behavior with states and transitions.', 'text',
'{"sections":[{"title":"What is an FSM?","content":"A structured model that organizes system behavior into a finite number of well-defined states with explicit transitions between them."},{"title":"Components","content":"States: distinct modes of operation\\nTransitions: triggered by events (gestures, timers, sensor data)\\nActions: behavior executed when entering/exiting states"},{"title":"Implementation","content":"```cpp\\nenum ScreenState { HOME, STEPS, WIFI, STOPWATCH };\\nScreenState currentScreen = HOME;\\n\\nswitch(currentScreen) {\\n    case HOME: drawHomeScreen(); break;\\n    case STEPS: drawStepsScreen(); break;\\n    // ...\\n}\\n```"},{"title":"Use Cases","content":"Ideal for UI/screen navigation, power management states, and communication protocols."}]}',
11, 20, 1),

('lesson-0-13', 'module-0', 'smartwatch-course', 'Networking', 'Connect your smartwatch to Wi-Fi and synchronize time.', 'text',
'{"sections":[{"title":"ESP32 Wi-Fi","content":"The ESP32 includes an integrated Wi-Fi radio and full TCP/IP networking stack. Note: Only 2.4 GHz networks are supported."},{"title":"Connection Modes","content":"Station Mode: Connect to an existing router\\nAccess Point Mode: Create your own network"},{"title":"NTP Time Sync","content":"Network Time Protocol allows synchronizing the RTC with internet time servers.\\n```cpp\\nconfigTime(gmtOffset, daylightOffset, ntpServer);\\nstruct tm timeinfo;\\ngetLocalTime(&timeinfo);\\n```"},{"title":"Power Considerations","content":"Wi-Fi connections should be disabled when not in use to conserve battery."}]}',
12, 20, 1);

-- Module 1: System Boot and Basic Output
INSERT INTO course_modules (id, course_id, title, description, order_index, is_published)
VALUES ('module-1', 'smartwatch-course', 'Module 1: System Boot', 'Bring the smartwatch to life by initializing system power, displaying output, and handling hardware interrupts.', 1, 1);

INSERT INTO lessons (id, module_id, course_id, title, description, content_type, content_json, order_index, duration_minutes, is_published)
VALUES 
('lesson-1-1', 'module-1', 'smartwatch-course', 'Task 1: Initialize System Power', 'Configure the AXP202 power management system for device boot.', 'text',
'{"sections":[{"title":"Objective","content":"Configure the power management system so the watch can boot and supply power to required peripherals."},{"title":"Implementation Steps","content":"1. Use the AXP20X.h library to control the AXP202 power management IC\\n2. Establish I2C communication with the AXP202\\n3. Enable the appropriate LDOs to power the system and display\\n4. Review example code provided by the AXP20X library\\n5. Identify required power rails using the schematic"},{"title":"Key Files","content":"power.h and power.cpp - handles AXP202 power initialization and control"},{"title":"Hardware Reference","content":"Consult the T-Watch schematic to identify which LDOs power which components."}]}',
0, 45, 1),

('lesson-1-2', 'module-1', 'smartwatch-course', 'Task 2: Display Text Using TFT_eSPI', 'Verify display functionality by rendering text after boot.', 'text',
'{"sections":[{"title":"Objective","content":"Verify that the display is functioning by printing text after system boot."},{"title":"Implementation Steps","content":"1. Use the TFT_eSPI library to interface with the ST7789V display\\n2. Initialize the display before writing any graphics\\n3. Print the text Hello World after boot\\n4. Experiment with text color, background color, and position"},{"title":"Key Files","content":"display.h and display.cpp - handles display initialization and graphics output"},{"title":"Code Example","content":"```cpp\\n#include <TFT_eSPI.h>\\nTFT_eSPI tft = TFT_eSPI();\\n\\nvoid initDisplay() {\\n    tft.init();\\n    tft.setRotation(2);\\n    tft.fillScreen(TFT_BLACK);\\n    tft.setTextColor(TFT_WHITE);\\n    tft.drawString(\"Hello World\", 60, 100);\\n}\\n```"}]}',
1, 45, 1),

('lesson-1-3', 'module-1', 'smartwatch-course', 'Task 3: Power Button Interrupt', 'Implement hardware interrupt to toggle display state.', 'text',
'{"sections":[{"title":"Objective","content":"Use a hardware interrupt to toggle the display on and off using the side button."},{"title":"Implementation Steps","content":"1. The side button is connected to the interrupt pin of the AXP202\\n2. Identify the correct interrupt pin using the schematic\\n3. Create an ISR marked with IRAM_ATTR\\n4. Keep the ISR minimal - only set a flag\\n5. Use axp.clearIRQ() to clear interrupt status"},{"title":"Code Pattern","content":"```cpp\\nvolatile bool buttonPressed = false;\\n\\nvoid IRAM_ATTR buttonISR() {\\n    buttonPressed = true;\\n}\\n\\nvoid loop() {\\n    if (buttonPressed) {\\n        buttonPressed = false;\\n        axp.clearIRQ();\\n        toggleDisplay();\\n    }\\n}\\n```"},{"title":"Deliverable","content":"Working demo showing the watch booting, displaying text, and responding to button presses."}]}',
2, 60, 1);

-- Module 1 Quiz
INSERT INTO quiz_questions (id, lesson_id, question_text, question_type, options_json, correct_answer, explanation, order_index, points)
VALUES 
('q1-1', 'lesson-1-3', 'What attribute must be used for ISR functions on ESP32?', 'multiple_choice', 
'["ICACHE_ATTR","IRAM_ATTR","ISR_ATTR","FLASH_ATTR"]', 'IRAM_ATTR', 
'IRAM_ATTR ensures the ISR code is placed in internal RAM so it is available even when flash is busy.', 0, 10),

('q1-2', 'lesson-1-3', 'Why should ISR code be kept minimal?', 'multiple_choice',
'["To save memory","To prevent blocking other interrupts and system operations","ISRs can only contain 10 lines of code","To make debugging easier"]', 
'To prevent blocking other interrupts and system operations',
'Long ISRs can cause system instability by blocking other critical operations. Heavy logic should be deferred to tasks.', 1, 10);

-- Module 2: Timekeeping and Connectivity
INSERT INTO course_modules (id, course_id, title, description, order_index, is_published)
VALUES ('module-2', 'smartwatch-course', 'Module 2: Timekeeping', 'Implement RTC storage, Wi-Fi time sync, and formatted time display.', 2, 1);

INSERT INTO lessons (id, module_id, course_id, title, description, content_type, content_json, order_index, duration_minutes, is_published)
VALUES 
('lesson-2-1', 'module-2', 'smartwatch-course', 'Task 1: RTC Storage and Retrieval', 'Use the PCF8563 to store and retrieve time across reboots.', 'text',
'{"sections":[{"title":"Objective","content":"Use the PCF8563 real time clock to store and retrieve the current date and time."},{"title":"Requirements","content":"- Time in 24-hour format (00:00 to 23:59)\\n- Date includes month, day, and year\\n- All firmware in C using driver/i2c.h and esp_err.h"},{"title":"Implementation Steps","content":"1. Use the tm structure from the standard time library\\n2. Write low-level byte read/write functions for the RTC\\n3. Wrap with higher-level functions for external use\\n4. Use bcdToDec and decToBcd helper functions\\n5. Study PCF8563 datasheet for register layout"},{"title":"Key Files","content":"mytime.h and mytime.c - handles RTC communication and time conversion logic"}]}',
0, 60, 1),

('lesson-2-2', 'module-2', 'smartwatch-course', 'Task 2: Wi-Fi Time Synchronization', 'Sync time from the internet using NTP.', 'text',
'{"sections":[{"title":"Objective","content":"Connect to Wi-Fi during boot and retrieve current time via NTP."},{"title":"Implementation Steps","content":"1. Use WiFi.h library to connect to a 2.4 GHz network\\n2. Call syncTimeWithNTP() after connecting\\n3. Use getLocalTime(&time) to retrieve synchronized time\\n4. If Wi-Fi unavailable, fallback to RTC\\n5. Initialize Wi-Fi during startup only"},{"title":"Code Pattern","content":"```cpp\\nWiFi.begin(ssid, password);\\nwhile (WiFi.status() != WL_CONNECTED) {\\n    delay(500);\\n}\\nconfigTime(gmtOffset, daylightOffset, ntpServer);\\nstruct tm timeinfo;\\ngetLocalTime(&timeinfo);\\n```"},{"title":"Key Files","content":"mywifi.h and mywifi.cpp - handles Wi-Fi initialization and time synchronization"}]}',
1, 45, 1),

('lesson-2-3', 'module-2', 'smartwatch-course', 'Task 3: Time Display Formatting', 'Display time and date in proper format with efficient updates.', 'text',
'{"sections":[{"title":"Objective","content":"Display current time and date on screen in readable format."},{"title":"Format Requirements","content":"- Time: HH:MM (24-hour military time)\\n- Date: MM DD YYYY\\n- Screen refresh only once every 40 seconds"},{"title":"Implementation Steps","content":"1. Use snprintf to format time and date strings\\n2. Ensure display updates are non-blocking\\n3. Integrate with existing display driver\\n4. Do not interfere with other system tasks"},{"title":"Code Example","content":"```cpp\\nchar timeStr[6];\\nsnprintf(timeStr, sizeof(timeStr), \"%02d:%02d\", hour, minute);\\ntft.drawString(timeStr, x, y);\\n```"}]}',
2, 30, 1);

-- Module 3: Inputs and Sensors
INSERT INTO course_modules (id, course_id, title, description, order_index, is_published)
VALUES ('module-3', 'smartwatch-course', 'Module 3: Inputs & Sensors', 'Integrate touch input, accelerometer, and Wi-Fi status screens.', 3, 1);

INSERT INTO lessons (id, module_id, course_id, title, description, content_type, content_json, order_index, duration_minutes, is_published)
VALUES 
('lesson-3-1', 'module-3', 'smartwatch-course', 'Task 1: Touch Coordinate Extraction', 'Implement touch driver for the FT6236U controller.', 'text',
'{"sections":[{"title":"Objective","content":"Create a program that prints x and y coordinates of touch events."},{"title":"Technical Details","content":"- FT6236U uses I2C address 0x38\\n- Use interrupt-driven approach for touch detection\\n- Keep ISRs minimal, defer processing to main code\\n- Parse x and y from device registers correctly"},{"title":"Implementation Steps","content":"1. Set up I2C communication with address 0x38\\n2. Configure interrupt pin for falling edge\\n3. In ISR, set touch flag only\\n4. In main loop, read coordinates when flag is set\\n5. Display coordinates on screen"},{"title":"Key Files","content":"touch.h and touch.c - handles FT6236U communication and coordinate extraction"}]}',
0, 60, 1),

('lesson-3-2', 'module-3', 'smartwatch-course', 'Task 2: Step Count Screen', 'Display step count from the BMA423 accelerometer.', 'text',
'{"sections":[{"title":"Objective","content":"Create a screen that displays total step count from the BMA423."},{"title":"Implementation Steps","content":"1. Initialize the BMA423 accelerometer\\n2. Use the provided Accel class abstraction\\n3. Retrieve stored step count value\\n4. Display in readable format on screen\\n5. Update periodically"},{"title":"Key Files","content":"accel.h and accel.cpp - handles BMA423 initialization and step count retrieval"},{"title":"Note","content":"Use the provided accelerometer abstraction rather than accessing registers directly."}]}',
1, 45, 1),

('lesson-3-3', 'module-3', 'smartwatch-course', 'Task 3: Wi-Fi Status Screen', 'Create status display with manual reconnection button.', 'text',
'{"sections":[{"title":"Objective","content":"Create a screen displaying Wi-Fi connection status with reconnection capability."},{"title":"Required States","content":"1. Wi-Fi Connected - display network SSID\\n2. Wi-Fi Connecting - show connecting indicator\\n3. Wi-Fi Not Connected - show disconnected status"},{"title":"Implementation Steps","content":"1. Track Wi-Fi state internally\\n2. Use drawWiFiSymbol helper function\\n3. Use drawRefreshSymbol for reconnect button\\n4. Update screen responsively but not excessively\\n5. Implement manual reconnection on button press"},{"title":"Key Files","content":"mywifi.h and mywifi.cpp - handles Wi-Fi state management and reconnection logic"}]}',
2, 45, 1);

-- Module 4: Final Integration
INSERT INTO course_modules (id, course_id, title, description, order_index, is_published)
VALUES ('module-4', 'smartwatch-course', 'Module 4: Final Integration', 'Integrate all features into a cohesive RTOS-based application.', 4, 1);

INSERT INTO lessons (id, module_id, course_id, title, description, content_type, content_json, order_index, duration_minutes, is_published)
VALUES 
('lesson-4-1', 'module-4', 'smartwatch-course', 'Task 1: Stopwatch Screen', 'Create persistent stopwatch with start/stop/reset functionality.', 'text',
'{"sections":[{"title":"Objective","content":"Create a stopwatch that continues running even when navigating away from the screen."},{"title":"Requirements","content":"- Display format: HH MM SS\\n- Support Start, Stop, and Reset\\n- Continue timing in background\\n- Use semaphores for display coordination"},{"title":"Key Concept","content":"Separate timing logic from display rendering. The stopwatch state must persist independently of which screen is active."},{"title":"Implementation Notes","content":"Do not reset or pause the stopwatch when navigating between screens. Use RTOS tasks to manage timing independently."}]}',
0, 60, 1),

('lesson-4-2', 'module-4', 'smartwatch-course', 'Task 2: Screen Navigation', 'Implement touch-based navigation between all screens.', 'text',
'{"sections":[{"title":"Objective","content":"Design touch buttons for navigating between all screens."},{"title":"Screens to Support","content":"- Home screen (time/date)\\n- Step count screen\\n- Wi-Fi status screen\\n- Stopwatch screen"},{"title":"Implementation Guidelines","content":"1. Centralize screen state management\\n2. Use touch events (not polling) for transitions\\n3. Ensure only one screen is active at a time\\n4. Make button interactions responsive and consistent"},{"title":"FSM Approach","content":"Use an enum for screen states and a switch statement for handling each screen display and transitions."}]}',
1, 45, 1),

('lesson-4-3', 'module-4', 'smartwatch-course', 'Task 3: Battery Display', 'Show live battery percentage on home screen.', 'text',
'{"sections":[{"title":"Objective","content":"Display real-time battery percentage on the home screen."},{"title":"Implementation Steps","content":"1. Use AXP20X library to read battery data\\n2. Call drawBatterySymbol function with percentage value\\n3. Update dynamically without interfering with other display operations\\n4. Position appropriately on home screen"},{"title":"Code Pattern","content":"```cpp\\nint batteryPercent = axp.getBattPercentage();\\ndrawBatterySymbol(batteryPercent);\\n```"}]}',
2, 30, 1),

('lesson-4-4', 'module-4', 'smartwatch-course', 'Task 4: RTOS Architecture', 'Structure firmware using FreeRTOS for concurrent operation.', 'text',
'{"sections":[{"title":"Objective","content":"Structure the firmware using RTOS to handle multiple subsystems concurrently."},{"title":"Recommended Tasks","content":"- Display update task\\n- Input handling task\\n- Timekeeping task\\n- Sensor polling task\\n- Networking task"},{"title":"Implementation Guidelines","content":"1. Assign priorities based on timing sensitivity\\n2. Use semaphores/notifications for inter-task communication\\n3. Keep ISRs minimal, defer to tasks\\n4. Ensure tasks do not block each other"},{"title":"Priority Example","content":"High: Input handling (responsive UI)\\nMedium: Display updates, timekeeping\\nLow: Sensor polling, networking"}]}',
3, 60, 1);

-- Module 5: Design Challenge
INSERT INTO course_modules (id, course_id, title, description, order_index, is_published)
VALUES ('module-5', 'smartwatch-course', 'Design Challenge', 'Compete for prizes by extending your smartwatch with innovative features.', 5, 1);

INSERT INTO lessons (id, module_id, course_id, title, description, content_type, content_json, order_index, duration_minutes, is_published)
VALUES 
('lesson-5-1', 'module-5', 'smartwatch-course', 'Short Circuit Design Challenge', 'Submit your enhanced smartwatch project for prize consideration.', 'text',
'{"sections":[{"title":"Prizes","content":"- First Place: $1,000\\n- Second Place: $750\\n- Third Place: $500"},{"title":"Recognition","content":"- Featured profile on Short Circuit website\\n- Verified Certificate of Achievement\\n- Access to private mentorship group\\n- Complimentary future project kit"},{"title":"Requirements","content":"- Must be active university student\\n- Must meaningfully extend the baseline project"},{"title":"Extension Ideas","content":"- Custom health dashboard with activity visualization\\n- Adaptive power management for extended battery life\\n- Advanced step counting algorithms\\n- Custom watch face designs\\n- Cloud data synchronization\\n- Notification integration\\n- Sleep tracking features"}]}',
0, 30, 1);

-- Final Module Quiz
INSERT INTO quiz_questions (id, lesson_id, question_text, question_type, options_json, correct_answer, explanation, order_index, points)
VALUES 
('q4-1', 'lesson-4-4', 'In FreeRTOS, what function should be used instead of delay() for timing?', 'multiple_choice',
'["sleep()","wait()","vTaskDelay()","hold()"]', 'vTaskDelay()',
'vTaskDelay() properly suspends the task and allows other tasks to run, unlike delay() which blocks everything.', 0, 10),

('q4-2', 'lesson-4-4', 'What should you use to protect shared resources accessed by multiple tasks?', 'multiple_choice',
'["Global variables","Mutex or Semaphore","Static variables","Inline functions"]', 'Mutex or Semaphore',
'Mutexes and semaphores provide synchronization to prevent race conditions when multiple tasks access shared resources.', 1, 10),

('q4-3', 'lesson-4-4', 'Which task should have highest priority in a smartwatch UI?', 'multiple_choice',
'["Networking","Sensor polling","Input handling","Data logging"]', 'Input handling',
'Input handling should have high priority to ensure the UI feels responsive to user interactions.', 2, 10);
