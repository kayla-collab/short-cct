#!/usr/bin/env python3
"""
Update Smartwatch Modules 1-4 lessons in the D1 database.
"""

import subprocess
import json
import sys

def escape_sql(s):
    if not s:
        return ''
    return s.replace("'", "''")

def run_sql(sql):
    cmd = ['npx', 'wrangler', 'd1', 'execute', 'shortcircuits-db', '--remote', '--command', sql]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, cwd='/home/user/webapp')
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception: {e}")
        return False

def update_lesson(lesson_id, description, content_json):
    escaped_desc = escape_sql(description)
    escaped_content = escape_sql(json.dumps(content_json))
    sql = f"UPDATE lessons SET description='{escaped_desc}', content_json='{escaped_content}' WHERE id='{lesson_id}'"
    print(f"Updating {lesson_id}...", end=' ')
    if run_sql(sql):
        print("OK")
        return True
    else:
        print("FAILED")
        return False

lessons = []

# ============================================
# MODULE 1: SYSTEM BOOT
# ============================================

# lesson-1-task1: Task 1: Initialize System Power
lessons.append({
    "id": "lesson-1-task1",
    "description": "Configure the power management system so the watch can boot and supply power to required peripherals.",
    "content_json": [
        {"type":"text","content":"In this module, you will bring the smartwatch to life by initializing system power, displaying output on the screen, and handling a hardware interrupt. By the end of this module, the watch should successfully boot, display text, and respond to a button press."},
        {"type":"subheading","content":"Task 1: Initialize System Power Using the AXP202"},
        {"type":"text","content":"Configure the power management system so the watch can boot and supply power to required peripherals."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Use the AXP20X.h library to control the AXP202 power management IC","Establish I2C communication with the AXP202","Identify required power rails using the schematic","Enable the appropriate LDOs to power the system and display","Review example code provided by the AXP20X library"]}
    ]
})

# lesson-1-task2: Task 2: Display Text Using TFT_eSPI
lessons.append({
    "id": "lesson-1-task2",
    "description": "Verify that the display is functioning by printing text after system boot.",
    "content_json": [
        {"type":"subheading","content":"Task 2: Display Text Using TFT_eSPI"},
        {"type":"text","content":"Verify that the display is functioning by printing text after system boot."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Use the TFT_eSPI library to interface with the display","Initialize the display before writing any graphics","Print the text 'Hello World' after boot","Experiment with text color, background color, and position"]}
    ]
})

# lesson-1-task3: Task 3: Power Button Interrupt
lessons.append({
    "id": "lesson-1-task3",
    "description": "Use a hardware interrupt to toggle the display on and off using the side button.",
    "content_json": [
        {"type":"subheading","content":"Task 3: Implement a Hardware Interrupt for the Power Button"},
        {"type":"text","content":"Use a hardware interrupt to toggle the display on and off using the side button."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["The side button is connected to the interrupt pin of the AXP202","Identify the correct interrupt pin using the schematic","Refer to the Interrupts and ISRs section for proper ISR structure","Keep the ISR minimal and defer logic to the main program or task","Use a shared flag or notification to toggle display state"]}
    ]
})

# lesson-1-demo: Module 1 Demo Submission
lessons.append({
    "id": "lesson-1-demo",
    "description": "Submit your Module 1 demonstration video showing system boot and power button functionality.",
    "content_json": [
        {"type":"subheading","content":"Module 1 Demo Video"},
        {"type":"text","content":"Record and submit a video demonstrating the Module 1 functionality: system boot, display output, and power button interrupt handling."},
        {"type":"subheading","content":"Deliverables and File Structure"},
        {"type":"text","content":"All code for this module must be implemented using the following structure:"},
        {"type":"bullets","content":["power.h and power.cpp handles AXP202 power initialization and control","display.h and display.cpp handles display initialization and graphics output","main.cpp coordinates system startup and high-level behavior"]},
        {"type":"text","content":"No functionality should be implemented directly inside main.cpp beyond initialization and high-level control."}
    ]
})

# lesson-1-quiz: Module 1 Quiz
lessons.append({
    "id": "lesson-1-quiz",
    "description": "Test your understanding of Module 1 concepts.",
    "content_json": [
        {"type":"text","content":"Complete the quiz to test your understanding of system power initialization, display output, and hardware interrupts."}
    ]
})

# ============================================
# MODULE 2: TIMEKEEPING
# ============================================

# lesson-2-task1: Task 1: RTC Storage and Retrieval
lessons.append({
    "id": "lesson-2-task1",
    "description": "Use the PCF8563 real time clock to store and retrieve the current date and time.",
    "content_json": [
        {"type":"text","content":"In this module, you will implement full system timekeeping for the smartwatch. You will store and retrieve time using a real time clock, synchronize time over Wi-Fi when available, and display the current date and time on the screen at controlled intervals. By the end of this module, the watch should maintain accurate time across reboots and update its display efficiently."},
        {"type":"subheading","content":"Task 1: Implement Real Time Clock Storage and Retrieval"},
        {"type":"text","content":"Use the PCF8563 real time clock to store and retrieve the current date and time."},
        {"type":"text","content":"You must design functions in mytime.h and mytime.c that allow the system to write time data to the RTC and read it back. These functions should then be used from main.cpp. Time should be stored in twenty four hour format, where hours and minutes range from 00:00 to 23:59. The date should include the month, day, and year."},
        {"type":"text","content":"All firmware for this task must be written in C and use only the libraries provided in the repository. In particular, you should rely on driver/i2c.h and esp_err.h for low level communication and error handling."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Use the tm structure from the standard time library to represent date and time values","Consider writing low level byte read and write functions for the RTC, then wrapping them with higher level functions used outside of mytime.c","Use the provided bcdToDec and decToBcd helper functions when reading from or writing to RTC registers","Carefully study the PCF8563 datasheet to understand register layout, bit masking, and valid value ranges"]}
    ]
})

# lesson-2-task2: Task 2: Wi-Fi Time Synchronization
lessons.append({
    "id": "lesson-2-task2",
    "description": "Attempt to connect to a Wi-Fi network during system boot and retrieve the current time if a connection is successfully established.",
    "content_json": [
        {"type":"subheading","content":"Task 2: Synchronization Time Using Wi-Fi"},
        {"type":"text","content":"Attempt to connect to a Wi Fi network during system boot and retrieve the current time if a connection is successfully established."},
        {"type":"text","content":"Use the WiFi.h library to initialize the Wi Fi subsystem and connect to a known network. Once connected, synchronize the system time using the Network Time Protocol."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Initialize Wi Fi and attempt a connection during startup","After connecting, call syncTimeWithNTP() followed by getLocalTime(&time) to retrieve the current time","If Wi Fi is unavailable, the system should continue operating using the RTC"]},
        {"type":"callout","content":"Note: The ESP32 supports only 2.4 GHz Wi Fi networks. If a 2.4 GHz network is not available, a personal hotspot can be used instead."}
    ]
})

# lesson-2-task3: Task 3: Time Display Formatting
lessons.append({
    "id": "lesson-2-task3",
    "description": "Display the current time and date on the screen in a readable format.",
    "content_json": [
        {"type":"subheading","content":"Task 3: Display Time and Date on the LCD"},
        {"type":"text","content":"Display the current time and date on the screen in a readable format."},
        {"type":"text","content":"The time must be shown in HH:MM format using military time. The date must be shown in MM DD YYYY format. The display should not update continuously. Instead, design your system so the screen refreshes only once every forty seconds."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Use snprintf to format time and date strings before sending them to the display","Ensure display updates are non blocking and do not interfere with other system tasks","Integrate this logic cleanly with your existing display driver"]}
    ]
})

# lesson-2-demo: Module 2 Demo Submission
lessons.append({
    "id": "lesson-2-demo",
    "description": "Submit your Module 2 demonstration video showing timekeeping functionality.",
    "content_json": [
        {"type":"subheading","content":"Module 2 Demo Video"},
        {"type":"text","content":"Record and submit a video demonstrating the Module 2 functionality: RTC storage and retrieval, Wi-Fi time synchronization, and formatted time display."},
        {"type":"subheading","content":"Deliverables and File Structure"},
        {"type":"text","content":"All code for this module must be implemented using the following file structure:"},
        {"type":"bullets","content":["mytime.h and mytime.c handles RTC communication and time conversion logic","mywifi.h and mywifi.c handles Wi Fi initialization and time synchronization","display.h and display.cpp handles rendering time and date on the screen","power.h and power.cpp maintains system power configuration","main.cpp coordinates initialization and high level system behavior"]},
        {"type":"text","content":"Timekeeping logic should not be implemented directly in main.cpp. All functionality should be abstracted into appropriate modules."}
    ]
})

# lesson-2-quiz: Module 2 Quiz
lessons.append({
    "id": "lesson-2-quiz",
    "description": "Test your understanding of Module 2 concepts.",
    "content_json": [
        {"type":"text","content":"Complete the quiz to test your understanding of real time clock usage, Wi-Fi time synchronization, and display formatting."}
    ]
})

# ============================================
# MODULE 3: INPUTS & SENSORS
# ============================================

# lesson-3-task1: Task 1: Touch Coordinate Extraction
lessons.append({
    "id": "lesson-3-task1",
    "description": "Create a program that prints the x and y coordinates of the user's touch on the smartwatch display.",
    "content_json": [
        {"type":"text","content":"In this module, you will expand the smartwatch user interface by integrating touch input, accelerometer data, and Wi-Fi status visualization. By the end of this module, the watch should respond to touch events, display step count information, and provide clear feedback about network connectivity through dedicated screens."},
        {"type":"subheading","content":"Task 1: Read and Display Touch Coordinates"},
        {"type":"text","content":"Create a program that prints the x and y coordinates of the user's touch on the smartwatch display."},
        {"type":"text","content":"You will implement a low level C driver to communicate with the FT6236U touch controller and extract touch coordinates over I2C. Your driver functions should be written in a dedicated source and header file, and the touch handling logic should be integrated into main.cpp."},
        {"type":"text","content":"Touch events must be detected using a hardware interrupt so that coordinates are updated only when the screen is actively touched."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["The FT6236U uses an I2C address of 0x38, which is not explicitly listed in the datasheet","Use an interrupt driven approach to detect touch events","Keep interrupt handlers minimal and defer coordinate processing to normal application code","Ensure x and y coordinates are correctly parsed from the device registers"]}
    ]
})

# lesson-3-demo1: Task 1 Demo: Touch Coordinates
lessons.append({
    "id": "lesson-3-demo1",
    "description": "Submit your Task 1 demonstration video showing touch coordinate extraction.",
    "content_json": [
        {"type":"subheading","content":"Task 1 Demo Video"},
        {"type":"text","content":"Record and submit a video demonstrating the touch coordinate extraction functionality."}
    ]
})

# lesson-3-task2: Task 2: Step Count Screen
lessons.append({
    "id": "lesson-3-task2",
    "description": "Create a screen that displays the total step count stored in the BMA423 accelerometer.",
    "content_json": [
        {"type":"subheading","content":"Task 2: Design the Accelerometer Screen"},
        {"type":"text","content":"Create a screen that displays the total step count stored in the BMA423 accelerometer."},
        {"type":"text","content":"This screen must initialize the accelerometer, retrieve the stored step count, and display it in a readable format. All accelerometer related functionality should be implemented using the Accel class within accel.h and accel.cpp. The screen logic should then be driven from main.cpp."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Initialize the BMA423 before attempting to read step data","Use the provided accelerometer abstraction rather than accessing registers directly","Ensure the displayed step count reflects the value stored in the sensor"]}
    ]
})

# lesson-3-demo2: Task 2 Demo: Step Count Screen
lessons.append({
    "id": "lesson-3-demo2",
    "description": "Submit your Task 2 demonstration video showing the step count screen.",
    "content_json": [
        {"type":"subheading","content":"Task 2 Demo Video"},
        {"type":"text","content":"Record and submit a video demonstrating the accelerometer step count screen functionality."}
    ]
})

# lesson-3-task3: Task 3: Wi-Fi Status Screen
lessons.append({
    "id": "lesson-3-task3",
    "description": "Create a screen that displays the current Wi-Fi connection status of the smartwatch.",
    "content_json": [
        {"type":"subheading","content":"Task 3: Design the Wi-Fi Status Screen"},
        {"type":"text","content":"Create a screen that displays the current Wi-Fi connection status of the smartwatch."},
        {"type":"text","content":"The screen must support three states:"},
        {"type":"bullets","content":["Wi-Fi Connected","Wi-Fi Connecting","Wi-Fi Not Connected"]},
        {"type":"text","content":"When Wi-Fi is connected, the network SSID should be displayed. When Wi-Fi is not connected, the screen should clearly indicate that no connection is present. When a connection attempt is in progress, the screen should reflect the connecting state."},
        {"type":"text","content":"You must also implement a button that allows the user to manually attempt to reconnect to the Wi-Fi network."},
        {"type":"text","content":"All Wi-Fi related functionality should be implemented in mywifi.h and mywifi.cpp using the MyWiFi class, with high level control handled in main.cpp."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Track Wi-Fi state internally and update the screen accordingly","Use the provided drawWiFiSymbol and drawRefreshSymbol helper functions to display icons","Ensure screen updates are responsive but not excessively frequent"]}
    ]
})

# lesson-3-demo3: Task 3 Demo: Wi-Fi Status Screen
lessons.append({
    "id": "lesson-3-demo3",
    "description": "Submit your Task 3 demonstration video showing the Wi-Fi status screen.",
    "content_json": [
        {"type":"subheading","content":"Task 3 Demo Video"},
        {"type":"text","content":"Record and submit a video demonstrating the Wi-Fi status screen functionality."},
        {"type":"subheading","content":"Deliverables and File Structure"},
        {"type":"text","content":"All code for this module must follow the structure below:"},
        {"type":"bullets","content":["touch.h and touch.c handles FT6236U communication and coordinate extraction","accel.h and accel.cpp handles BMA423 initialization and step count retrieval","mywifi.h and mywifi.cpp handles Wi-Fi state management and reconnection logic","display.h and display.cpp handles rendering of all screens and symbols","main.cpp coordinates screen selection, input handling, and system behavior"]},
        {"type":"text","content":"Low level drivers should not be implemented directly inside main.cpp. All functionality should be abstracted into appropriate modules."}
    ]
})

# lesson-3-quiz: Module 3 Quiz
lessons.append({
    "id": "lesson-3-quiz",
    "description": "Test your understanding of Module 3 concepts.",
    "content_json": [
        {"type":"text","content":"Complete the quiz to test your understanding of touch input, accelerometer integration, and Wi-Fi status management."}
    ]
})

# ============================================
# MODULE 4: FINAL INTEGRATION
# ============================================

# lesson-4-task1: Task 1: Stopwatch Screen
lessons.append({
    "id": "lesson-4-task1",
    "description": "Create a stopwatch screen that supports start, stop, and reset functionality.",
    "content_json": [
        {"type":"text","content":"In this final module, you will integrate all previously developed components into a complete, responsive smartwatch application. You will design a stopwatch feature, implement full screen navigation, display live battery information, and structure the firmware using a real time operating system. By the end of this module, the smartwatch should behave like a cohesive product rather than a collection of individual features."},
        {"type":"subheading","content":"Task 1: Design a Stopwatch Screen"},
        {"type":"text","content":"Create a stopwatch screen that supports start, stop, and reset functionality."},
        {"type":"text","content":"The stopwatch must display time in HH MM SS format and continue running even when the stopwatch screen is not actively displayed. This requires separating stopwatch timing logic from display rendering logic."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Use semaphores to safely coordinate access to the display whenever screen content changes","Ensure the stopwatch state persists independently of the active screen","Avoid resetting or pausing the stopwatch when navigating between screens"]}
    ]
})

# lesson-4-task2: Task 2: Screen Navigation
lessons.append({
    "id": "lesson-4-task2",
    "description": "Design and implement touch buttons that allow the user to navigate between all previously created screens.",
    "content_json": [
        {"type":"subheading","content":"Task 2: Implement Screen Navigation Using Touch Buttons"},
        {"type":"text","content":"Design and implement touch buttons that allow the user to navigate between all previously created screens."},
        {"type":"text","content":"You must support navigation between the home screen, step count screen, Wi Fi screen, and stopwatch screen. Button interactions should be responsive and consistent across screens."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Centralize screen state management to avoid duplicated logic","Use touch events to trigger screen transitions rather than polling","Ensure only one screen is active at a time"]}
    ]
})

# lesson-4-task3: Task 3: Battery Display
lessons.append({
    "id": "lesson-4-task3",
    "description": "Use the power management system to display the current battery percentage on the home screen.",
    "content_json": [
        {"type":"subheading","content":"Task 3: Display Live Battery Percentage on the Home Screen"},
        {"type":"text","content":"Use the power management system to display the current battery percentage on the home screen."},
        {"type":"text","content":"You must read battery data using the AXP20X library and display the value using the provided drawBatterySymbol function. The battery percentage should update dynamically and reflect real system state."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Retrieve battery information through the AXP20X driver","Pass the battery percentage value into the display drawing function","Ensure battery updates do not interfere with other display operations"]}
    ]
})

# lesson-4-task4: Task 4: RTOS Architecture
lessons.append({
    "id": "lesson-4-task4",
    "description": "Structure the firmware using a real time operating system to handle multiple subsystems concurrently.",
    "content_json": [
        {"type":"subheading","content":"Task 4: Design an RTOS Based System Architecture"},
        {"type":"text","content":"Structure the firmware using a real time operating system to handle multiple subsystems concurrently."},
        {"type":"text","content":"You should create tasks strategically to manage display updates, input handling, timekeeping, sensor polling, and networking. Tasks must be designed to operate reliably without blocking one another."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Assign appropriate priorities to tasks based on timing sensitivity","Use semaphores or task notifications for safe communication between tasks","Keep interrupt service routines minimal and defer processing to tasks"]}
    ]
})

# lesson-4-demo: Module 4 Final Demo
lessons.append({
    "id": "lesson-4-demo",
    "description": "Submit your Module 4 final demonstration video showing the complete smartwatch application.",
    "content_json": [
        {"type":"subheading","content":"Module 4 Final Demo Video"},
        {"type":"text","content":"Record and submit a video demonstrating the complete Module 4 functionality: stopwatch, screen navigation, battery display, and RTOS-based architecture."},
        {"type":"subheading","content":"Deliverables and File Structure"},
        {"type":"text","content":"All functionality in this module must integrate cleanly with the existing project structure:"},
        {"type":"bullets","content":["Display related logic in display.h and display.cpp","Power and battery logic in power.h and power.cpp","Wi Fi logic in mywifi.h and mywifi.cpp","Sensor logic in existing accelerometer and touch files","Task coordination and system initialization in main.cpp"]},
        {"type":"text","content":"No new functionality should be implemented directly inside interrupts or without proper abstraction."}
    ]
})

# lesson-4-quiz: Module 4 Final Quiz
lessons.append({
    "id": "lesson-4-quiz",
    "description": "Test your understanding of Module 4 concepts.",
    "content_json": [
        {"type":"text","content":"Complete the quiz to test your understanding of stopwatch implementation, screen navigation, battery display, and RTOS architecture."}
    ]
})

if __name__ == '__main__':
    print(f"Updating {len(lessons)} Smartwatch Module 1-4 lessons...")
    success = 0
    for lesson in lessons:
        if update_lesson(lesson['id'], lesson['description'], lesson['content_json']):
            success += 1
    print(f"\nCompleted: {success}/{len(lessons)} lessons updated successfully.")
