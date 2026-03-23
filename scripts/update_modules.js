/**
 * Script to update module lessons with combined content
 * Run with: node scripts/update_modules.js
 */

// Module 1 combined content
const module1Content = [
  {"type":"text","content":"In this module, you will bring the smartwatch to life by initializing system power, displaying output on the screen, and handling a hardware interrupt. By the end of this module, the watch should successfully boot, display text, and respond to a button press."},
  {"type":"header","content":"Task 1: Initialize System Power Using the AXP202"},
  {"type":"text","content":"Configure the power management system so the watch can boot and supply power to required peripherals."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Use the AXP20X.h library to control the AXP202 power management IC","Establish I2C communication with the AXP202","Identify required power rails using the schematic","Enable the appropriate LDOs to power the system and display","Review example code provided by the AXP20X library"]},
  {"type":"header","content":"Task 2: Display Text Using TFT_eSPI"},
  {"type":"text","content":"Verify that the display is functioning by printing text after system boot."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Use the TFT_eSPI library to interface with the display","Initialize the display before writing any graphics","Print the text Hello World after boot","Experiment with text color, background color, and position"]},
  {"type":"header","content":"Task 3: Implement a Hardware Interrupt for the Power Button"},
  {"type":"text","content":"Use a hardware interrupt to toggle the display on and off using the side button."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["The side button is connected to the interrupt pin of the AXP202","Identify the correct interrupt pin using the schematic","Refer to the Interrupts and ISRs section for proper ISR structure","Keep the ISR minimal and defer logic to the main program or task","Use a shared flag or notification to toggle display state"]},
  {"type":"video_placeholder","content":"[VIDEO: Module 1 Demo - Add the video labeled Module 1 Demo here]"},
  {"type":"header","content":"Deliverables and File Structure"},
  {"type":"text","content":"All code for this module must be implemented using the following structure:"},
  {"type":"bullets","content":["power.h and power.cpp handles AXP202 power initialization and control","display.h and display.cpp handles display initialization and graphics output","main.cpp coordinates system startup and high-level behavior"]},
  {"type":"text","content":"No functionality should be implemented directly inside main.cpp beyond initialization and high-level control."}
];

// Module 2 combined content
const module2Content = [
  {"type":"text","content":"In this module, you will implement full system timekeeping for the smartwatch. You will store and retrieve time using a real time clock, synchronize time over Wi-Fi when available, and display the current date and time on the screen at controlled intervals. By the end of this module, the watch should maintain accurate time across reboots and update its display efficiently."},
  {"type":"header","content":"Task 1: Implement Real Time Clock Storage and Retrieval"},
  {"type":"text","content":"Use the PCF8563 real time clock to store and retrieve the current date and time. You must design functions in mytime.h and mytime.c that allow the system to write time data to the RTC and read it back. These functions should then be used from main.cpp. Time should be stored in twenty four hour format, where hours and minutes range from 00:00 to 23:59. The date should include the month, day, and year. All firmware for this task must be written in C and use only the libraries provided in the repository. In particular, you should rely on driver/i2c.h and esp_err.h for low level communication and error handling."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Use the tm structure from the standard time library to represent date and time values","Consider writing low level byte read and write functions for the RTC, then wrapping them with higher level functions used outside of mytime.c","Use the provided bcdToDec and decToBcd helper functions when reading from or writing to RTC registers","Carefully study the PCF8563 datasheet to understand register layout, bit masking, and valid value ranges"]},
  {"type":"header","content":"Task 2: Synchronization Time Using Wi-Fi"},
  {"type":"text","content":"Attempt to connect to a Wi-Fi network during system boot and retrieve the current time if a connection is successfully established. Use the WiFi.h library to initialize the Wi-Fi subsystem and connect to a known network. Once connected, synchronize the system time using the Network Time Protocol."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Initialize Wi-Fi and attempt a connection during startup","After connecting, call syncTimeWithNTP() followed by getLocalTime(&time) to retrieve the current time","If Wi-Fi is unavailable, the system should continue operating using the RTC"]},
  {"type":"text","content":"Note: The ESP32 supports only 2.4 GHz Wi-Fi networks. If a 2.4 GHz network is not available, a personal hotspot can be used instead."},
  {"type":"header","content":"Task 3: Display Time and Date on the LCD"},
  {"type":"text","content":"Display the current time and date on the screen in a readable format. The time must be shown in HH:MM format using military time. The date must be shown in MM DD YYYY format. The display should not update continuously. Instead, design your system so the screen refreshes only once every forty seconds."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Use snprintf to format time and date strings before sending them to the display","Ensure display updates are non blocking and do not interfere with other system tasks","Integrate this logic cleanly with your existing display driver"]},
  {"type":"video_placeholder","content":"[VIDEO: Module 2 Demo - Add the video labeled Module 2 Demo here]"},
  {"type":"header","content":"Deliverables and File Structure"},
  {"type":"text","content":"All code for this module must be implemented using the following file structure:"},
  {"type":"bullets","content":["mytime.h and mytime.c handles RTC communication and time conversion logic","mywifi.h and mywifi.c handles Wi-Fi initialization and time synchronization","display.h and display.cpp handles rendering time and date on the screen","power.h and power.cpp maintains system power configuration","main.cpp coordinates initialization and high level system behavior"]},
  {"type":"text","content":"Timekeeping logic should not be implemented directly in main.cpp. All functionality should be abstracted into appropriate modules."}
];

// Module 3 combined content
const module3Content = [
  {"type":"text","content":"In this module, you will expand the smartwatch user interface by integrating touch input, accelerometer data, and Wi-Fi status visualization. By the end of this module, the watch should respond to touch events, display step count information, and provide clear feedback about network connectivity through dedicated screens."},
  {"type":"header","content":"Task 1: Read and Display Touch Coordinates"},
  {"type":"text","content":"Create a program that prints the x and y coordinates of the user's touch on the smartwatch display. You will implement a low level C driver to communicate with the FT6236U touch controller and extract touch coordinates over I2C. Your driver functions should be written in a dedicated source and header file, and the touch handling logic should be integrated into main.cpp. Touch events must be detected using a hardware interrupt so that coordinates are updated only when the screen is actively touched."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["The FT6236U uses an I2C address of 0x38, which is not explicitly listed in the datasheet","Use an interrupt driven approach to detect touch events","Keep interrupt handlers minimal and defer coordinate processing to normal application code","Ensure x and y coordinates are correctly parsed from the device registers"]},
  {"type":"video_placeholder","content":"[VIDEO: Module 3 Task 1 Demo - Add the video labeled Module 3 Task 1 Demo here]"},
  {"type":"header","content":"Task 2: Design the Accelerometer Screen"},
  {"type":"text","content":"Create a screen that displays the total step count stored in the BMA423 accelerometer. This screen must initialize the accelerometer, retrieve the stored step count, and display it in a readable format. All accelerometer related functionality should be implemented using the Accel class within accel.h and accel.cpp. The screen logic should then be driven from main.cpp."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Initialize the BMA423 before attempting to read step data","Use the provided accelerometer abstraction rather than accessing registers directly","Ensure the displayed step count reflects the value stored in the sensor"]},
  {"type":"video_placeholder","content":"[VIDEO: Module 3 Task 2 Demo - Add the video labeled Module 3 Task 2 Demo here]"},
  {"type":"header","content":"Task 3: Design the Wi-Fi Status Screen"},
  {"type":"text","content":"Create a screen that displays the current Wi-Fi connection status of the smartwatch. The screen must support three states: Wi-Fi Connected, Wi-Fi Connecting, Wi-Fi Not Connected. When Wi-Fi is connected, the network SSID should be displayed. When Wi-Fi is not connected, the screen should clearly indicate that no connection is present. When a connection attempt is in progress, the screen should reflect the connecting state. You must also implement a button that allows the user to manually attempt to reconnect to the Wi-Fi network. All Wi-Fi related functionality should be implemented in mywifi.h and mywifi.cpp using the MyWiFi class, with high level control handled in main.cpp."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Track Wi-Fi state internally and update the screen accordingly","Use the provided drawWiFiSymbol and drawRefreshSymbol helper functions to display icons","Ensure screen updates are responsive but not excessively frequent"]},
  {"type":"video_placeholder","content":"[VIDEO: Module 3 Task 3 Demo - Add the video labeled Module 3 Task 3 Demo here]"},
  {"type":"header","content":"Deliverables and File Structure"},
  {"type":"text","content":"All code for this module must follow the structure below:"},
  {"type":"bullets","content":["touch.h and touch.c handles FT6236U communication and coordinate extraction","accel.h and accel.cpp handles BMA423 initialization and step count retrieval","mywifi.h and mywifi.cpp handles Wi-Fi state management and reconnection logic","display.h and display.cpp handles rendering of all screens and symbols","main.cpp coordinates screen selection, input handling, and system behavior"]},
  {"type":"text","content":"Low level drivers should not be implemented directly inside main.cpp. All functionality should be abstracted into appropriate modules."}
];

// Module 4 combined content
const module4Content = [
  {"type":"text","content":"In this final module, you will integrate all previously developed components into a complete, responsive smartwatch application. You will design a stopwatch feature, implement full screen navigation, display live battery information, and structure the firmware using a real time operating system. By the end of this module, the smartwatch should behave like a cohesive product rather than a collection of individual features."},
  {"type":"header","content":"Task 1: Design a Stopwatch Screen"},
  {"type":"text","content":"Create a stopwatch screen that supports start, stop, and reset functionality. The stopwatch must display time in HH MM SS format and continue running even when the stopwatch screen is not actively displayed. This requires separating stopwatch timing logic from display rendering logic."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Use semaphores to safely coordinate access to the display whenever screen content changes","Ensure the stopwatch state persists independently of the active screen","Avoid resetting or pausing the stopwatch when navigating between screens"]},
  {"type":"header","content":"Task 2: Implement Screen Navigation Using Touch Buttons"},
  {"type":"text","content":"Design and implement touch buttons that allow the user to navigate between all previously created screens. You must support navigation between the home screen, step count screen, Wi-Fi screen, and stopwatch screen. Button interactions should be responsive and consistent across screens."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Centralize screen state management to avoid duplicated logic","Use touch events to trigger screen transitions rather than polling","Ensure only one screen is active at a time"]},
  {"type":"header","content":"Task 3: Display Live Battery Percentage on the Home Screen"},
  {"type":"text","content":"Use the power management system to display the current battery percentage on the home screen. You must read battery data using the AXP20X library and display the value using the provided drawBatterySymbol function. The battery percentage should update dynamically and reflect real system state."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Retrieve battery information through the AXP20X driver","Pass the battery percentage value into the display drawing function","Ensure battery updates do not interfere with other display operations"]},
  {"type":"header","content":"Task 4: Design an RTOS Based System Architecture"},
  {"type":"text","content":"Structure the firmware using a real time operating system to handle multiple subsystems concurrently. You should create tasks strategically to manage display updates, input handling, timekeeping, sensor polling, and networking. Tasks must be designed to operate reliably without blocking one another."},
  {"type":"subheader","content":"Implementation Guidance:"},
  {"type":"bullets","content":["Assign appropriate priorities to tasks based on timing sensitivity","Use semaphores or task notifications for safe communication between tasks","Keep interrupt service routines minimal and defer processing to tasks"]},
  {"type":"video_placeholder","content":"[VIDEO: Module 4 Demo - Add the video labeled Module 4 Demo here]"},
  {"type":"header","content":"Deliverables and File Structure"},
  {"type":"text","content":"All functionality in this module must integrate cleanly with the existing project structure:"},
  {"type":"bullets","content":["Display related logic in display.h and display.cpp","Power and battery logic in power.h and power.cpp","Wi-Fi logic in mywifi.h and mywifi.cpp","Sensor logic in existing accelerometer and touch files","Task coordination and system initialization in main.cpp"]},
  {"type":"text","content":"No new functionality should be implemented directly inside interrupts or without proper abstraction."}
];

// Output SQL statements
console.log("-- Module 1: Update lesson-1-task1 with combined content");
console.log(`UPDATE lessons SET title = 'Module 1', content_json = '${JSON.stringify(module1Content).replace(/'/g, "''")}' WHERE id = 'lesson-1-task1';`);
console.log("");

console.log("-- Module 2: Update lesson-2-task1 with combined content");
console.log(`UPDATE lessons SET title = 'Module 2', content_json = '${JSON.stringify(module2Content).replace(/'/g, "''")}' WHERE id = 'lesson-2-task1';`);
console.log("");

console.log("-- Module 3: Update lesson-3-task1 with combined content");
console.log(`UPDATE lessons SET title = 'Module 3', content_json = '${JSON.stringify(module3Content).replace(/'/g, "''")}' WHERE id = 'lesson-3-task1';`);
console.log("");

console.log("-- Module 4: Update lesson-4-task1 with combined content");
console.log(`UPDATE lessons SET title = 'Module 4', content_json = '${JSON.stringify(module4Content).replace(/'/g, "''")}' WHERE id = 'lesson-4-task1';`);
console.log("");

console.log("-- Hide other module lessons (set is_published = 0)");
console.log("UPDATE lessons SET is_published = 0 WHERE id IN ('lesson-1-task2', 'lesson-1-task3', 'lesson-1-demo', 'lesson-1-quiz', 'lesson-2-task2', 'lesson-2-task3', 'lesson-2-demo', 'lesson-2-quiz', 'lesson-3-demo1', 'lesson-3-task2', 'lesson-3-demo2', 'lesson-3-task3', 'lesson-3-demo3', 'lesson-3-quiz', 'lesson-4-task2', 'lesson-4-task3', 'lesson-4-task4', 'lesson-4-demo', 'lesson-4-quiz');");
