#!/usr/bin/env python3
"""
Update lessons with FULL VERBATIM content from the smartwatch documentation.
Each lesson gets ALL paragraphs from its section in the document.
"""

import subprocess
import json
import re

def escape_sql(s):
    if not s:
        return ''
    return s.replace("'", "''").replace("\\", "\\\\")

def run_sql(sql):
    cmd = ['npx', 'wrangler', 'd1', 'execute', 'shortcircuits-db', '--remote', '--command', sql]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, cwd='/home/user/webapp')
        if result.returncode != 0:
            print(f"Error: {result.stderr[:200]}")
            return False
        return True
    except Exception as e:
        print(f"Exception: {e}")
        return False

def update_lesson(lesson_id, content_json):
    escaped_content = escape_sql(json.dumps(content_json, ensure_ascii=False))
    sql = f"UPDATE lessons SET content_json='{escaped_content}' WHERE id='{lesson_id}'"
    print(f"Updating {lesson_id} ({len(content_json)} sections)...", end=' ', flush=True)
    if run_sql(sql):
        print("OK")
        return True
    else:
        print("FAILED")
        return False

# Read the full document
with open('/tmp/smartwatch_full.txt', 'r') as f:
    doc = f.read()

lessons = {}

# ============================================
# TRAINING MATERIAL - COMPLETE PROJECT OVERVIEW
# ============================================
lessons['lesson-t-overview'] = [
    {"type": "youtube", "content": "https://www.youtube.com/watch?v=52L8VP05elU"},
    {"type": "text", "content": "This video provides a comprehensive overview of the entire Smartwatch project. Watch it to understand the scope of what you will build, the components you will work with, and the skills you will develop throughout the program."}
]

# ============================================
# TRAINING MATERIAL - MODULAR ARCHITECTURE
# (Includes File Structure content as they are related)
# ============================================
lessons['lesson-t-modular'] = [
    {"type": "heading", "content": "Modular Architecture"},
    {"type": "text", "content": "In professional embedded systems, firmware is rarely written as a single file. Instead, it is structured to be modular, maintainable, and scalable so that systems can grow, be debugged efficiently, and be worked on by multiple engineers."},
    {"type": "text", "content": "We organize code into clear layers and clean file boundaries. This makes each component independent and easier to debug, extend, or replace. In PlatformIO it is recommended that you use the /include and /src for your header (.h) and source (.c/.cpp) files respectively."},
]

# ============================================
# TRAINING MATERIAL - FILE STRUCTURE
# ============================================
lessons['lesson-t-files'] = [
    {"type": "heading", "content": "File Structure"},
    {"type": "text", "content": "In C and C++ projects, header files define the interface, while source files implement the functionality. This separation allows different parts of the program to interact through well-defined boundaries."},
    {"type": "text", "content": "Header files contain declarations, not executable code. Their purpose is to describe what a module provides, not how it works. Other files include a header file to understand how to use the functions, data types, or classes defined by that module."},
    {"type": "text", "content": "A typical header file includes function prototypes for functions implemented elsewhere, constant definitions, and data type declarations such as struct, enum, or typedef. In C++ projects, header files may also contain class declarations that define the public interface of a class without exposing its internal implementation details."},
    {"type": "subheading", "content": "Header File (accel.h)"},
    {"type": "text", "content": "C source files contain the actual implementations of the functions and logic declared in their corresponding header files. This is where executable code lives and where the behavior of a module is defined."},
    {"type": "text", "content": "These files typically include function definitions, internal helper functions, and low-level hardware or driver logic. Helper functions are often marked as static to limit their visibility to the file itself, helping enforce clean module boundaries and prevent unintended use elsewhere in the codebase."},
    {"type": "subheading", "content": "C Source File (accel.c)"},
    {"type": "text", "content": "C++ source files serve the same purpose as .c files but are used when the project relies on C++ features such as classes, objects, and encapsulation. They contain implementations of class methods and support object-oriented design patterns that improve code organization and reuse. In embedded systems, .cpp files are commonly used when interacting with C++ based libraries such as Arduino or FreeRTOS, or when structuring more complex application logic."},
    {"type": "text", "content": "While the underlying principles remain the same, C++ enables more expressive abstractions on top of low-level embedded functionality."},
    {"type": "subheading", "content": "C++ Source File (accel.cpp)"},
]

# ============================================
# TRAINING MATERIAL - PROJECT LAYERS
# ============================================
lessons['lesson-t-layers'] = [
    {"type": "heading", "content": "Project Layers"},
    {"type": "text", "content": "Well-structured embedded firmware is typically organized into logical layers, where each layer has a clearly defined responsibility. This layered approach improves modularity, simplifies debugging, and allows systems to scale without becoming difficult to maintain. A clean project may include up to five conceptual layers. Not every project will implement all five explicitly, but understanding the role of each layer is fundamental to writing professional embedded firmware."},
    {"type": "subheading", "content": "Layer 1: Hardware"},
    {"type": "text", "content": "This layer consists of the physical electronics themselves, including microcontrollers, sensors, displays, and power components. No software exists at this level. All higher layers ultimately interact with the hardware, either directly or indirectly."},
    {"type": "subheading", "content": "Layer 2: Hardware Abstraction Layer (HAL)"},
    {"type": "text", "content": "The Hardware Abstraction Layer is the lowest level of software that interacts directly with the hardware. Its purpose is to provide readable and reusable APIs that abstract away hardware registers and low-level details. By isolating register access and device-specific behavior within the HAL, the rest of the system can interact with hardware in a safer and more portable way."},
    {"type": "subheading", "content": "Layer 3: Operating System / Middleware / Service Layer"},
    {"type": "text", "content": "This layer sits above the hardware drivers and provides reusable software services. It combines low-level drivers into higher-level capabilities such as task scheduling, timing services, communication stacks, or sensor management. In systems that use an RTOS, this layer often includes OS services and middleware components that support concurrency and inter-task communication."},
    {"type": "subheading", "content": "Layer 4: Application Logic Layer"},
    {"type": "text", "content": "The application logic layer defines the behavior of the device. It manages system states, decision-making, and interactions between components. This layer acts as the \"brain\" of the system, implementing the product's functionality without being tied to specific hardware details."},
    {"type": "subheading", "content": "Layer 5: Application Interface Layer"},
    {"type": "text", "content": "The application interface layer is the topmost layer and is responsible for presenting information to the user or exposing APIs to other systems. This may include user interfaces, display logic, input handling, or external communication interfaces."},
]

# ============================================
# TRAINING MATERIAL - POINTERS AND REFERENCES
# ============================================
lessons['lesson-t-pointers'] = [
    {"type": "heading", "content": "Pointers and References"},
    {"type": "text", "content": "Pointers and references are foundational concepts in embedded firmware development. They enable efficient data handling, direct hardware interaction, and flexible system design: especially in resource-constrained environments."},
    {"type": "text", "content": "A pointer is a variable that stores the memory address of another variable. A reference (C++ only) is an alias for an existing variable. References provide a safer and more readable syntax by eliminating the need for explicit dereferencing in most cases."},
    {"type": "text", "content": "In embedded systems, pointers and references are commonly used to pass large data structures without copying, allow functions to modify variables directly, interface with hardware registers and memory-mapped I/O, and manage buffers, arrays, and shared state between tasks."},
    {"type": "subheading", "content": "Pointer Basics"},
    {"type": "text", "content": "A pointer is declared by specifying the type of data it points to, followed by an asterisk."},
    {"type": "code", "content": "int *ptr;", "language": "cpp"},
    {"type": "text", "content": "This declares ptr as a pointer capable of holding the address of an integer."},
    {"type": "text", "content": "To assign a pointer, use the address-of operator (&) to store the address of an existing variable:"},
    {"type": "code", "content": "ptr = &x;", "language": "cpp"},
    {"type": "text", "content": "To access or modify the value at the address stored in the pointer, use the dereference operator (*):"},
    {"type": "code", "content": "*ptr = 10;", "language": "cpp"},
    {"type": "text", "content": "This modifies the value of the variable that ptr points to, not the pointer itself."},
    {"type": "subheading", "content": "Passing by Pointer vs Value"},
    {"type": "text", "content": "When a variable is passed by value to a function, the function receives a copy of that variable. Any modifications made inside the function affect only the copy and are not reflected outside the function. When a variable is passed by pointer, the function receives the address of the original variable. Modifying the value through the pointer directly affects the original data. This behavior is essential in embedded systems, where functions often need to update sensor readings, system state, or configuration values."},
    {"type": "subheading", "content": "Pointers and Arrays"},
    {"type": "text", "content": "In C and C++, arrays automatically decay into pointers when passed to functions. This means the function receives a pointer to the first element of the array rather than a copy of the entire array. This behavior is especially useful when working with buffers, such as reading and writing I2C data, handling communication packets, or processing sensor data streams. Changes made to the array within the function are reflected in the original array."},
    {"type": "subheading", "content": "Pointers to Structures"},
    {"type": "text", "content": "Embedded drivers commonly pass structures by pointer so that functions can populate or modify multiple related values at once. This syntax simplifies access to structure fields when working with pointers and is widely used in embedded driver code."},
    {"type": "subheading", "content": "References (C++ Only)"},
    {"type": "text", "content": "References provide a cleaner alternative to pointers in C++. A reference acts as an alias for an existing variable, allowing functions to access and modify data without using explicit pointer syntax. Because references cannot be null and cannot be reseated after initialization, they are often safer and easier to reason about than raw pointers in application-level C++ code."},
    {"type": "subheading", "content": "Const Pointers and Pointer-to-Const"},
    {"type": "text", "content": "The const keyword can be applied to pointers in different ways, each with a specific meaning."},
    {"type": "bullets", "content": [
        "A constant pointer (int *const p) means the pointer cannot point to a different address, but the value it points to can change.",
        "A pointer to constant data (const int *p) means the pointer can change, but the value it points to cannot be modified.",
        "A constant pointer to constant data (const int *const p) means neither the pointer nor the value can change."
    ]},
    {"type": "text", "content": "Correct use of const improves code safety and makes intent explicit."},
    {"type": "subheading", "content": "Pointers in Interrupts and Tasks"},
    {"type": "text", "content": "When variables are shared between an interrupt service routine (ISR) and other code, they must be declared as volatile to prevent the compiler from making incorrect optimization assumptions. Tasks or main-loop code often access shared flags or state through pointers or references. Care must be taken to ensure data consistency and avoid race conditions when working across execution contexts."},
    {"type": "text", "content": "When you pass a variable by value in a function, you are passing a copy of the variable to a function. Therefore if you modify the variable within the function, the variable outside of the function won't be changed. On the other hand, if you pass the variable by pointer, then if you modify the variable within the function, that will be reflected outside of the function as well."},
    {"type": "subheading", "content": "Common Issues"},
    {"type": "text", "content": "Pointer-related bugs are a frequent source of crashes and unpredictable behavior in embedded systems. Common issues include using uninitialized pointers, forgetting to dereference a pointer, dereferencing a null pointer, returning or storing pointers to stack variables, and confusing the address-of (&) and dereference (*) operators. Understanding these failure modes is essential for writing safe and reliable firmware."},
    {"type": "text", "content": "Pointers can be a challenging topic when first encountered. The following video by Nicolai Nielsen provides a clear and practical overview and is recommended if you would like additional reinforcement:"},
    {"type": "youtube", "content": "https://www.youtube.com/watch?v=syy-3fVicUc"},
]

# ============================================
# TRAINING MATERIAL - BIT MANIPULATION
# ============================================
lessons['lesson-t-bits'] = [
    {"type": "heading", "content": "Bit Manipulation"},
    {"type": "text", "content": "Embedded hardware frequently represents information using individual bits, bit fields, and packed binary values. Configuration registers, status flags, and sensor data are often encoded in ways that require firmware to extract or modify only specific portions of a byte or word."},
    {"type": "text", "content": "For example, the PCF8563 real-time clock stores the hour value in a six-bit field rather than a full byte, while many I2C sensors reserve a single bit (often bit 7) to signal conditions such as new data availability or error states. Because of this, embedded developers must be comfortable reading individual bits, clearing or setting specific flags, updating bit fields, and combining multiple binary fields into meaningful values."},
    {"type": "text", "content": "Bitwise operators can be applied to values written in binary, hexadecimal, or decimal form. When referring to bit positions within a byte, bits are indexed from right to left, starting at bit 0. For an 8-bit value, this corresponds to positions 7 6 5 4 3 2 1 0."},
    {"type": "text", "content": "The following video from Portfolio Courses offers a great introduction into binary numbers, and bitwise operators. We highly recommend watching this if you are unfamiliar with binary numbers:"},
    {"type": "youtube", "content": "https://www.youtube.com/watch?v=WBim3afbYQw"},
    {"type": "subheading", "content": "Common Bitwise Operators"},
    {"type": "text", "content": "Bitwise operators operate directly on the binary representation of values and are fundamental tools in embedded C and C++ programming. The AND (&) operator is commonly used to select or clear specific bits by masking out unwanted portions of a value. The OR (|) operator is used to set specific bits without affecting others, while the XOR (^) operator toggles bits based on their current state."},
    {"type": "text", "content": "Shift operators are also widely used. A left shift (<<) moves bits to the left and is often equivalent to multiplying by a power of two, while a right shift (>>) moves bits to the right and is often equivalent to dividing by a power of two. The bitwise NOT (~) operator inverts all bits in a value, turning ones into zeros and zeros into ones."},
    {"type": "text", "content": "These operators are essential when working with hardware registers, configuration fields, and communication protocols."},
    {"type": "subheading", "content": "Bitwise Operator Table"},
    {"type": "bullets", "content": [
        "& (AND): Clear or select specific bits. Example: 0b10110111 & 0b01111111 = 0b00110111",
        "| (OR): Set specific bits. Example: 0b10101110 | 0b01010001 = 0b11111111",
        "^ (XOR): Flip a bit. Example: 0b00000101 ^ 0b00000001 = 0b00000100",
        "<< (Left shift): Move bits left or multiply by powers of 2. Example: 1 << 3 = 0b00001000",
        ">> (Right shift): Move bits right or divide by powers of 2. Example: 0b10000000 >> 4 = 0b00001000",
        "~ (NOT): Invert all bits. Example: ~0x0F = 0xF0"
    ]},
    {"type": "subheading", "content": "Bit Masking"},
    {"type": "text", "content": "A bit mask is a predefined binary pattern used to isolate or manipulate specific bits within a larger value. Masks are commonly applied using the AND operator to clear unwanted bits or using the OR operator to set desired bits."},
    {"type": "text", "content": "For example, the hexadecimal value 0x7F corresponds to the binary pattern 0111 1111. Applying this mask clears bit 7 while preserving the lower seven bits. This technique is frequently used when a register contains both data and status flags within the same byte."},
    {"type": "text", "content": "In the case of the PCF8563 RTC, the seconds register stores valid time data in bits 0 through 6, while bit 7 indicates clock integrity. When reading this register, firmware must apply a mask to remove the flag bit before converting the remaining value. The resulting masked value can then be converted from binary-coded decimal (BCD) to a standard decimal format before being stored in the system's time structure."},
    {"type": "subheading", "content": "PCF8563 Seconds Extraction Example"},
    {"type": "subheading", "content": "Other Bit Operations"},
    {"type": "text", "content": "In addition to masking, firmware often needs to modify individual bits without disturbing the rest of a register. Setting a bit is typically done using a bitwise OR operation, which forces a specific bit to one while leaving all others unchanged. Clearing a bit is accomplished by ANDing the value with the inverse of a bit mask, forcing the selected bit to zero. Toggling a bit uses the XOR operator to flip the bit's current state."},
    {"type": "text", "content": "More complex operations involve updating a bit field, where multiple adjacent bits represent a single value. In these cases, the existing bits are first cleared using a mask, and the new value is then shifted into position and ORed into the cleared space. This pattern is commonly used when writing configuration values to control registers."},
    {"type": "text", "content": "Finally, embedded systems often need to combine or split bytes and nibbles. Upper and lower nibbles can be extracted using masks and shifts, or combined by shifting one value into position and ORing it with another. These techniques are especially common when parsing multi-byte sensor data or constructing command packets for communication protocols."},
    {"type": "subheading", "content": "Setting Bits Example (Sets Bit 3 in Reg to 1)"},
    {"type": "subheading", "content": "Clearing Bits Example (Forces Bit 2 in Reg to be 0)"},
    {"type": "subheading", "content": "Toggling Bits Example (Flips Bit 1 in Reg to 0 or 1)"},
    {"type": "subheading", "content": "Writing a Bit Field (Clear the Only Bit You Want to Update then OR the New Value into the Cleared Space)"},
    {"type": "subheading", "content": "Combining Two Nibbles (Upper/Lower Bytes)"},
]

# ============================================
# TRAINING MATERIAL - I2C COMMUNICATION
# ============================================
lessons['lesson-t-i2c'] = [
    {"type": "heading", "content": "I2C Communication"},
    {"type": "text", "content": "I2C (Inter-Integrated Circuit) is a widely used two-wire serial communication protocol for connecting microcontrollers to peripheral devices such as sensors, displays, real-time clocks, and power-management ICs. It is especially popular in embedded systems because it allows multiple devices to share the same communication bus with minimal wiring."},
    {"type": "text", "content": "The bus consists of two signals: SCL, the serial clock line driven by the master to synchronize communication, and SDA, a bidirectional data line used to transmit and receive information. A single master device, such as the ESP32, controls communication with one or more slave devices, each of which is identified by a unique 7-bit address (for example, 0x51 or 0x19). All devices on the bus share the same SDA and SCL lines."},
    {"type": "text", "content": "Electrically, I2C uses an open-drain configuration. Devices are only allowed to pull the lines low and never drive them high. For this reason, external pull-up resistors are required to bring the lines high when they are idle. These pull-ups are typically around 4.7 kohm. On the T-Watch platform, the required pull-up resistors are already present on the board."},
    {"type": "text", "content": "Every I2C transaction follows a defined sequence: a START condition, transmission of the slave address with a read/write bit, an acknowledgment (ACK) from the receiver, one or more data bytes with acknowledgments after each byte, and finally a STOP condition. Understanding this sequence is essential for debugging and low-level driver development."},
    {"type": "subheading", "content": "Reading the Datasheet and Schematics"},
    {"type": "text", "content": "Before writing any I2C driver code, it is critical to study both the schematic and the device datasheet. The schematic tells you how the hardware is wired, while the datasheet defines how the device communicates."},
    {"type": "text", "content": "From the schematic, you must identify which pins are connected to SDA and SCL, as well as which I2C bus instance is being used (for example, I2C_NUM_0 or I2C_NUM_1). From the datasheet, you must determine the device's 7-bit I2C address, understand the register map that defines how data is stored, and verify the maximum supported clock speed. The I2C master must operate at a frequency that is equal to or lower than what the peripheral supports. Failing to extract this information correctly is one of the most common causes of I2C communication errors."},
    {"type": "subheading", "content": "Driver Architecture"},
    {"type": "text", "content": "Well-structured I2C drivers are typically written in layers. The lowest layer is the bus layer, which handles raw I2C transactions such as initializing the bus, sending bytes, and reading bytes. This layer is responsible for interacting directly with the hardware driver provided by the platform."},
    {"type": "text", "content": "Above the bus layer sits the driver logic, which interprets device-specific register layouts and data formats. At the top is the API layer, which exposes simple, readable functions that the rest of the application can use without needing to understand low-level I2C details. The number of layers in between depends on the complexity of the peripheral and the overall system, but separating concerns in this way improves maintainability and reuse."},
    {"type": "subheading", "content": "Error Handling"},
    {"type": "text", "content": "When writing low-level I2C drivers, it is essential to continuously verify that each communication step completes successfully. On the ESP32 platform, I2C functions typically return an esp_err_t value. Every call should store this return value and check whether it equals ESP_OK. Any other value indicates that an error occurred during communication and should be handled or reported appropriately. Robust error handling at the driver level makes higher-level debugging significantly easier."},
    {"type": "subheading", "content": "Example"},
    {"type": "text", "content": "Consider an environmental sensor that measures temperature in Celsius and exposes its data through I2C registers. The sensor uses SDA on pin 13, SCL on pin 14, operates on I2C_NUM_0, supports a clock frequency of 100 kHz, and has a 7-bit I2C address of 0x24. The device stores five consecutive temperature samples in registers 0x08 through 0x12, with each register using the same data format."},
    {"type": "text", "content": "Each temperature register encodes its value using a binary-coded decimal (BCD) format. The most significant bit (bit 7) is used as a sign bit, where a value of 0 indicates a positive temperature and a value of 1 indicates a negative temperature. Bits 6 through 4 store the tens digit of the temperature value, while bits 3 through 0 store the units digit. The sign bit does not contribute to the magnitude and must be handled separately in firmware."},
    {"type": "text", "content": "To make the driver easier to read and maintain, key configuration values should be defined at the top of the header file using #define statements. This avoids hard-coding values throughout the codebase and simplifies future changes."},
    {"type": "text", "content": "At the C source level, the driver begins by initializing the I2C bus using the desired configuration parameters. The initialization function typically returns an error code indicating whether the bus was configured successfully. The configuration structure used during initialization defines parameters such as pin assignments, clock speed, and I2C mode."},
    {"type": "text", "content": "Once the bus is initialized, the driver can implement low-level read and write functions that operate on individual bytes or registers. These functions form the foundation of the driver and are responsible for all direct communication with the peripheral."},
    {"type": "text", "content": "On top of these low-level functions, higher-level driver functions can be written to read temperature registers, apply bit masks to extract the sign and BCD digits, convert the BCD values to decimal, and return usable temperature values to the application layer."},
    {"type": "text", "content": "For this project, direct use of the Arduino Wire library is not required for all peripherals. Devices such as the AXP202 power-management IC and the BMA423 accelerometer provide helper objects that internally manage I2C communication."},
    {"type": "text", "content": "When the Wire library is required, it must be initialized explicitly with the correct pin assignments:"},
    {"type": "code", "content": "Wire.begin(I2C_MASTER_SDA, I2C_MASTER_SCL);", "language": "cpp"},
    {"type": "text", "content": "Additional information about the Wire library can be found in the official Arduino documentation."},
    {"type": "subheading", "content": "Common Debugging Tips"},
    {"type": "text", "content": "When I2C communication does not behave as expected, the first step is to verify the slave address. Many devices have multiple possible addresses depending on pin configuration or revision, so always confirm that the address used in firmware matches the value specified in the datasheet (for example, 0x19, 0x68, or 0x51)."},
    {"type": "text", "content": "Next, check the electrical integrity of the bus. Both SDA and SCL must have proper pull-up resistors, as I2C lines are open-drain and can only be driven low by devices. When the bus is idle, both lines should remain high. In this project, the required pull-up resistors are already present on the board, but this assumption should always be verified against the schematic."},
    {"type": "text", "content": "A simple and effective debugging technique is to write a minimal test routine that probes for device acknowledgments on the bus. Scanning for known I2C addresses or attempting a single register read can quickly confirm whether a peripheral is physically present and responding."},
    {"type": "text", "content": "In systems that use multiple tasks or threads, I2C access must be serialized. Protect all I2C transactions with a mutex or other synchronization mechanism to prevent overlapping transactions, which can corrupt communication and lead to unpredictable behavior."},
    {"type": "text", "content": "Finally, remember that many I2C issues stem from incorrect assumptions about wiring, timing, or register layouts rather than from the protocol itself. Methodical verification of each layer, hardware, configuration, and driver logic, will resolve the majority of communication problems."},
    {"type": "text", "content": "This video from Rohde & Schwarz offers a great overview of the I2C protocol. We highly recommend watching it if you are interested in learning the low level details of the protocol."},
    {"type": "youtube", "content": "https://www.youtube.com/watch?v=CAvawEcxoPU"},
]

# ============================================
# TRAINING MATERIAL - OBJECT-ORIENTED BASICS
# ============================================
lessons['lesson-t-oop'] = [
    {"type": "heading", "content": "Object-Oriented Basics"},
    {"type": "text", "content": "In embedded firmware projects, object oriented programming helps manage complexity as systems grow. When used appropriately, it allows code to be organized into clear, modular components such as display drivers, power management logic, or sensor interfaces, while keeping related data and functionality closely grouped."},
    {"type": "text", "content": "By encapsulating hardware control logic within classes, object oriented programming reduces reliance on global variables, improves code readability, and minimizes unintended side effects. This approach makes firmware easier to debug, reuse, and scale as new features or peripherals are added."},
    {"type": "subheading", "content": "Classes"},
    {"type": "text", "content": "A class is a blueprint that defines both the data an object will hold and the functions that operate on that data. In embedded systems, a class often represents a single hardware component or logical subsystem."},
    {"type": "text", "content": "A class definition typically resides in a header file, where its interface is declared, while the implementation of its functions is placed in a corresponding cpp file. Defining classes in this way separates what a module does from how it does it, which is a key principle of clean firmware design."},
    {"type": "text", "content": "It is important to note that a class itself does not consume memory. Memory is only allocated when an object of that class is created."},
    {"type": "subheading", "content": "Objects"},
    {"type": "text", "content": "An object is an instance of a class that exists in memory. Each object represents a concrete realization of the class and maintains its own internal state."},
    {"type": "text", "content": "For example, if a motor control class is instantiated twice, each object will have its own configuration and state, even though both objects share the same underlying class definition."},
    {"type": "subheading", "content": "Member Variables"},
    {"type": "text", "content": "Member variables store the internal state of an object. In embedded firmware, these variables often represent configuration parameters, cached sensor values, or hardware state."},
    {"type": "text", "content": "Each object receives its own copy of all member variables, allowing multiple instances of the same class to operate independently without interfering with one another."},
    {"type": "subheading", "content": "Member Functions"},
    {"type": "text", "content": "Member functions define the behavior of an object and operate directly on its member variables."},
    {"type": "text", "content": "Internally, every member function receives an implicit pointer called this, which refers to the current object instance. This allows the function to access and modify the object's internal state without explicitly passing pointers or references."},
    {"type": "subheading", "content": "Public and Private Access"},
    {"type": "text", "content": "Access specifiers control how other parts of the program interact with a class. Members declared as public are accessible from outside the class and define the official interface that other code can use. Members declared as private are only accessible within the class itself and are used to protect internal implementation details."},
    {"type": "text", "content": "For example, calling a public function such as temp.getValue() is valid because it respects the class interface. Directly accessing a private variable like temp.rawValue is not allowed and results in a compile time error. This enforcement prevents accidental misuse of internal state and improves code safety."},
    {"type": "subheading", "content": "Full Example"},
    {"type": "text", "content": "In a typical embedded project, the class interface is declared in a header file such as motor.h, while the implementation is provided in motor.cpp. The implementation file often begins with a constructor, which is responsible for initializing member variables, configuring pins, or setting up communication interfaces."},
    {"type": "text", "content": "The application entry point, such as main.cpp, acts as the driver for the system. In this file, objects are instantiated and their public member functions are called to control behavior. This structure keeps application logic clean and readable while abstracting hardware details into well defined modules."},
    {"type": "subheading", "content": "motor.h"},
    {"type": "subheading", "content": "motor.cpp"},
    {"type": "subheading", "content": "main.cpp"},
]

# ============================================
# TRAINING MATERIAL - REAL TIME OPERATING SYSTEM
# ============================================
lessons['lesson-t-rtos'] = [
    {"type": "heading", "content": "Real Time Operating System"},
    {"type": "text", "content": "A Real Time Operating System enables multiple pieces of code, known as tasks, to execute seemingly at the same time on a single processor. This is achieved through rapid context switching, where the operating system scheduler determines which task runs at any given moment based on priority and timing requirements."},
    {"type": "text", "content": "RTOS based designs are widely used in embedded systems that require predictable timing, concurrent behavior, and safe sharing of hardware resources."},
    {"type": "subheading", "content": "Tasks"},
    {"type": "text", "content": "A task represents an independent thread of execution managed by the RTOS scheduler. Each task has its own stack and execution context and runs concurrently with other tasks in the system."},
    {"type": "subheading", "content": "FreeRTOS Task Implementation Example"},
    {"type": "text", "content": "Tasks are typically structured as infinite loops that repeatedly perform a specific function. Because tasks are managed by the scheduler, they must never return. Instead of using blocking delays, tasks should call vTaskDelay() to pause execution and allow other tasks to run. This enables cooperative multitasking and prevents unnecessary CPU blocking."},
    {"type": "text", "content": "When creating tasks, care must be taken to allocate sufficient stack space to support local variables and function calls. Creating too many tasks increases memory usage and introduces scheduling overhead, which can negatively impact system performance."},
    {"type": "subheading", "content": "FreeRTOS Task Creation Example"},
    {"type": "text", "content": "The RTOS scheduler selects which task runs next based on priority. Lower priority values indicate less critical tasks, while higher priority values are reserved for time critical operations."},
    {"type": "text", "content": "The highest priority level is typically used only for emergency handling or tasks triggered by interrupts."},
    {"type": "subheading", "content": "Semaphores"},
    {"type": "text", "content": "Semaphores are synchronization mechanisms used to coordinate execution between tasks or between interrupts and tasks. They are essential for ensuring safe access to shared resources and for signaling when events occur."},
    {"type": "text", "content": "A binary semaphore acts as a simple lock or event flag. It is commonly used to signal a task when new data is available or when an interrupt has occurred. This mechanism allows interrupt service routines to remain short while deferring processing to a task."},
    {"type": "subheading", "content": "Binary Semaphore Implementation Example"},
    {"type": "text", "content": "A mutex is a specialized form of semaphore designed to protect shared resources such as displays, serial ports, or communication buses. By ensuring that only one task accesses a resource at a time, mutexes prevent data corruption and ensure system stability."},
    {"type": "subheading", "content": "Inter-Task Communication"},
    {"type": "subheading", "content": "Mutex"},
    {"type": "text", "content": "FreeRTOS provides several mechanisms for exchanging information between tasks. Queues allow structured data or buffers to be sent from one task to another. Semaphores provide synchronization and signaling between tasks or between interrupts and tasks. Task notifications offer a lightweight one to one signaling mechanism with minimal overhead. Event groups allow multiple flags to represent system wide states that can be shared across tasks. Choosing the appropriate communication mechanism depends on the type of data being exchanged and the timing requirements of the system."},
    {"type": "subheading", "content": "Tips with RTOS"},
    {"type": "text", "content": "FreeRTOS enables multitasking, deterministic timing, and safe resource sharing when used correctly. Interrupt service routines should always be kept short, with semaphores or task notifications used to signal tasks that further processing is required."},
    {"type": "text", "content": "Task priorities should be chosen carefully to prevent starvation of lower priority tasks. Blocking calls such as delay() should be avoided in favor of vTaskDelay() to allow proper scheduling. Any resource shared between multiple tasks must be protected using a mutex to maintain data integrity."},
    {"type": "text", "content": "This video from DigiKey further explains Real Time Operating Systems. We highly recommend watching this video to get a deeper understanding of how it works and when it should be used:"},
    {"type": "youtube", "content": "https://www.youtube.com/watch?v=F321087yYy4&list=PLEBQazB0HUyQ4hAPU1cJED6t3DU0h34bz&index=1"},
]

# ============================================
# TRAINING MATERIAL - STATIC AND VOLATILE KEYWORDS
# ============================================
lessons['lesson-t-static-volatile'] = [
    {"type": "heading", "content": "Static and Volatile Keywords"},
    {"type": "text", "content": "Embedded systems frequently operate under constraints such as limited memory, concurrent execution, and interaction with hardware through interrupts. In these environments, the static and volatile keywords play a critical role in ensuring that variables behave correctly and predictably. These keywords guide the compiler in how variables are stored, accessed, and optimized, which is essential for reliable embedded firmware."},
    {"type": "subheading", "content": "The Static Keyword"},
    {"type": "text", "content": "The static keyword controls the lifetime and visibility of variables and functions. Its behavior depends on where it is applied, but in all cases it alters how memory is allocated and how symbols are exposed to the rest of the program."},
    {"type": "text", "content": "When used on a local variable inside a function, static causes the variable to retain its value between function calls. Unlike a normal local variable, which is created on the stack and destroyed when the function returns, a static local variable is allocated once and persists for the lifetime of the program. This is useful for maintaining state across function invocations without relying on global variables."},
    {"type": "text", "content": "When applied to a global variable, static limits the variable's visibility to the source file in which it is declared. This prevents the variable from being accessed by other files and avoids unintended symbol collisions. File scoped static variables are commonly used in drivers to keep internal state private to the implementation."},
    {"type": "text", "content": "The static keyword can also be applied to functions. A static function is only visible within the source file where it is defined. This is often used to hide helper functions that are not part of a module's public interface, reinforcing encapsulation and improving code organization."},
    {"type": "subheading", "content": "The Volatile Keyword"},
    {"type": "text", "content": "The volatile keyword tells the compiler that a variable's value may change at any time, even if the current code does not explicitly modify it. This is especially important in embedded systems where variables can be modified by interrupt service routines, hardware peripherals, or concurrent tasks."},
    {"type": "text", "content": "Without volatile, the compiler may optimize code by caching a variable's value in a register and reusing it, assuming that the value does not change unexpectedly. If a variable is modified by an interrupt, this optimization can cause the main program to miss updates, leading to incorrect or stuck behavior."},
    {"type": "text", "content": "Declaring a variable as volatile forces the compiler to always read its value from memory, ensuring that changes made outside the current execution context are observed correctly."},
    {"type": "subheading", "content": "Using Static and Volatile Together"},
    {"type": "text", "content": "In embedded systems, it is common to combine static and volatile on the same variable. In this case, static restricts the variable's visibility to a single source file, while volatile ensures that the compiler does not optimize away accesses to it."},
    {"type": "text", "content": "This combination is often used for variables that are shared between an interrupt service routine and the main program or a task. The result is a variable that is private to a driver, safe to access in real time, and correctly synchronized with hardware events."},
]

# ============================================
# TRAINING MATERIAL - TIMING AND SCHEDULING
# ============================================
lessons['lesson-t-timing'] = [
    {"type": "heading", "content": "Timing and Scheduling"},
    {"type": "text", "content": "Accurate timing is a fundamental aspect of embedded system design. In a smartwatch, nearly every subsystem depends on precise and predictable timing, including screen refreshes, accelerometer interrupts, power management, step counting, button and touch input, I2C communication, battery polling, and wireless synchronization. Poor timing decisions can lead to missed events, sluggish user interfaces, excessive power consumption, or complete system instability."},
    {"type": "subheading", "content": "Blocking Delays"},
    {"type": "text", "content": "A blocking delay halts program execution entirely for a specified period of time. During a blocking delay, the processor is unable to perform other work, which prevents background tasks, user interface updates, and time sensitive logic from running. This approach also wastes power because the CPU remains active while waiting."},
    {"type": "text", "content": "Blocking delays are occasionally useful during early hardware bring up, simple test routines, or linear demonstration code. However, they are inappropriate for production firmware in multitasking systems."},
    {"type": "text", "content": "In smartwatch firmware, using blocking delays can freeze animations, disrupt step counting, interfere with wireless communication, and degrade overall system responsiveness. For this reason, blocking delays should be avoided outside of isolated testing scenarios."},
    {"type": "subheading", "content": "Non-Blocking Delays"},
    {"type": "text", "content": "Non blocking timing techniques allow code to execute at specific intervals without stopping the processor. Instead of pausing execution, the firmware checks elapsed time and performs actions only when the required interval has passed."},
    {"type": "text", "content": "This approach enables synchronization with physical processes such as button presses, sensor updates, and display refresh cycles while allowing other parts of the system to continue running. Using non blocking delays improves responsiveness and reduces unnecessary power usage compared to blocking delays."},
    {"type": "text", "content": "During early stages of development, non blocking delays are often sufficient for tasks such as periodic display updates or simple polling loops. They provide a basic form of cooperative multitasking without requiring an operating system."},
    {"type": "subheading", "content": "FreeRTOS Timing"},
    {"type": "text", "content": "When firmware is structured around a real time operating system, timing control should be handled within tasks using RTOS aware delay mechanisms. In FreeRTOS, this is accomplished using functions such as vTaskDelay()."},
    {"type": "text", "content": "Unlike blocking delays or manual time checks, vTaskDelay() puts the calling task into a suspended state for a specified number of ticks. While the task is sleeping, the scheduler runs other tasks, allowing the system to remain responsive and power efficient. Timing accuracy is tied to the RTOS tick rate, which is typically one millisecond on the ESP32."},
    {"type": "text", "content": "Once the RTOS is integrated, vTaskDelay() should be used for periodic tasks such as display updates, sensor polling, touch detection, and battery monitoring."},
    {"type": "subheading", "content": "Hardware Timer Basics"},
    {"type": "text", "content": "The ESP32 includes multiple hardware timers that operate independently of the CPU. These timers are driven by an internal clock source, support high resolution counting, and can generate interrupts with microsecond level precision."},
    {"type": "text", "content": "Hardware timers are required for applications that demand extremely precise timing, such as high rate data sampling, pulse width modulation, motor control, or ultra low latency event handling. Because they bypass the RTOS scheduler, they are not affected by task switching delays."},
    {"type": "text", "content": "While students are not required to implement raw hardware timers in this project, understanding their role helps clarify how precise timing is achieved at the hardware level."},
    {"type": "subheading", "content": "Peripheral Timing"},
    {"type": "text", "content": "Many peripheral devices impose strict timing requirements that firmware must respect. Communication protocols such as I2C define timing constraints for start and stop conditions, clock stretching, and spacing between read and write operations. Violating these constraints can lead to bus lockups, missed input events, or unresponsive devices."},
    {"type": "text", "content": "Timekeeping peripherals such as real time clocks operate independently from the main processor. The PCF8563, for example, updates its internal counters at a fixed one hertz rate. Firmware should poll the RTC at a reasonable interval to update the user interface without wasting power by reading too frequently."},
    {"type": "subheading", "content": "Debouncing"},
    {"type": "text", "content": "Physical buttons and capacitive touch inputs are inherently noisy and can produce multiple transitions for a single user action. Debouncing is the process of filtering these transitions over time to detect a single, intentional input."},
    {"type": "text", "content": "Effective debouncing relies on accurate timing. Whether implemented in software or hardware, debounce logic uses time thresholds to distinguish between noise and valid input. Without proper debouncing, user input can appear inconsistent or unreliable."},
]

# ============================================
# TRAINING MATERIAL - INTERRUPTS AND ISRs
# ============================================
lessons['lesson-t-interrupts'] = [
    {"type": "heading", "content": "Interrupts and ISRs"},
    {"type": "text", "content": "An interrupt is a hardware or software signal that temporarily pauses normal program execution so the processor can respond immediately to an important event. Interrupts are used when low latency response is required, such as detecting button presses, handling sensor events, or reacting to power management conditions."},
    {"type": "text", "content": "When an interrupt occurs, the processor pauses its current execution, saves its internal state including registers and the program counter, and jumps to a predefined interrupt service routine. The interrupt service routine executes quickly and then returns control back to the original program flow. This mechanism enables near immediate reaction to events with minimal CPU overhead."},
    {"type": "subheading", "content": "IRAM_ATTR"},
    {"type": "text", "content": "On the ESP32, most application code runs from external flash memory. Under certain conditions, such as flash write operations or cache misses, this memory may be temporarily unavailable. If an interrupt occurs during these periods and the interrupt handler resides in flash, the system can crash or behave unpredictably."},
    {"type": "text", "content": "The IRAM_ATTR attribute places critical interrupt service routines into internal RAM instead of flash. This ensures that the interrupt handler always executes immediately and reliably, regardless of flash availability. For this reason, all hardware interrupt service routines on the ESP32 should be marked with IRAM_ATTR."},
    {"type": "subheading", "content": "Interrupt Trigger Types"},
    {"type": "text", "content": "When configuring an interrupt, the firmware must specify what type of signal transition should trigger the interrupt. Common trigger types include detecting a transition from low to high, from high to low, or any change in signal state. Level based triggers can also be used, but they require careful handling because the interrupt condition remains active as long as the signal level persists."},
    {"type": "text", "content": "On the T Watch platform, both the touch controller and the accelerometer use falling edge interrupts. Physical buttons typically use falling edge triggers as well, often in combination with internal pull up resistors."},
    {"type": "subheading", "content": "Simple ISR C++"},
    {"type": "text", "content": "Creating a basic interrupt begins by configuring the input pin and attaching an interrupt handler function. In modules such as the AXP202 power management IC, additional steps are required to clear the interrupt status bits over I2C. Functions such as axp.clearISR() perform this register level housekeeping internally and must be called for correct operation."},
    {"type": "text", "content": "Interrupt service routines should be extremely short and should not contain complex logic, blocking calls, or long running operations. Their role is to acknowledge the interrupt and signal that an event has occurred."},
    {"type": "text", "content": "Once the interrupt service routine updates a shared variable or flag, the main program or a task can respond accordingly. In this structure, the interrupt triggers the event, while normal application code performs the heavier processing."},
    {"type": "subheading", "content": "Interrupts in OOP"},
    {"type": "text", "content": "In C plus plus based firmware, interrupt related logic should be implemented within source files rather than directly in the main application file. This allows interrupt handling to be abstracted into classes and drivers, keeping the main program clean and readable."},
    {"type": "text", "content": "When interrupts interact with class based code, function declarations and implementations may differ from simple procedural examples. These differences are a natural result of object oriented design and are covered in the Object Oriented Basics section of this program."},
    {"type": "subheading", "content": "Key Takeaways"},
    {"type": "text", "content": "Interrupts provide an efficient and low latency mechanism for responding to real time hardware events. Interrupt service routines must always be short and non blocking to preserve system stability. On the ESP32, all hardware interrupt handlers should be placed in internal RAM using IRAM_ATTR."},
    {"type": "text", "content": "Communication between interrupts and the rest of the system should be handled using volatile flags, semaphores, or task notifications. Any heavy processing should be deferred to normal tasks rather than performed inside the interrupt itself."},
]

# ============================================
# TRAINING MATERIAL - FINITE STATE MACHINE
# ============================================
lessons['lesson-t-fsm'] = [
    {"type": "heading", "content": "Finite State Machine"},
    {"type": "text", "content": "A finite state machine, or FSM, is a structured model used to organize system behavior into a finite number of well defined states, along with clear rules that govern transitions between those states. FSMs are widely used in embedded systems because they make behavior predictable, modular, and easy to reason about."},
    {"type": "text", "content": "At any given time, the system exists in a single state that represents its current mode of operation. Transitions between states occur in response to events or conditions, such as a button press, a timer expiring, or new sensor data becoming available. Each state may execute specific actions when it is entered, while it is active, or when it is exited. This structure allows complex behavior to be expressed in a clear and maintainable way."},
    {"type": "subheading", "content": "Example"},
    {"type": "text", "content": "A common use of a finite state machine in smartwatch firmware is controlling the user interface. For example, the system may start in a home screen state. Each time the user presses a button or performs a gesture, the FSM transitions to the next screen state. The display update logic depends entirely on which state is currently active."},
    {"type": "text", "content": "By separating screen behavior into distinct states, the firmware avoids large conditional blocks and makes it easy to add new screens or modify existing ones. Each screen state is responsible only for its own logic and display updates, while transitions define how the user moves between screens."},
    {"type": "subheading", "content": "Implementation Guidance"},
    {"type": "text", "content": "When implementing a finite state machine in embedded firmware, states should be represented using enumerated types to improve readability and reduce errors. The logic associated with each state should be kept isolated, either within dedicated functions or clearly defined sections of code. This makes the behavior of each state easier to understand and debug."},
    {"type": "text", "content": "State transitions can be implemented using switch statements or function pointers, depending on the complexity of the system. In firmware that uses a real time operating system, states may also be represented using task modes or shared flags, allowing the FSM to integrate cleanly with multitasking behavior."},
    {"type": "text", "content": "Finite state machines are especially effective for managing screens, button interactions, operating modes, and other event driven behavior in embedded systems. By enforcing clear structure and explicit transitions, FSMs help produce firmware that is reliable, predictable, and easy to extend."},
]

# ============================================
# TRAINING MATERIAL - NETWORKING
# ============================================
lessons['lesson-t-networking'] = [
    {"type": "heading", "content": "Networking"},
    {"type": "text", "content": "Networking enables a micro controller to communicate with other devices over a shared medium. The ESP32 includes an integrated Wi Fi radio and a full TCP IP networking stack, allowing it to function much like a small computer on a local network. This capability enables features such as time synchronization, cloud communication, remote updates, and data logging."},
    {"type": "text", "content": "The ESP32 can operate in two primary Wi Fi modes. In station mode, the device connects to an existing network such as a home router, mobile hotspot, or access point. In access point mode, the ESP32 creates its own wireless network that other devices can connect to directly. For most smartwatch applications, station mode is used so the device can connect to a known network and access internet based services."},
    {"type": "subheading", "content": "Wi-Fi Connection Example"},
    {"type": "text", "content": "Establishing a Wi Fi connection involves initializing the networking subsystem, providing network credentials, and waiting for a successful connection event. Once connected, the ESP32 is assigned an IP address by the network, which allows it to communicate with other devices and services using standard internet protocols."},
    {"type": "text", "content": "In a smartwatch context, Wi Fi connectivity should be handled carefully to balance functionality and power consumption. Connections are typically established only when needed, such as during initial setup, time synchronization, or data transfer, and disabled afterward to conserve battery life."},
    {"type": "subheading", "content": "Wi-Fi Time Synchronization Example"},
    {"type": "text", "content": "One common use of Wi Fi in smartwatch firmware is synchronizing the real time clock with an external time source. This is typically done using the Network Time Protocol, which allows the device to retrieve the current time from an internet time server."},
    {"type": "text", "content": "After a successful Wi Fi connection is established, the firmware can request the current time using NTP and update the real time clock accordingly. This ensures that the watch maintains accurate time even after power cycles or extended periods without user interaction. Using a consistent sequence of initialization, connection, and synchronization steps improves reliability and simplifies debugging."},
]

if __name__ == '__main__':
    print(f"Updating {len(lessons)} lessons with FULL verbatim content...")
    print("="*60)
    success = 0
    for lesson_id, content in lessons.items():
        if update_lesson(lesson_id, content):
            success += 1
    print("="*60)
    print(f"\nCompleted: {success}/{len(lessons)} lessons updated successfully.")
