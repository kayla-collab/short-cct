-- Migration: Complete Training Content with All Images and Links from PDF
-- This migration updates all training lessons with full content from the Smartwatch PDF

-- =====================================================
-- LESSON: Complete Project Overview (lesson-t-overview)
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
      "content": "We analyzed the most in-demand skills across 50+ companies hiring embedded systems engineering interns. Below is how the Smartwatch Project aligns with those skills.\n\n**Core Skills** are fully covered in the base project.\n**Extendable Skills** can be developed through optional project extensions and the design challenge.\n**Not Covered** indicates skills that are outside the scope of the core project."
    },
    {
      "title": "Documentation",
      "content": "Here is the relevant documentation that you will need to use throughout the development of your project:\n\n**Datasheets:**\n- [AXP202 Datasheet](https://linux-sunxi.org/images/2/20/AXP202_Datasheet_v1.0_en.pdf) - Power Management IC\n- [PCF8563 Datasheet](https://www.nxp.com/docs/en/data-sheet/PCF8563.pdf) - Real-Time Clock\n- [ST7789V Datasheet](https://www.displayfuture.com/Display/datasheet/controller/ST7789V.pdf) - Display Controller\n- [FT6236U Datasheet](https://www.buydisplay.com/download/ic/FT6236-FT6336-FT6436L-FT6436_Datasheet.pdf) - Touch Controller\n- [BMA423 Datasheet](https://www.mouser.com/datasheet/2/783/BSCH_S_A0010021471_1-2525113.pdf) - Accelerometer\n\n**Libraries:**\n- [TFT_eSPI Library](https://doc-tft-espi.readthedocs.io/) - Display Graphics Library\n- [AXP202X_Library](https://github.com/lewisxhe/AXP202X_Library) - Power Management Library\n- [BMA423_Library](https://github.com/lewisxhe/BMA423_Library/tree/master) - Accelerometer Library\n\n**Other:**\n- [T-Watch Pinout](https://github.com/Xinyuan-LilyGO/TTGO_TWatch_Library/blob/master/docs/watch_2020_v3.md)\n- [T-Watch Schematic](https://github.com/Xinyuan-LilyGO/TTGO_TWatch_Library/blob/master/Schematic/T_WATCH-2020V03.pdf)"
    },
    {
      "title": "Set Up Smartwatch",
      "content": "To set up PlatformIO, this video by DroneBot Workshop is a great resource. It includes installation steps for Linux, MacOS, and Windows. You can download the latest versions of Python and Visual Studio Code.\n\nOnce you have downloaded PlatformIO on your system, watch the following video to set up your environment for our project.\n\nThe following video shows you how to clone our GitHub repository, [short-circuit-projects/smartwatch](https://github.com/short-circuit-projects/smartwatch), to VSCode. This tutorial is done on Windows, so it will look different on Linux or MacOS."
    }
  ],
  "key_points": [
    "Work on the LilyGo T-Watch 2020 V3, a real commercial smartwatch platform",
    "Write production-style firmware entirely in C and C++",
    "Build your system incrementally with provided training materials",
    "Virtual support available for 3 months at support@shortcct.com",
    "GitHub repository: short-circuit-projects/smartwatch"
  ],
  "resources": [
    {"type": "video", "title": "Complete Project Overview", "url": "https://www.youtube.com/watch?v=52L8VP05elU"},
    {"type": "video", "title": "Smartwatch Setup Tutorial", "url": "https://www.youtube.com/watch?v=CAvawEcxoPU"},
    {"type": "github", "title": "Project Repository", "url": "https://github.com/short-circuit-projects/smartwatch"},
    {"type": "documentation", "title": "T-Watch Pinout", "url": "https://github.com/Xinyuan-LilyGO/TTGO_TWatch_Library/blob/master/docs/watch_2020_v3.md"}
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/2D27gI2m", "alt": "Industry Alignment Skills Table", "caption": "How the Smartwatch Project aligns with in-demand embedded systems skills"}
  ]
}')
WHERE id = 'lesson-t-overview';

-- =====================================================
-- LESSON: File Structure (lesson-t-files)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "File Structure: Headers and Source Files",
      "content": "In C and C++ projects, header files define the interface, while source files implement the functionality. This separation allows different parts of the program to interact through well-defined boundaries.\n\nHeader files contain **declarations**, not executable code. Their purpose is to describe what a module provides, not how it works. Other files include a header file to understand how to use the functions, data types, or classes defined by that module.\n\nA typical header file includes:\n- Function prototypes for functions implemented elsewhere\n- Constant definitions\n- Data type declarations such as struct, enum, or typedef\n- In C++ projects, class declarations that define the public interface of a class"
    },
    {
      "title": "Header File Example (accel.h)",
      "content": "```c\n#ifndef ACCEL_H\n#define ACCEL_H\n\nvoid accel_init();\nvoid accel_read(float *x, float *y, float *z);\n\n#endif\n```\n\nThis header file declares two functions for the accelerometer module. The `#ifndef` guard prevents multiple inclusion."
    },
    {
      "title": "C Source File (accel.c)",
      "content": "C source files contain the actual implementations of the functions and logic declared in their corresponding header files. This is where executable code lives and where the behavior of a module is defined.\n\n```c\n#include \"accel.h\"\n#include \"driver/i2c.h\"\n\nvoid accel_init(){\n    // Setup I2C communication with accelerometer\n}\n\nvoid accel_read(float *x, float *y, float *z){\n    // Read acceleration data from sensor registers\n}\n```\n\nThese files typically include function definitions, internal helper functions, and low-level hardware or driver logic. Helper functions are often marked as `static` to limit their visibility to the file itself."
    },
    {
      "title": "C++ Source File (display.cpp)",
      "content": "C++ source files serve the same purpose as `.c` files but are used when the project relies on C++ features such as classes, objects, and encapsulation.\n\n```cpp\n#include \"display.h\"\n#include <TFT_eSPI.h>\n\nDisplay::Display(){}\n\nvoid Display::initialize(){\n    tft_init();\n    tft.setRotation(1);\n}\n```\n\nThey contain implementations of class methods and support object-oriented design patterns that improve code organization and reuse. In embedded systems, `.cpp` files are commonly used when interacting with C++ based libraries such as Arduino or FreeRTOS."
    }
  ],
  "key_points": [
    "Header files (.h) declare interfaces; source files (.c/.cpp) implement functionality",
    "Use include guards (#ifndef) to prevent multiple inclusion",
    "Mark internal helper functions as static to limit visibility",
    "Keep header files minimal - only expose what other modules need",
    "C++ files support classes and object-oriented design"
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/GRlXsv6S", "alt": "Header file example showing accel.h", "caption": "Header File (accel.h) - Declares the public interface"},
    {"url": "https://www.genspark.ai/api/files/s/OpYat2ou", "alt": "Source file example showing accel.c", "caption": "C Source File (accel.c) - Implements the functionality"},
    {"url": "https://www.genspark.ai/api/files/s/JV9pfb30", "alt": "C++ source file example showing display.cpp", "caption": "C++ Source File (display.cpp) - Uses classes and OOP"}
  ]
}')
WHERE id = 'lesson-t-files';

-- =====================================================
-- LESSON: Pointers and References (lesson-t-pointers)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "video_url": "https://www.youtube.com/watch?v=syy-3fVicUc",
  "sections": [
    {
      "title": "Introduction to Pointers and References",
      "content": "Pointers are fundamental to C and C++ programming, especially in embedded systems. They allow you to:\n- Directly access and modify memory\n- Pass large data structures efficiently\n- Interface with hardware registers\n- Implement dynamic data structures\n\nUnderstanding pointers is essential for working with sensor data, memory-mapped peripherals, and efficient firmware design."
    },
    {
      "title": "Pointer Basics",
      "content": "A pointer holds the memory address of another variable. Use `&` to get the address of a variable and `*` to dereference (access the value at) an address.\n\n**Key syntax:**\n- `int *p;` - Declares a pointer to int\n- `p = &x;` - Assigns the address of x to p\n- `*p` - Accesses the value p points to"
    },
    {
      "title": "Passing by Value vs Pointer",
      "content": "When you pass a variable by value, the function receives a copy. Changes inside the function do not affect the original.\n\n```c\nvoid incrementValue(int x) //pass by value\n{\n    x++;\n}\n\nvoid incrementPointer(int *x) //pass by reference\n{\n    (*x)++;\n}\n```\n\nPassing by pointer allows the function to modify the original variable. This is essential when you need a function to return multiple values or modify data in place."
    },
    {
      "title": "Pointers and Arrays",
      "content": "In C, arrays decay to pointers when passed to functions. The array name itself is a pointer to the first element.\n\n```c\nuint8_t data[6];\ni2c_read_bytes(0x38, data, 6); //data is passed as a pointer\n```\n\nThis is commonly used when reading sensor data into buffers."
    },
    {
      "title": "Pointers to Structures",
      "content": "Pointers to structures allow efficient passing of complex data types and in-place modification.\n\n```c\ntypedef struct{\n    float x, y, z;\n} AccelData;\n\nvoid accel_read(AccelData *reading){\n    reading->x = 0.1;\n    reading->y = 0.0;\n    reading->z = 9.8;\n}\n\nAccelData a;\naccel_read(&a);  // Pass address to modify contents\n```\n\nThe `->` operator accesses structure members through a pointer."
    },
    {
      "title": "C++ References",
      "content": "C++ provides references as a cleaner alternative to pointers in many cases. A reference is an alias to an existing variable.\n\n```cpp\nvoid increment(int &x) { x++; }\n\nint a = 5;\nincrement(a);  // a = 6\n```\n\nReferences cannot be null and cannot be reassigned, making them safer than raw pointers."
    },
    {
      "title": "Const Pointers",
      "content": "The `const` keyword with pointers prevents unintended modifications:\n\n```c\nesp_err_t i2c_master_write_read_device(\n    i2c_port_t i2c_num,\n    uint8_t device_addr,\n    const uint8_t *write_buffer, //pointer to const\n    size_t write_size,\n    uint8_t *read_buffer //normal pointer\n    size_t read_size,\n    TickType_t ticks_to_wait);\n```\n\n- `const uint8_t *p` - Cannot modify data through p\n- `uint8_t * const p` - Cannot modify p itself\n- `const uint8_t * const p` - Both are immutable"
    },
    {
      "title": "Pointers in Interrupts and Tasks",
      "content": "When sharing data between main code and ISRs, use `volatile` to prevent compiler optimizations that could cause issues:\n\n```c\nvolatile bool touch_flag = false;\n\nvoid IRAM_ATTR touchISR() {touch_flag = true;}\n```\n\nThe `volatile` keyword tells the compiler that this variable may change unexpectedly (e.g., by hardware or an interrupt)."
    }
  ],
  "key_points": [
    "Use & to get an address, * to dereference",
    "Pass by pointer to modify original data",
    "Arrays decay to pointers when passed to functions",
    "Use const to protect data from modification",
    "Use volatile for variables shared with ISRs"
  ],
  "resources": [
    {"type": "video", "title": "Pointers Tutorial Video", "url": "https://www.youtube.com/watch?v=syy-3fVicUc"}
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/YsKE1msu", "alt": "Pass by value vs pointer comparison", "caption": "Pass by Value vs Pass by Pointer"},
    {"url": "https://www.genspark.ai/api/files/s/TYGHNi6D", "alt": "Array passed as pointer", "caption": "Arrays Decay to Pointers"},
    {"url": "https://www.genspark.ai/api/files/s/Bp3rosBj", "alt": "Pointer to structure example", "caption": "Passing Structures by Pointer"},
    {"url": "https://www.genspark.ai/api/files/s/r35lc3EY", "alt": "C++ reference example", "caption": "C++ References"},
    {"url": "https://www.genspark.ai/api/files/s/DvkMDv39", "alt": "Const pointer in function signature", "caption": "Const Pointers for Safety"},
    {"url": "https://www.genspark.ai/api/files/s/CYKOT8kp", "alt": "Volatile variable for ISR", "caption": "Volatile Variables in Interrupts"}
  ]
}')
WHERE id = 'lesson-t-pointers';

-- =====================================================
-- LESSON: Bit Manipulation (lesson-t-bits)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "video_url": "https://www.youtube.com/watch?v=WBim3afbYQw",
  "sections": [
    {
      "title": "Why Bit Manipulation Matters",
      "content": "Embedded systems often need precise control over individual bits in hardware registers. Bit manipulation allows you to:\n- Set, clear, and toggle specific bits in configuration registers\n- Extract fields from packed data formats\n- Efficiently encode and decode sensor data\n- Minimize memory usage in resource-constrained systems"
    },
    {
      "title": "Bitwise Operators",
      "content": "| Operator | Name | Description |\n|----------|------|-------------|\n| `&` | AND | 1 if both bits are 1 |\n| `\\|` | OR | 1 if either bit is 1 |\n| `^` | XOR | 1 if bits are different |\n| `~` | NOT | Inverts all bits |\n| `<<` | Left Shift | Shifts bits left |\n| `>>` | Right Shift | Shifts bits right |"
    },
    {
      "title": "Masking to Extract Bits",
      "content": "Masking uses AND to isolate specific bits. This is commonly used when reading sensor data that encodes multiple values in a single byte.\n\n```c\ntimeinfo->tm_sec = bcdToDec(data[0] & 0x7F);\n```\n\nHere, `& 0x7F` masks out the top bit (bit 7) and keeps bits 0-6, extracting the seconds value from BCD-encoded RTC data."
    },
    {
      "title": "Setting a Bit",
      "content": "Use OR with a shifted 1 to set a specific bit without affecting others:\n\n```c\nreg |= (1 << 3);  //Set bit 3\n```\n\nThis is useful for enabling features in configuration registers."
    },
    {
      "title": "Clearing a Bit",
      "content": "Use AND with an inverted mask to clear a specific bit:\n\n```c\nreg &= ~(1 << 2);  // Clear bit 2\n```\n\nThe `~` operator inverts all bits, so `~(1 << 2)` produces a mask with all 1s except bit 2."
    },
    {
      "title": "Toggling a Bit",
      "content": "Use XOR to toggle a bit (flip its state):\n\n```c\nreg ^= (1 << 1);\n```\n\nThis changes 0 to 1 or 1 to 0 at the specified position."
    },
    {
      "title": "Bit Field Manipulation",
      "content": "Sometimes you need to modify a multi-bit field within a register. First clear the field, then insert the new value:\n\n```c\nreg &= ~(0b111 << 4);      // Clear bits 4-6\nreg |= ((field & 0b111) << 4);  // Insert new field value\n```\n\nThis pattern is common when configuring peripheral settings like baud rates or clock dividers."
    },
    {
      "title": "Combining and Extracting Nibbles",
      "content": "Nibbles (4-bit values) are often packed into bytes:\n\n```c\n// Combine two nibbles into one byte\nuint8_t combined = (upper << 4) | lower;\n\n// Extract nibbles from a byte\nuint8_t upper = (combined >> 4) & 0x0F;\nuint8_t lower = combined & 0x0F;\n```"
    }
  ],
  "key_points": [
    "Use & (AND) with a mask to extract specific bits",
    "Use | (OR) to set bits: reg |= (1 << n)",
    "Use & ~ to clear bits: reg &= ~(1 << n)",
    "Use ^ (XOR) to toggle bits",
    "Shift left (<<) multiplies by powers of 2"
  ],
  "resources": [
    {"type": "video", "title": "Bitwise Operators Tutorial", "url": "https://www.youtube.com/watch?v=WBim3afbYQw"}
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/Z9xpiYDO", "alt": "BCD masking example", "caption": "Masking to Extract Bits from BCD Data"},
    {"url": "https://www.genspark.ai/api/files/s/wHbEXFla", "alt": "Setting bit 3 example", "caption": "Setting a Bit with OR"},
    {"url": "https://www.genspark.ai/api/files/s/Zo4l8Wm5", "alt": "Clearing bit 2 example", "caption": "Clearing a Bit with AND NOT"},
    {"url": "https://www.genspark.ai/api/files/s/0XJzPdu7", "alt": "Toggling a bit example", "caption": "Toggling a Bit with XOR"},
    {"url": "https://www.genspark.ai/api/files/s/dYzN0ted", "alt": "Bit field manipulation", "caption": "Clearing and Inserting a Bit Field"},
    {"url": "https://www.genspark.ai/api/files/s/qDuaF8PU", "alt": "Combining nibbles", "caption": "Combining Two Nibbles"},
    {"url": "https://www.genspark.ai/api/files/s/acKfwwo2", "alt": "Extracting nibbles", "caption": "Extracting Nibbles from a Byte"}
  ]
}')
WHERE id = 'lesson-t-bits';

-- =====================================================
-- LESSON: I2C Communication (lesson-t-i2c)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Introduction to I2C",
      "content": "I2C (Inter-Integrated Circuit) is a two-wire serial communication protocol commonly used in embedded systems to interface with sensors, EEPROMs, and other peripherals.\n\n**Key characteristics:**\n- Uses only two wires: SDA (data) and SCL (clock)\n- Supports multiple devices on the same bus\n- Each device has a unique 7-bit address\n- Master-slave architecture (ESP32 is typically the master)"
    },
    {
      "title": "I2C Pin Configuration",
      "content": "Define your I2C configuration constants at the top of your driver file:\n\n```c\n#define SENSOR_ADDR      0x24\n\n#define I2C_MASTER_SCL   14\n#define I2C_MASTER_SDA   13\n\n#define I2C_MASTER_FREQ_HZ  100000\n```\n\nThe T-Watch uses GPIO 14 for SCL and GPIO 13 for SDA. The frequency is typically 100 kHz for standard mode or 400 kHz for fast mode."
    },
    {
      "title": "I2C Initialization",
      "content": "Before communicating with I2C devices, you must initialize the I2C peripheral:\n\n```c\nvoid mytime_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA,\n        .scl_io_num = I2C_MASTER_SCL,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n\n    i2c_param_config(I2C_MASTER_PORT, &conf);\n}\n```\n\nThis configures the ESP32 as an I2C master with internal pull-up resistors enabled."
    },
    {
      "title": "Driver Architecture",
      "content": "A well-structured I2C driver typically has these layers:\n\n1. **Low-level functions**: `i2c_read_bytes()`, `i2c_write_bytes()` - Handle raw I2C transactions\n2. **Device-specific functions**: `i2c_get_price()`, `i2c_set_price()` - Implement device protocol\n3. **Application interface**: Higher-level functions your application calls"
    },
    {
      "title": "Read and Write Functions",
      "content": "Implement low-level read/write functions that can be reused across different I2C devices:\n\n```c\nesp_err_t i2c_read_bytes(uint8_t start_addr, uint8_t *data, size_t len)\n{\n    /*\n     Try to use the i2c_master_write_to_device and\n     i2c_master_read_from_device functions. Setting the\n     return of each call to a variable with esp_err_t\n     type can be useful for debugging\n    */\n}\n\nesp_err_t i2c_write_bytes(uint8_t start_addr, uint8_t *data, size_t len)\n{\n    /*\n     When writing data to your peripheral, you will need to store your\n     data inside of a buffer array whose 0th index value is start_addr\n     and the rest of the data is stored from the 1st index onwards\n    */\n}\n```"
    },
    {
      "title": "Device-Specific Functions",
      "content": "Build higher-level functions on top of your read/write primitives:\n\n```c\nesp_err_t i2c_get_price(uint8_t *prices)\n{\n    /*\n     Here, you will need to store data from\n     the peripheral into the prices array\n    */\n}\n\nesp_err_t i2c_set_price(uint8_t *prices)\n{\n    /*\n     Here, you will need to write data from\n     the prices array into the peripheral\n    */\n}\n```\n\nThese functions abstract away the I2C details, making your application code cleaner."
    },
    {
      "title": "Error Handling",
      "content": "Always check return values from I2C functions. Common errors include:\n- `ESP_ERR_TIMEOUT`: No response from device (wrong address or disconnected)\n- `ESP_ERR_INVALID_ARG`: Invalid parameters\n- `ESP_FAIL`: General failure\n\nGood practice is to propagate errors up to the caller for handling."
    }
  ],
  "key_points": [
    "I2C uses two wires: SDA (data) and SCL (clock)",
    "Each device has a unique 7-bit address",
    "Always initialize I2C before use with proper pin and speed configuration",
    "Structure your driver with low-level, device-specific, and application layers",
    "Always check and handle I2C errors"
  ],
  "resources": [
    {"type": "documentation", "title": "Arduino Wire I2C Library", "url": "https://docs.particle.io/reference/device-os/api/wire-i2c/"}
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/8tNSM42D", "alt": "I2C configuration defines", "caption": "I2C Pin and Address Configuration"},
    {"url": "https://www.genspark.ai/api/files/s/MYY042R8", "alt": "I2C initialization code", "caption": "I2C Master Initialization"},
    {"url": "https://www.genspark.ai/api/files/s/lG8RU3MP", "alt": "I2C read write functions", "caption": "I2C Driver Read/Write Functions"}
  ]
}')
WHERE id = 'lesson-t-i2c';

-- =====================================================
-- LESSON: Object-Oriented Programming (lesson-t-oop)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Introduction to OOP in Embedded Systems",
      "content": "Object-Oriented Programming (OOP) in C++ helps organize embedded code into reusable, maintainable components. Key concepts include:\n\n- **Encapsulation**: Bundling data and methods that operate on that data\n- **Abstraction**: Hiding implementation details behind clean interfaces\n- **Classes**: Blueprints for creating objects with shared behavior"
    },
    {
      "title": "Classes and Objects",
      "content": "A class defines a type with data members and member functions. An object is an instance of a class.\n\n```cpp\nclass Motor{\n  private:\n    int pin; //internal data\n  \n  public:\n    void start();\n    void stop();\n};\n```\n\nYou can create multiple instances of the same class:\n\n```cpp\nMotor leftMotor; //instance of defined motor class\nMotor rightMotor;\n```"
    },
    {
      "title": "Encapsulation and Access Control",
      "content": "Use access specifiers to control what is visible outside the class:\n\n- **private**: Only accessible within the class\n- **public**: Accessible from anywhere\n- **protected**: Accessible in class and derived classes\n\n```cpp\nclass Motor {\n  private:\n    int speed; //state variable\n  \n  public:\n    void setSpeed(int s) { speed = s; }\n};\n\nMotor leftMotor, rightMotor;\nleftMotor.setSpeed(100);\nrightMotor.setSpeed(50);\n```\n\nThis prevents direct access to internal state, forcing users to go through your interface."
    },
    {
      "title": "Encapsulation for Hardware",
      "content": "Encapsulation is especially useful for hardware drivers:\n\n```cpp\nclass LED{\n  private:\n    int pin;\n  \n  public:\n    void turnOn() { digitalWrite(pin, HIGH); }\n    void turnOff() { digitalWrite(pin, LOW); }\n};\n\nLED statusLED;\nstatusLED.turnOn();\n```\n\nThe user does not need to know which pin the LED is on or how to control it."
    },
    {
      "title": "Constructors",
      "content": "A constructor initializes an object when it is created:\n\n```cpp\nclass Sensor {\n  private:\n    int pin;\n    int rawValue;\n  \n  public:\n    Sensor(int p) { pin = p; }\n    void read() { rawValue = analogRead(pin);}\n    int getValue() {return rawValue;}\n};\n\nSensor temp(34);\ntemp.read();\nSerial.println(temp.getValue());\ntemp.rawValue = 100;  // Error: private!\n```\n\nThe constructor takes the pin number as a parameter, making the class flexible."
    },
    {
      "title": "Header and Source Files for Classes",
      "content": "**motor.h** - Class declaration:\n```cpp\nclass Motor{\n  private:\n    int pin; //internal data\n  \n  public:\n    void start();\n    void stop();\n};\n```\n\n**motor.cpp** - Class implementation:\n```cpp\n#include \"motor.h\"\n#include <Arduino.h>\n\nMotor::Motor(int pinNumber) : pin(pinNumber)\n{\n    pinMode(pin, OUTPUT);\n    digitalWrite(pin, LOW); // ensure motor is off at start\n}\n\nvoid Motor::start()\n{\n    digitalWrite(pin, HIGH);   // Turn motor ON\n}\n\nvoid Motor::stop()\n{\n    digitalWrite(pin, LOW);    // Turn motor OFF\n}\n```"
    },
    {
      "title": "Using Classes in Main Code",
      "content": "```cpp\n#include <Arduino.h>\n#include \"motor.h\"\n\nMotor vibrationMotor(25);\n\nvoid setup() {\n    Serial.begin(115200);\n}\n\nvoid loop() {\n    // Turn motor on for 500 ms\n    vibrationMotor.start();\n    delay(500);\n    \n    // Turn motor off for 500 ms\n    vibrationMotor.stop();\n    delay(500);\n}\n```\n\nThe main code is clean and readable because the Motor class handles all the low-level details."
    }
  ],
  "key_points": [
    "Classes bundle data and methods together",
    "Use private for internal state, public for the interface",
    "Constructors initialize objects with required parameters",
    "Separate class declaration (.h) from implementation (.cpp)",
    "OOP makes embedded code more modular and reusable"
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/33SvqwyJ", "alt": "Motor class declaration", "caption": "Basic Class Declaration"},
    {"url": "https://www.genspark.ai/api/files/s/tzy3mRia", "alt": "Creating class instances", "caption": "Creating Multiple Objects"},
    {"url": "https://www.genspark.ai/api/files/s/ISx1Ioau", "alt": "Encapsulation with state variable", "caption": "Encapsulation with Setter Method"},
    {"url": "https://www.genspark.ai/api/files/s/msglza9U", "alt": "LED class example", "caption": "Hardware Encapsulation - LED Class"},
    {"url": "https://www.genspark.ai/api/files/s/hE3LKSea", "alt": "Sensor class with constructor", "caption": "Class with Constructor"},
    {"url": "https://www.genspark.ai/api/files/s/QYO4KoAH", "alt": "Motor header file", "caption": "Motor Class Header (motor.h)"},
    {"url": "https://www.genspark.ai/api/files/s/yrUGzVmm", "alt": "Motor source file", "caption": "Motor Class Implementation (motor.cpp)"},
    {"url": "https://www.genspark.ai/api/files/s/EJF9yowV", "alt": "Using motor class in main", "caption": "Using the Motor Class"}
  ]
}')
WHERE id = 'lesson-t-oop';

-- =====================================================
-- LESSON: RTOS (lesson-t-rtos)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "video_url": "https://www.youtube.com/watch?v=F321087yYy4&list=PLEBQazB0HUyQ4hAPU1cJED6t3DU0h34bz&index=1",
  "sections": [
    {
      "title": "Introduction to RTOS",
      "content": "A Real-Time Operating System (RTOS) allows you to run multiple tasks concurrently on a single microcontroller. FreeRTOS is the most popular RTOS for embedded systems and is integrated into the ESP32.\n\n**Key benefits:**\n- Run multiple tasks \"simultaneously\" through time-slicing\n- Prioritize critical tasks over less important ones\n- Better organize complex applications\n- Handle timing-sensitive operations reliably"
    },
    {
      "title": "Tasks",
      "content": "A task is a function that runs in its own context with its own stack. Tasks appear to run in parallel but actually share CPU time.\n\n```c\nvoid taskDisplay(void *pvParams) {\n    while (1) {\n        updateDisplay();\n        vTaskDelay(pdMS_TO_TICKS(100));  // run every 100 ms\n    }\n}\n```\n\nThe infinite loop is intentional - tasks should run forever (or until explicitly deleted)."
    },
    {
      "title": "Creating Tasks",
      "content": "Use `xTaskCreate()` to create a new task:\n\n```c\nxTaskCreate(\n    taskDisplay,       // Function to run\n    \"DisplayTask\",     // Task name\n    4096,              // Stack size (bytes)\n    NULL,              // Parameters\n    2,                 // Priority (higher = more important)\n    &displayTaskHandle // Task handle (optional)\n);\n```\n\n**Parameters explained:**\n- Stack size: Memory allocated for the task (4096 bytes is typical)\n- Priority: Higher numbers = higher priority (runs first when competing)\n- Task handle: Allows you to control the task later"
    },
    {
      "title": "Task Delays",
      "content": "Use `vTaskDelay()` instead of `delay()` to yield CPU time to other tasks:\n\n```c\nvTaskDelay(pdMS_TO_TICKS(100));  // Delay 100ms\n```\n\n`pdMS_TO_TICKS()` converts milliseconds to the RTOS tick count. During the delay, other tasks can run."
    },
    {
      "title": "Mutexes for Shared Resources",
      "content": "When multiple tasks access the same resource (like a display), use a mutex to prevent conflicts:\n\n```c\nSemaphoreHandle_t displayMutex;\n\nvoid taskDisplay(void *pvParams) {\n    while (1) {\n        if (xSemaphoreTake(displayMutex, portMAX_DELAY)) {\n            updateDisplay();\n            xSemaphoreGive(displayMutex);\n        }\n        vTaskDelay(pdMS_TO_TICKS(200));\n    }\n}\n```\n\n`xSemaphoreTake()` waits for the mutex; `xSemaphoreGive()` releases it."
    },
    {
      "title": "Multiple Tasks with Mutex",
      "content": "Multiple tasks can safely share a resource using the same mutex:\n\n```c\nSemaphoreHandle_t displayMutex;\n\nvoid taskDisplay(void *pvParams) {\n    while (1) {\n        if (xSemaphoreTake(displayMutex, portMAX_DELAY)) {\n            updateDisplay();\n            xSemaphoreGive(displayMutex);\n        }\n        vTaskDelay(pdMS_TO_TICKS(200));\n    }\n}\n\nvoid taskSensors(void *pvParams) {\n    while (1) {\n        if (xSemaphoreTake(displayMutex, portMAX_DELAY)) {\n            updateSensorData();\n            xSemaphoreGive(displayMutex);\n        }\n        vTaskDelay(pdMS_TO_TICKS(100));\n    }\n}\n```\n\nOnly one task can hold the mutex at a time, preventing race conditions."
    }
  ],
  "key_points": [
    "FreeRTOS enables concurrent task execution on ESP32",
    "Tasks run in infinite loops with vTaskDelay() for timing",
    "Higher priority tasks preempt lower priority ones",
    "Use mutexes to protect shared resources",
    "Always give back mutexes after taking them"
  ],
  "resources": [
    {"type": "video", "title": "FreeRTOS Tutorial Playlist", "url": "https://www.youtube.com/watch?v=F321087yYy4&list=PLEBQazB0HUyQ4hAPU1cJED6t3DU0h34bz&index=1"}
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/8bBvUCH6", "alt": "Basic task function", "caption": "Task Function Structure"},
    {"url": "https://www.genspark.ai/api/files/s/gxNq2fg8", "alt": "xTaskCreate example", "caption": "Creating a Task with xTaskCreate"},
    {"url": "https://www.genspark.ai/api/files/s/ytq6UNqw", "alt": "Task with mutex", "caption": "Using Mutex in a Task"},
    {"url": "https://www.genspark.ai/api/files/s/g1V2EvTm", "alt": "Multiple tasks with mutex", "caption": "Multiple Tasks Sharing a Resource"}
  ]
}')
WHERE id = 'lesson-t-rtos';

-- =====================================================
-- LESSON: Static and Volatile Keywords (lesson-t-static-volatile)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Introduction",
      "content": "The `static` and `volatile` keywords are essential in embedded C/C++ programming. They control variable lifetime, visibility, and how the compiler optimizes code.\n\n- **static**: Controls scope and persistence\n- **volatile**: Prevents compiler optimizations for hardware-related variables"
    },
    {
      "title": "Static Variables",
      "content": "A static local variable retains its value between function calls:\n\n```c\nvoid countSteps() {\n    static int steps = 0; // only initialized once\n    steps++;\n    printf(\"Steps = %d\\n\", steps);\n}\n```\n\nUnlike regular local variables, `steps` is not reset each time the function is called. The initialization happens only once, at program startup."
    },
    {
      "title": "Static Functions",
      "content": "A static function is only visible within its source file:\n\n```c\n// In sensor.c\nstatic void calibrateSensor() {\n    // Internal helper function\n}\n```\n\nThis prevents other files from calling `calibrateSensor()` directly, enforcing clean module boundaries."
    },
    {
      "title": "Volatile Variables",
      "content": "The `volatile` keyword tells the compiler that a variable may change unexpectedly (by hardware, interrupts, or another thread):\n\n```c\nvolatile bool buttonPressed = false;\n\nvoid IRAM_ATTR buttonISR() {\n    buttonPressed = true;  // changed by interrupt\n}\n\nvoid loop() {\n    if (buttonPressed) {  // compiler re-reads every loop iteration\n        Serial.println(\"Button pressed!\");\n        buttonPressed = false;\n    }\n}\n```\n\nWithout `volatile`, the compiler might optimize away the check, assuming `buttonPressed` never changes in `loop()`."
    },
    {
      "title": "Combining Static and Volatile",
      "content": "You can combine both keywords when a variable needs to persist and be accessed by interrupts:\n\n```c\nstatic volatile bool axpPressed = false;\n\nvoid IRAM_ATTR axpISR() {\n    axpPressed = true;  // modified by ISR\n}\n\nbool Power::isPressed() {\n    return axpPressed;\n}\n```\n\n- `static`: Variable persists and has file scope\n- `volatile`: Compiler does not cache the value"
    },
    {
      "title": "When to Use Each",
      "content": "**Use static when:**\n- You need a variable to persist between function calls\n- You want to limit a function or variable to file scope\n- Implementing counters, state machines, or caches\n\n**Use volatile when:**\n- Variable is modified by an ISR\n- Variable is a hardware register\n- Variable is shared between tasks (in addition to synchronization)\n\n**Common mistake:** Forgetting `volatile` for ISR-shared variables, causing the main code to use a cached value."
    }
  ],
  "key_points": [
    "static local variables persist between function calls",
    "static functions/variables are limited to file scope",
    "volatile prevents compiler from caching variable values",
    "Use volatile for any variable modified by ISRs",
    "Combine static volatile for persistent ISR-shared variables"
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/bZSd5ecR", "alt": "Static variable example", "caption": "Static Variable Persists Between Calls"},
    {"url": "https://www.genspark.ai/api/files/s/LtJn6Qoc", "alt": "Volatile with ISR", "caption": "Volatile Variable for ISR Communication"},
    {"url": "https://www.genspark.ai/api/files/s/WPGSr9km", "alt": "Static volatile combined", "caption": "Combining Static and Volatile"}
  ]
}')
WHERE id = 'lesson-t-static-volatile';

-- =====================================================
-- LESSON: Timing and Scheduling (lesson-t-timing)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Introduction to Timing",
      "content": "Proper timing is critical in embedded systems. Whether updating a display, sampling sensors, or handling user input, you need to control when and how often code executes.\n\n**Approaches to timing:**\n1. Blocking delays (simple but wasteful)\n2. Non-blocking timing with millis()\n3. RTOS task scheduling\n4. Hardware timers"
    },
    {
      "title": "Blocking Delays",
      "content": "The simplest approach uses `delay()`, but it blocks all other code:\n\n```c\nvoid setup() {\n    pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n    digitalWrite(LED_BUILTIN, HIGH);\n    delay(500);              // wait 500 ms (blocking)\n    digitalWrite(LED_BUILTIN, LOW);\n    delay(500);\n}\n```\n\n**Problem:** During `delay()`, the CPU does nothing - it cannot respond to buttons, read sensors, or update the display."
    },
    {
      "title": "Non-Blocking Timing",
      "content": "Use `millis()` to track elapsed time without blocking:\n\n```c\nunsigned long lastUpdate = 0;\nunsigned long interval = 200; // ms\n\nvoid loop() {\n    if (millis() - lastUpdate >= interval) {\n        lastUpdate = millis();\n        updateScreen();\n    }\n}\n```\n\nThis pattern allows multiple timed actions to run concurrently in the main loop."
    },
    {
      "title": "RTOS Task Delays",
      "content": "With FreeRTOS, use `vTaskDelay()` which yields to other tasks:\n\n```c\nvoid TaskDisplay(void *pvParameters) {\n    while(true) {\n        updateScreen();\n        vTaskDelay(pdMS_TO_TICKS(200));\n    }\n}\n```\n\nUnlike `delay()`, `vTaskDelay()` allows other RTOS tasks to run during the wait period."
    },
    {
      "title": "Hardware Timers",
      "content": "For precise timing, use hardware timer interrupts:\n\n```c\nhw_timer_t *timer = nullptr;\n\nvoid IRAM_ATTR onTimer() {\n    // extremely fast periodic action\n}\n\nvoid setup() {\n    timer = timerBegin(0, 80, true);  // 1 MHz\n    timerAttachInterrupt(timer, &onTimer, true);\n    timerAlarmWrite(timer, 1000, true);  // 1 kHz\n    timerAlarmEnable(timer);\n}\n```\n\nHardware timers are useful for:\n- PWM generation\n- Precise sampling intervals\n- Watchdog functionality"
    },
    {
      "title": "Debouncing",
      "content": "When reading physical buttons, add debounce logic to ignore noise:\n\n```c\nif (millis() - lastTouchTime > 50) {\n    handleTouch();\n}\n```\n\nThis ensures at least 50ms between touch events, filtering out electrical noise and bouncing."
    }
  ],
  "key_points": [
    "Avoid blocking delays when possible",
    "Use millis() for non-blocking timing in simple applications",
    "Use vTaskDelay() in RTOS applications to yield CPU time",
    "Hardware timers provide microsecond-level precision",
    "Always debounce physical input with timing checks"
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/sSz0ELmR", "alt": "Blocking delay example", "caption": "Blocking Delay - Simple but Inefficient"},
    {"url": "https://www.genspark.ai/api/files/s/v99hf3ba", "alt": "Non-blocking timing", "caption": "Non-Blocking Timing with millis()"},
    {"url": "https://www.genspark.ai/api/files/s/VA2HFoaq", "alt": "RTOS task delay", "caption": "RTOS Task Delay with vTaskDelay()"},
    {"url": "https://www.genspark.ai/api/files/s/JLVou8yj", "alt": "Hardware timer example", "caption": "Hardware Timer Interrupt"},
    {"url": "https://www.genspark.ai/api/files/s/ibDfOADR", "alt": "Debounce timing", "caption": "Debouncing Touch Input"}
  ]
}')
WHERE id = 'lesson-t-timing';

-- =====================================================
-- LESSON: FSM (lesson-t-fsm)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Introduction to Finite State Machines",
      "content": "A Finite State Machine (FSM) is a design pattern that organizes code around distinct states and transitions. It is ideal for:\n\n- Screen navigation in GUIs\n- Protocol handling\n- Game logic\n- Device modes (sleep, active, error)\n\nInstead of complex nested if-else statements, FSMs make logic clear and maintainable."
    },
    {
      "title": "FSM Components",
      "content": "An FSM has three main components:\n\n1. **States**: The different modes your system can be in\n2. **Transitions**: Rules for moving between states\n3. **Actions**: Code that runs in each state or during transitions\n\nFor a smartwatch, states might be: Home, Stopwatch, Settings, etc."
    },
    {
      "title": "Implementing an FSM",
      "content": "Use an enum to define states and a switch statement to handle each:\n\n```c\nenum ScreenState {\n    SCREEN_HOME,\n    SCREEN_STOPWATCH,\n    SCREEN_SETTINGS\n};\n\nScreenState currentScreen = SCREEN_HOME;\n\nvoid loop() {\n    switch (currentScreen) {\n        case SCREEN_HOME:\n            displayHome();\n            if (buttonPressed) currentScreen = SCREEN_STOPWATCH;\n            break;\n            \n        case SCREEN_STOPWATCH:\n            displayStopwatch();\n            if (buttonPressed) currentScreen = SCREEN_SETTINGS;\n            break;\n            \n        case SCREEN_SETTINGS:\n            displaySettings();\n            if (buttonPressed) currentScreen = SCREEN_HOME;\n            break;\n    }\n}\n```"
    },
    {
      "title": "Benefits of FSM Design",
      "content": "**Clarity**: Each state has its own code block\n**Extensibility**: Adding a new state is straightforward\n**Debugging**: Easy to trace which state caused an issue\n**Testing**: Each state can be tested independently\n\nFSMs are especially useful when your application has many modes or screens that need to interact in predictable ways."
    },
    {
      "title": "State Transitions",
      "content": "Transitions should be explicit and predictable. Common triggers include:\n\n- Button presses\n- Timer events\n- Sensor readings\n- External commands\n\nAlways handle unexpected states gracefully, either by returning to a default state or logging an error."
    }
  ],
  "key_points": [
    "FSMs organize code into discrete states with clear transitions",
    "Use enums to define states for type safety",
    "Switch statements handle state-specific logic",
    "FSMs improve code clarity and maintainability",
    "Great for screen navigation, protocols, and mode management"
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/3OL8Yt1d", "alt": "FSM implementation with switch statement", "caption": "FSM Implementation for Screen Navigation"}
  ]
}')
WHERE id = 'lesson-t-fsm';

-- =====================================================
-- LESSON: Networking and WiFi (lesson-t-networking)
-- =====================================================
UPDATE lessons SET content_json = json('{
  "sections": [
    {
      "title": "Introduction to WiFi on ESP32",
      "content": "The ESP32 includes built-in WiFi, enabling your smartwatch to:\n\n- Sync time from NTP servers\n- Send data to cloud services\n- Receive updates and notifications\n- Communicate with other devices\n\nThe Arduino WiFi library makes it easy to connect to networks and make HTTP requests."
    },
    {
      "title": "Connecting to WiFi",
      "content": "Basic WiFi connection code:\n\n```c\n#include <WiFi.h>\n\nconst char* ssid = \"MyNetwork\";\nconst char* password = \"MyPassword\";\n\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.begin(ssid, password);\n    \n    Serial.print(\"Connecting to Wi-Fi\");\n    while (WiFi.status() != WL_CONNECTED) {\n        delay(500);\n        Serial.print(\".\");\n    }\n    Serial.println(\"\\nConnected!\");\n    Serial.println(WiFi.localIP());  // Prints assigned IP address\n}\n```\n\nThe loop waits until the connection is established before proceeding."
    },
    {
      "title": "WiFi Status Checking",
      "content": "Always check WiFi status before making network requests:\n\n```c\nif (WiFi.status() == WL_CONNECTED) {\n    // Safe to make network requests\n} else {\n    // Handle disconnection\n}\n```\n\nCommon status values:\n- `WL_CONNECTED`: Successfully connected\n- `WL_DISCONNECTED`: Not connected\n- `WL_CONNECT_FAILED`: Connection attempt failed\n- `WL_NO_SSID_AVAIL`: Network not found"
    },
    {
      "title": "NTP Time Synchronization",
      "content": "Use WiFi to sync time from NTP (Network Time Protocol) servers:\n\n```c\nMyWifi wifi(\"MyHotspot\", \"12345678\");\nstruct tm ntpTime;\n\nvoid setup()\n{\n    wifi.connect();\n    if (wifi.isConnected())\n    {\n        syncTimeWithNTP();\n        getLocalTime(&ntpTime);\n        pcf8563_set_time(&ntpTime);\n    }\n}\n```\n\nThis pattern:\n1. Connects to WiFi\n2. Syncs time from NTP server\n3. Stores the time in the hardware RTC\n\nThe RTC then keeps accurate time even when WiFi is off."
    },
    {
      "title": "Power Considerations",
      "content": "WiFi uses significant power. For battery-powered devices:\n\n- Only enable WiFi when needed\n- Use `WiFi.disconnect()` and `WiFi.mode(WIFI_OFF)` when done\n- Consider periodic sync rather than constant connection\n- Use light sleep mode between network operations"
    }
  ],
  "key_points": [
    "ESP32 has built-in WiFi for network connectivity",
    "Always check WiFi.status() before network operations",
    "Use NTP to sync time from internet servers",
    "Store synced time in RTC for offline timekeeping",
    "Disable WiFi when not needed to save power"
  ],
  "images": [
    {"url": "https://www.genspark.ai/api/files/s/52YAFb3q", "alt": "WiFi connection code", "caption": "Basic WiFi Connection"},
    {"url": "https://www.genspark.ai/api/files/s/S6mWhW98", "alt": "NTP time sync example", "caption": "NTP Time Synchronization"}
  ]
}')
WHERE id = 'lesson-t-networking';
