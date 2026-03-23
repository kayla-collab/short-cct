-- Migration: Complete PDF content with all links and full formatting
-- Source: Smartwatch Project Full Documentation (1).pdf and Ball and Beam Documentation for Kayla (1).pdf

-- =====================================================
-- SMARTWATCH COURSE - COMPLETE OVERVIEW
-- =====================================================

UPDATE lessons SET content_json = json('{
  "video_url": "https://www.youtube.com/watch?v=52L8VP05elU",
  "sections": [
    {
      "title": "Introduction",
      "content": "In this program you will design and implement a fully functioning smartwatch by combining low level driver development, embedded systems programming, and system-level integration.\n\nYou will work on the **LilyGo T-Watch 2020 V3**, a real commercial smartwatch platform, and write production-style firmware entirely in C and C++: the same languages used in industry for resource-constrained embedded systems.\n\n- **C** is used for low-level hardware control and communication\n- **C++** enables modular design, abstraction, and higher-level application logic\n\nThroughout the program you will build your system incrementally using provided training materials, reference implementations, and targeted code examples. These resources are designed to support you without removing the need for engineering decision making.\n\nIf you need help, email **support@shortcct.com** with your specific questions and a zip file including your project directory. Remember, virtual support is available for **3 months** after your product delivery date."
    },
    {
      "title": "Recommended Background",
      "content": "This project is designed for students who want hands-on embedded firmware experience. You do not need a lot of experience, but some foundational knowledge is expected.\n\n**Required:**\n- Introductory programming experience in C or C++\n- Comfort with basic programming concepts such as functions, control flow, arrays, and structs\n\n**Helpful:**\n- Introductory exposure to embedded systems\n- Introductory electronics knowledge\n\nIf you find that you are missing some of this background, reach out to us at **support@shortcct.com** and we can explore options to get you up to speed!"
    },
    {
      "title": "Industry Alignment",
      "content": "We analyzed the most in-demand skills across **50+ companies** hiring embedded systems engineering interns. Below is how the Smartwatch Project aligns with those skills.\n\n- **Core skills** are fully covered in the base project.\n- **Extendable skills** can be developed through optional project extensions and the design challenge.\n- **Not Covered** indicates skills that are outside the scope of the core project."
    },
    {
      "title": "Documentation",
      "content": "Here is the relevant documentation that you will need to use throughout the development of your project:\n\n**Datasheets:**\n- [AXP202 Datasheet](https://linux-sunxi.org/images/2/20/AXP202_Datasheet_v1.0_en.pdf) - Power Management IC\n- [PCF8563 Datasheet](https://www.nxp.com/docs/en/data-sheet/PCF8563.pdf) - Real-Time Clock\n- [ST7789V Datasheet](https://www.displayfuture.com/Display/datasheet/controller/ST7789V.pdf) - Display Controller\n- [FT6236U Datasheet](https://www.buydisplay.com/download/ic/FT6236-FT6336-FT6436L-FT6436_Datasheet.pdf) - Touch Controller\n- [BMA423 Datasheet](https://www.mouser.com/datasheet/2/783/BSCH_S_A0010021471_1-2525113.pdf) - Accelerometer\n\n**Libraries:**\n- [TFT_eSPI Library](https://doc-tft-espi.readthedocs.io/) - Display Library\n- [AXP202X_Library](https://github.com/lewisxhe/AXP202X_Library) - Power Management Library\n- [BMA423_Library](https://github.com/lewisxhe/BMA423_Library/tree/master) - Accelerometer Library\n\n**Other:**\n- [T-Watch Pinout](https://github.com/Xinyuan-LilyGO/TTGO_TWatch_Library/blob/master/docs/watch_2020_v3.md)\n- [T-Watch Schematic](https://github.com/Xinyuan-LilyGO/TTGO_TWatch_Library/blob/master/Schematic/T_WATCH-2020V03.pdf)"
    },
    {
      "title": "Set Up Smartwatch",
      "content": "To set up PlatformIO, this video by **DroneBot Workshop** is a great resource. It includes installation steps for Linux, MacOS, and Windows. You can download the latest versions of Python and Visual Studio Code.\n\nOnce you have downloaded PlatformIO on your system, watch the following video to set up your environment for our project.\n\nThe following video shows you how to clone our GitHub repository, `short-circuit-projects/smartwatch`, to VSCode. This tutorial is done on Windows, so it will look different on Linux or MacOS.\n\n**Setup Steps:**\n1. Install Visual Studio Code from [code.visualstudio.com](https://code.visualstudio.com/)\n2. Install the PlatformIO IDE extension in VS Code (Extensions > search \"PlatformIO IDE\")\n3. Clone the starter repository: `git clone https://github.com/short-circuit-projects/smartwatch.git`\n4. Open the cloned folder in VS Code; PlatformIO will automatically detect the project and install required dependencies"
    }
  ],
  "key_points": [
    "Work on the LilyGo T-Watch 2020 V3 platform",
    "Write production-style firmware in C and C++",
    "Build system incrementally with provided training materials",
    "Support available at support@shortcct.com for 3 months"
  ],
  "resources": [
    {"title": "Complete Project Overview Video", "url": "https://www.youtube.com/watch?v=52L8VP05elU", "type": "video"},
    {"title": "GitHub Repository", "url": "https://github.com/short-circuit-projects/smartwatch", "type": "github"},
    {"title": "Smartwatch Setup Tutorial", "url": "https://www.youtube.com/watch?v=CAvawEcxoPU", "type": "video"}
  ]
}')
WHERE id = 'lesson-t-overview';


-- =====================================================
-- SMARTWATCH: Pointers and References (with video)
-- =====================================================

UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Introduction to Pointers and References",
      "content": "Pointers and references are foundational concepts in embedded firmware development. They enable efficient data handling, direct hardware interaction, and flexible system design: especially in resource-constrained environments.\n\nA **pointer** is a variable that stores the memory address of another variable. A **reference** (C++ only) is an alias for an existing variable. References provide a safer and more readable syntax by eliminating the need for explicit dereferencing in most cases.\n\nIn embedded systems, pointers and references are commonly used to:\n- Pass large data structures without copying\n- Allow functions to modify variables directly\n- Interface with hardware registers and memory-mapped I/O\n- Manage buffers, arrays, and shared state between tasks"
    },
    {
      "title": "Pointer Basics",
      "content": "A pointer is declared by specifying the type of data it points to, followed by an asterisk.\n\n```c\nint *ptr;  // Declares ptr as a pointer to an integer\n```\n\nTo assign a pointer, use the **address-of operator** (`&`) to store the address of an existing variable:\n\n```c\nptr = &x;  // ptr now holds the address of x\n```\n\nTo access or modify the value at the address stored in the pointer, use the **dereference operator** (`*`):\n\n```c\n*ptr = 10;  // Modifies the value of x through the pointer\n```\n\nThis modifies the value of the variable that `ptr` points to, not the pointer itself."
    },
    {
      "title": "Passing by Value vs Pointer",
      "content": "When a variable is **passed by value** to a function, the function receives a copy of that variable. Any modifications made inside the function affect only the copy and are not reflected outside the function.\n\nWhen a variable is **passed by pointer**, the function receives the address of the original variable. Modifying the value through the pointer directly affects the original data.\n\n```c\n// Pass by value - original unchanged\nvoid incrementByValue(int x) {\n    x = x + 1;  // Only modifies local copy\n}\n\n// Pass by pointer - original is modified\nvoid incrementByPointer(int *x) {\n    *x = *x + 1;  // Modifies original variable\n}\n```\n\nThis behavior is essential in embedded systems, where functions often need to update sensor readings, system state, or configuration values."
    },
    {
      "title": "Pointers and Arrays",
      "content": "In C and C++, arrays automatically **decay into pointers** when passed to functions. This means the function receives a pointer to the first element of the array rather than a copy of the entire array.\n\n```c\nvoid processBuffer(uint8_t *buffer, size_t length) {\n    for (size_t i = 0; i < length; i++) {\n        buffer[i] = buffer[i] * 2;  // Modifies original array\n    }\n}\n```\n\nThis behavior is especially useful when working with buffers, such as reading and writing I2C data, handling communication packets, or processing sensor data streams. Changes made to the array within the function are reflected in the original array."
    },
    {
      "title": "Pointers to Structures",
      "content": "Embedded drivers commonly pass structures by pointer so that functions can populate or modify multiple related values at once.\n\n```c\ntypedef struct {\n    int hours;\n    int minutes;\n    int seconds;\n} TimeData;\n\nvoid getTime(TimeData *time) {\n    time->hours = 12;\n    time->minutes = 30;\n    time->seconds = 45;\n}\n```\n\nThe **arrow operator** (`->`) is used to access structure members through a pointer. This syntax simplifies access to structure fields when working with pointers and is widely used in embedded driver code."
    },
    {
      "title": "References (C++ Only)",
      "content": "References provide a cleaner alternative to pointers in C++. A reference acts as an alias for an existing variable, allowing functions to access and modify data without using explicit pointer syntax.\n\n```cpp\nvoid incrementByReference(int &x) {\n    x = x + 1;  // Modifies original variable\n}\n\nint main() {\n    int value = 5;\n    incrementByReference(value);\n    // value is now 6\n}\n```\n\nBecause references cannot be null and cannot be reseated after initialization, they are often safer and easier to reason about than raw pointers in application-level C++ code."
    },
    {
      "title": "Const Pointers and Pointer-to-Const",
      "content": "The `const` keyword can be applied to pointers in different ways, each with a specific meaning:\n\n- **A constant pointer** (`int *const p`) means the pointer cannot point to a different address, but the value it points to can change.\n- **A pointer to constant data** (`const int *p`) means the pointer can change, but the value it points to cannot be modified.\n- **A constant pointer to constant data** (`const int *const p`) means neither the pointer nor the value can change.\n\n```c\nint x = 10;\nconst int *ptr1 = &x;     // Cannot modify *ptr1\nint *const ptr2 = &x;     // Cannot reassign ptr2\nconst int *const ptr3 = &x; // Cannot do either\n```\n\nCorrect use of `const` improves code safety and makes intent explicit."
    },
    {
      "title": "Pointers in Interrupts and Tasks",
      "content": "When variables are shared between an interrupt service routine (ISR) and other code, they must be declared as `volatile` to prevent the compiler from making incorrect optimization assumptions.\n\n```c\nvolatile bool dataReady = false;\n\nvoid ISR_DataReceived() {\n    dataReady = true;  // Set by interrupt\n}\n\nvoid mainLoop() {\n    if (dataReady) {   // Checked in main loop\n        processData();\n        dataReady = false;\n    }\n}\n```\n\nTasks or main-loop code often access shared flags or state through pointers or references. Care must be taken to ensure data consistency and avoid race conditions when working across execution contexts."
    },
    {
      "title": "Common Pointer Issues",
      "content": "Pointer-related bugs are a frequent source of crashes and unpredictable behavior in embedded systems. Common issues include:\n\n- **Using uninitialized pointers** - The pointer contains garbage data\n- **Forgetting to dereference a pointer** - Assigning to the pointer instead of the value\n- **Dereferencing a null pointer** - Causes crashes or undefined behavior\n- **Returning or storing pointers to stack variables** - Data becomes invalid when function returns\n- **Confusing the address-of (`&`) and dereference (`*`) operators**\n\nUnderstanding these failure modes is essential for writing safe and reliable firmware."
    }
  ],
  "key_points": [
    "Pointers store memory addresses and enable direct hardware interaction",
    "Use & to get an address and * to dereference",
    "Pass by pointer to allow functions to modify original data",
    "Use const to protect data and clarify intent",
    "Declare shared variables as volatile when used in interrupts"
  ],
  "resources": [
    {"title": "Pointers Tutorial Video", "url": "https://www.youtube.com/watch?v=syy-3fVicUc", "type": "video"}
  ]
}')
WHERE id = 'lesson-t-pointers';


-- =====================================================
-- SMARTWATCH: Bit Manipulation (with video)
-- =====================================================

UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Why Bit Manipulation Matters",
      "content": "Embedded hardware frequently represents information using individual bits, bit fields, and packed binary values. Configuration registers, status flags, and sensor data are often encoded in ways that require firmware to extract or modify only specific portions of a byte or word.\n\nFor example, the PCF8563 real-time clock stores the hour value in a six-bit field rather than a full byte, while many I2C sensors reserve a single bit (often bit 7) to signal conditions such as new data availability or error states.\n\nBecause of this, embedded developers must be comfortable:\n- Reading individual bits\n- Clearing or setting specific flags\n- Updating bit fields\n- Combining multiple binary fields into meaningful values"
    },
    {
      "title": "Binary Number Basics",
      "content": "Bitwise operators can be applied to values written in binary, hexadecimal, or decimal form. When referring to bit positions within a byte, bits are indexed from right to left, starting at bit 0.\n\nFor an 8-bit value, this corresponds to positions: `7 6 5 4 3 2 1 0`\n\n```c\n// Different representations of the same value\nuint8_t value = 0b10110111;  // Binary\nuint8_t value = 0xB7;        // Hexadecimal  \nuint8_t value = 183;         // Decimal\n```"
    },
    {
      "title": "Common Bitwise Operators",
      "content": "Bitwise operators operate directly on the binary representation of values and are fundamental tools in embedded C and C++ programming.\n\n| Operator | Meaning | Example | Result |\n|----------|---------|---------|--------|\n| `&` | AND (clear or select specific bits) | `0b10110111 & 0b01111111` | `0b00110111` (bit 7 cleared) |\n| `\\|` | OR (set specific bits) | `0b10101110 \\| 0b01010001` | `0b11111111` (all bits set) |\n| `^` | XOR (flip a bit) | `0b00000101 ^ 0b00000001` | `0b00000100` (bit 0 flipped) |\n| `<<` | Left shift | `1 << 3` | `0b00001000` (shift 3 places left) |\n| `>>` | Right shift | `0b10000000 >> 4` | `0b00001000` (shift 4 places right) |\n| `~` | Bitwise NOT (invert all bits) | `~0x0F` | `0xF0` |\n\nThese operators are essential when working with hardware registers, configuration fields, and communication protocols."
    },
    {
      "title": "Bit Masking",
      "content": "A **bit mask** is a predefined binary pattern used to isolate or manipulate specific bits within a larger value. Masks are commonly applied using:\n- **AND operator** to clear unwanted bits\n- **OR operator** to set desired bits\n\nFor example, the hexadecimal value `0x7F` corresponds to the binary pattern `0111 1111`. Applying this mask clears bit 7 while preserving the lower seven bits.\n\n```c\n// PCF8563 Seconds Extraction Example\n// Bit 7 = clock integrity flag, bits 0-6 = BCD seconds\nuint8_t raw = readRegister(SECONDS_REG);\nuint8_t seconds_bcd = raw & 0x7F;  // Mask off bit 7\nuint8_t seconds = (seconds_bcd >> 4) * 10 + (seconds_bcd & 0x0F);  // BCD to decimal\n```\n\nThis technique is frequently used when a register contains both data and status flags within the same byte."
    },
    {
      "title": "Setting, Clearing, and Toggling Bits",
      "content": "Firmware often needs to modify individual bits without disturbing the rest of a register.\n\n**Setting a Bit** (force to 1):\n```c\nreg = reg | (1 << 3);  // Sets bit 3 to 1\n// Shorthand: reg |= (1 << 3);\n```\n\n**Clearing a Bit** (force to 0):\n```c\nreg = reg & ~(1 << 2);  // Clears bit 2 to 0\n// Shorthand: reg &= ~(1 << 2);\n```\n\n**Toggling a Bit** (flip current state):\n```c\nreg = reg ^ (1 << 1);  // Flips bit 1\n// Shorthand: reg ^= (1 << 1);\n```"
    },
    {
      "title": "Working with Bit Fields",
      "content": "More complex operations involve updating a **bit field**, where multiple adjacent bits represent a single value. In these cases:\n1. First clear the existing bits using a mask\n2. Shift the new value into position\n3. OR it into the cleared space\n\n```c\n// Example: Update bits 4-6 with new value (0-7)\n#define FIELD_MASK  0x70  // 0111 0000\n#define FIELD_SHIFT 4\n\nuint8_t newValue = 5;  // Value to write (0-7)\nreg = (reg & ~FIELD_MASK) | ((newValue << FIELD_SHIFT) & FIELD_MASK);\n```\n\nThis pattern is commonly used when writing configuration values to control registers."
    },
    {
      "title": "Combining Nibbles and Bytes",
      "content": "Embedded systems often need to combine or split bytes and nibbles (4-bit values).\n\n**Extract Upper and Lower Nibbles:**\n```c\nuint8_t byte = 0xAB;\nuint8_t upper = (byte >> 4) & 0x0F;  // 0x0A\nuint8_t lower = byte & 0x0F;         // 0x0B\n```\n\n**Combine Two Nibbles:**\n```c\nuint8_t upper = 0x0A;\nuint8_t lower = 0x0B;\nuint8_t byte = (upper << 4) | lower;  // 0xAB\n```\n\nThese techniques are especially common when parsing multi-byte sensor data or constructing command packets for communication protocols."
    }
  ],
  "key_points": [
    "Use & (AND) to clear or select specific bits",
    "Use | (OR) to set specific bits",
    "Use ^ (XOR) to toggle bits",
    "Use << and >> for shifting bits left or right",
    "Use ~ (NOT) to invert all bits",
    "Bit masks isolate specific bits within a register"
  ],
  "resources": [
    {"title": "Binary and Bitwise Operators Video", "url": "https://www.youtube.com/watch?v=WBim3afbYQw", "type": "video"}
  ]
}')
WHERE id = 'lesson-t-bits';

-- =====================================================
-- SMARTWATCH: I2C Communication
-- =====================================================

UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "What is I2C?",
      "content": "**I2C (Inter-Integrated Circuit)** is a widely used two-wire serial communication protocol for connecting microcontrollers to peripheral devices such as sensors, displays, real-time clocks, and power-management ICs. It is especially popular in embedded systems because it allows multiple devices to share the same communication bus with minimal wiring.\n\nThe bus consists of two signals:\n- **SCL** (Serial Clock Line) - driven by the master to synchronize communication\n- **SDA** (Serial Data Line) - bidirectional data line used to transmit and receive information\n\nA single master device (such as the ESP32) controls communication with one or more slave devices, each identified by a unique **7-bit address** (for example, `0x51` or `0x19`). All devices on the bus share the same SDA and SCL lines."
    },
    {
      "title": "Electrical Characteristics",
      "content": "Electrically, I2C uses an **open-drain configuration**. Devices are only allowed to pull the lines low and never drive them high. For this reason, **external pull-up resistors** are required to bring the lines high when they are idle.\n\nThese pull-ups are typically around **4.7 kOhm**. On the T-Watch platform, the required pull-up resistors are already present on the board.\n\n```\n  VCC\n   |\n  [R]  <- Pull-up resistor (4.7k)\n   |\n  SDA/SCL line\n   |\n  Device (open-drain output)\n   |\n  GND\n```"
    },
    {
      "title": "I2C Transaction Sequence",
      "content": "Every I2C transaction follows a defined sequence:\n\n1. **START condition** - Master pulls SDA low while SCL is high\n2. **Slave address + R/W bit** - 7-bit address plus read (1) or write (0) bit\n3. **ACK from slave** - Slave acknowledges by pulling SDA low\n4. **Data bytes** - One or more bytes with ACK after each\n5. **STOP condition** - Master releases SDA while SCL is high\n\n```\nSTART -> ADDRESS+R/W -> ACK -> DATA -> ACK -> ... -> STOP\n```\n\nUnderstanding this sequence is essential for debugging and low-level driver development."
    },
    {
      "title": "Reading the Datasheet and Schematics",
      "content": "Before writing any I2C driver code, it is critical to study both the **schematic** and the **device datasheet**.\n\n**From the schematic**, you must identify:\n- Which pins are connected to SDA and SCL\n- Which I2C bus instance is being used (e.g., `I2C_NUM_0` or `I2C_NUM_1`)\n\n**From the datasheet**, you must determine:\n- The device 7-bit I2C address\n- The register map that defines how data is stored\n- The maximum supported clock speed\n\nThe I2C master must operate at a frequency that is equal to or lower than what the peripheral supports. Failing to extract this information correctly is one of the most common causes of I2C communication errors."
    },
    {
      "title": "Driver Architecture",
      "content": "Well-structured I2C drivers are typically written in layers:\n\n**Layer 1: Bus Layer**\nHandles raw I2C transactions such as initializing the bus, sending bytes, and reading bytes. This layer interacts directly with the hardware driver provided by the platform.\n\n**Layer 2: Driver Logic**\nInterprets device-specific register layouts and data formats.\n\n**Layer 3: API Layer**\nExposes simple, readable functions that the rest of the application can use without needing to understand low-level I2C details.\n\nThe number of layers in between depends on the complexity of the peripheral and the overall system, but separating concerns in this way improves maintainability and reuse."
    },
    {
      "title": "Error Handling",
      "content": "When writing low-level I2C drivers, it is essential to continuously verify that each communication step completes successfully.\n\nOn the ESP32 platform, I2C functions typically return an `esp_err_t` value. Every call should store this return value and check whether it equals `ESP_OK`. Any other value indicates that an error occurred during communication.\n\n```c\nesp_err_t ret = i2c_master_write_byte(cmd, data, true);\nif (ret != ESP_OK) {\n    ESP_LOGE(TAG, \"I2C write failed: %s\", esp_err_to_name(ret));\n    return ret;\n}\n```\n\nRobust error handling at the driver level makes higher-level debugging significantly easier."
    },
    {
      "title": "Using the Wire Library",
      "content": "For this project, direct use of the Arduino Wire library is not required for all peripherals. Devices such as the AXP202 power-management IC and the BMA423 accelerometer provide helper objects that internally manage I2C communication.\n\nWhen the Wire library is required, it must be initialized explicitly with the correct pin assignments:\n\n```cpp\nWire.begin(I2C_MASTER_SDA, I2C_MASTER_SCL);\n```\n\nAdditional information about the Wire library can be found in the [official Arduino documentation](https://docs.particle.io/reference/device-os/api/wire-i2c/)."
    },
    {
      "title": "Common Debugging Tips",
      "content": "When I2C communication fails, check the following:\n\n1. **Verify wiring** - Ensure SDA and SCL are connected to the correct pins\n2. **Check the address** - Use an I2C scanner to verify the device is responding\n3. **Verify pull-ups** - Missing or incorrect pull-up resistors cause communication failures\n4. **Check clock speed** - Some devices require slower clock speeds\n5. **Review the datasheet** - Ensure you are reading/writing to the correct registers\n6. **Add delays** - Some devices need time between transactions\n7. **Check power** - Ensure the device has proper power supply"
    }
  ],
  "key_points": [
    "I2C uses two wires: SCL (clock) and SDA (data)",
    "Each device has a unique 7-bit address",
    "Pull-up resistors are required for proper operation",
    "Always check return values for errors",
    "Study both schematic and datasheet before coding"
  ],
  "resources": [
    {"title": "Arduino Wire Library Documentation", "url": "https://docs.particle.io/reference/device-os/api/wire-i2c/", "type": "link"}
  ]
}')
WHERE id = 'lesson-t-i2c';


-- =====================================================
-- BALL AND BEAM COURSE - COMPLETE OVERVIEW
-- =====================================================

UPDATE lessons SET content_json = json('{
  "video_url": "",
  "sections": [
    {
      "title": "Introduction",
      "content": "In this program you will model and create a robust ball and beam controller by creating an engineering model, designing control loop architecture, and deploying code on a real control system.\n\nYou will work with a collection of **3D printed parts**, electronics, and a wooden platform originally developed by Ian Carey. This project will help you develop an understanding of **control theory**, **physics**, and software written in **Python and C++**. It includes a combination of model-based design and hands-on testing which are techniques used in industry for designing and deploying control systems.\n\nThroughout the program you will build your project incrementally using provided training materials, reference implementations, and various examples. These resources are designed to support you without removing the need for engineering decision making.\n\nIf you need help, email **support@shortcct.com** with your specific questions and a zip file including any files relevant to your project. Remember, virtual support is available for **3 months** after your product delivery date."
    },
    {
      "title": "Recommended Background",
      "content": "This project is designed for students who want hands-on control and embedded systems experience. You do not need a lot of experience, but some foundational knowledge is expected.\n\n**Required:**\n- Introductory programming experience in C++ or Python\n- Basic knowledge of electronics\n\n**Helpful:**\n- Introductory exposure to embedded systems\n- Basic understanding of physics and signal theory\n\nIf you find that you are missing some of this background, reach out to us at **support@shortcct.com** and we can explore options to get you up to speed!"
    },
    {
      "title": "Industry Alignment",
      "content": "We analyzed the most in-demand skills across **50+ companies** hiring embedded systems engineering interns. Below is how the Ball and Beam Project aligns with those skills.\n\n- **Core skills** are fully covered in the base project.\n- **Extendable skills** can be developed through optional project extensions and the design challenge.\n- **Not Covered** indicates skills that are outside the scope of the core project."
    },
    {
      "title": "Documentation",
      "content": "Here is the relevant documentation that you will need to use throughout the development of your project:\n\n**Motor Control:**\n- [Control Stepper Motor with DRV8825 Driver Module & Arduino](https://lastminuteengineers.com/drv8825-stepper-motor-driver-arduino-tutorial/) - Last Minute Engineers\n\n**Distance Sensing:**\n- [How HC-SR04 Ultrasonic Sensor Works & Interface It With Arduino](https://lastminuteengineers.com/arduino-sr04-ultrasonic-sensor-tutorial/) - Last Minute Engineers\n\n**System Modeling:**\n- [Control Tutorials for MATLAB and Simulink - Ball & Beam: System Modeling](https://ctms.engin.umich.edu/CTMS/index.php?example=BallBeam&section=SystemModeling)"
    },
    {
      "title": "Set Up Ball and Beam",
      "content": "**Setup Section Coming Soon**\n\nThis section will include detailed instructions for assembling the Ball and Beam hardware, connecting the electronics, and configuring the software environment."
    }
  ],
  "key_points": [
    "Build a real-time control system using 3D printed parts and electronics",
    "Learn control theory, physics, and software in Python and C++",
    "Combine model-based design with hands-on testing",
    "Support available at support@shortcct.com for 3 months"
  ],
  "resources": [
    {"title": "DRV8825 Stepper Motor Tutorial", "url": "https://lastminuteengineers.com/drv8825-stepper-motor-driver-arduino-tutorial/", "type": "link"},
    {"title": "HC-SR04 Ultrasonic Sensor Tutorial", "url": "https://lastminuteengineers.com/arduino-sr04-ultrasonic-sensor-tutorial/", "type": "link"},
    {"title": "Ball & Beam System Modeling", "url": "https://ctms.engin.umich.edu/CTMS/index.php?example=BallBeam&section=SystemModeling", "type": "link"}
  ]
}')
WHERE id = 'bb-lesson-t-overview';

-- =====================================================
-- BALL AND BEAM: Basic Embedded Systems
-- =====================================================

UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Real-Time Embedded Control",
      "content": "The Ball and Beam system operates as a **real-time embedded control system** in which a microcontroller continuously reads the position of the ball, computes a corrective action, and commands a motor to adjust the beam angle.\n\nUnlike traditional desktop programs that run once and terminate, embedded systems execute in a **continuous loop**. In the Arduino environment, every program is organized around two core functions:\n\n- **`setup()`** - Runs once at startup and is used to initialize hardware components such as input/output pins, serial communication, sensors, and motor drivers.\n- **`loop()`** - Runs repeatedly and forms the core control cycle of the system.\n\nWithin this loop, the microcontroller repeatedly performs three essential steps:\n1. Measure the ball position\n2. Calculate the control output\n3. Update the actuator"
    },
    {
      "title": "Hardware Interfacing",
      "content": "To interface with hardware, pins must be properly configured as inputs or outputs using `pinMode()`.\n\n**Reading Sensors:**\nSensors such as potentiometers or distance sensors are typically read using `analogRead()`, which converts a voltage signal into a digital value using the microcontrollers internal analog-to-digital converter.\n\n**Controlling Actuators:**\nActuators such as motors are controlled using digital signals or **Pulse Width Modulation (PWM)**. PWM allows the microcontroller to simulate an analog output by rapidly switching a pin on and off with a controllable duty cycle.\n\nIn the Ball and Beam system, adjusting the PWM duty cycle changes the motors effective power, which in turn adjusts the beam angle."
    },
    {
      "title": "Timing and Control Loops",
      "content": "Timing is a critical component of any control system. The control loop must run at **consistent intervals** to ensure stable and predictable behavior.\n\nInstead of using blocking delays that pause execution, embedded systems should rely on **non-blocking timing methods** such as `millis()` to maintain a steady loop frequency.\n\n```cpp\nunsigned long previousTime = 0;\nconst unsigned long interval = 10;  // 10ms loop interval\n\nvoid loop() {\n    unsigned long currentTime = millis();\n    if (currentTime - previousTime >= interval) {\n        previousTime = currentTime;\n        \n        // Read sensor\n        // Compute PID\n        // Update motor\n    }\n}\n```\n\nThis ensures the system remains responsive and capable of updating sensor readings and motor commands at a fixed rate. Consistent timing becomes especially important when implementing feedback control algorithms such as PID."
    },
    {
      "title": "Using Libraries",
      "content": "Libraries are commonly used to simplify interaction with hardware components like ultrasonic sensors, servo motors, or communication modules.\n\nWhile these libraries abstract lower-level details, it is important to understand that they are:\n- Configuring timers\n- Managing communication protocols such as I2C or SPI\n- Handling signal timing behind the scenes\n\nA strong embedded systems engineer understands not only how to call library functions, but also what those functions are doing internally."
    },
    {
      "title": "Serial Debugging",
      "content": "**Serial communication** is an essential debugging tool in embedded development. By printing sensor values, control signals, and tuning parameters to the Serial Monitor, students can observe system behavior in real time and diagnose issues systematically.\n\n```cpp\nvoid setup() {\n    Serial.begin(115200);\n}\n\nvoid loop() {\n    int position = readSensor();\n    int output = computePID(position);\n    \n    Serial.print(\"Position: \");\n    Serial.print(position);\n    Serial.print(\" Output: \");\n    Serial.println(output);\n}\n```\n\nThis mirrors professional engineering practice, where logging and measurement are critical for validating system performance."
    }
  ],
  "key_points": [
    "Embedded systems run in continuous loops, not one-time execution",
    "Use setup() for initialization and loop() for continuous operation",
    "Use non-blocking timing with millis() for consistent control loops",
    "PWM enables analog-like control of motors",
    "Serial debugging is essential for system validation"
  ],
  "resources": []
}')
WHERE id = 'bb-lesson-t-embedded';

