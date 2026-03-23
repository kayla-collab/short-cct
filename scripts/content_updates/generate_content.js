#!/usr/bin/env node
/**
 * Comprehensive content update for Smartwatch course
 * This script generates SQL statements for all lessons with full verbatim content
 */

const { execSync } = require('child_process');

// Helper function to escape SQL strings
function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

// Helper to run SQL command
function runSQL(sql) {
  const escaped = sql.replace(/"/g, '\\"').replace(/\n/g, ' ');
  try {
    execSync(`cd /home/user/webapp && npx wrangler d1 execute shortcircuits-db --remote --command="${escaped}"`, {
      stdio: 'inherit',
      timeout: 60000
    });
    return true;
  } catch (e) {
    console.error('SQL Error:', e.message);
    return false;
  }
}

// Define all lesson content
const lessons = {
  // Introduction/Overview - combines with existing lesson-t-overview
  'lesson-t-overview': {
    title: 'Complete Project Overview',
    content: [
      {"type":"header","content":"Overview"},
      {"type":"text","content":"In this program you will design and implement a fully functioning smartwatch by combining low level driver development, embedded systems programming, and system-level integration."},
      {"type":"text","content":"You will work on the LilyGo T-Watch 2020 V3, a real commercial smartwatch platform, and write production-style firmware entirely in C and C++: the same languages used in industry for resource-constrained embedded systems"},
      {"type":"bullets","content":["C is used for low-level hardware control and communication","C++ enables modular design, abstraction, and higher-level application logic"]},
      {"type":"text","content":"Throughout the program you will build your system incrementally using provided training materials, reference implementations, and targeted code examples. These resources are designed to support you without removing the need for engineering decision making."},
      {"type":"text","content":"If you need help, email support@shortcct.com with your specific questions and a zip file including your project directory. Remember, virtual support is available for 3 months after your product delivery date."},
      {"type":"youtube","content":"https://www.youtube.com/watch?v=52L8VP05elU"}
    ]
  },

  'lesson-sw-background': {
    title: 'Recommended Background',
    content: [
      {"type":"text","content":"This projects is designed for students who want hands-on embedded firmware experience. You do not need a lot of experience, but some foundational knowledge is expected."},
      {"type":"subheader","content":"Required"},
      {"type":"bullets","content":["Introductory programming experience in C or C++","Comfort with basic programming concepts such as functions, control flow, arrays, and structs"]},
      {"type":"subheader","content":"Helpful"},
      {"type":"bullets","content":["Introductory exposure to embedded systems","Introductory electronics knowledge"]},
      {"type":"text","content":"If you find that you are missing some of this background, reach out to us at support@shortcct.com and we can explore options to get you up to speed!"}
    ]
  },

  'lesson-sw-industry': {
    title: 'Industry Alignment',
    content: [
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
    ]
  },

  'lesson-sw-setup': {
    title: 'Set Up Smartwatch',
    content: [
      {"type":"text","content":"To set up Platform IO, this video by DroneBot Workshop is a great resource. It includes installation steps for Linux, MacOS, and Windows. You can download the latest versions of Python and Visual Studio Code"},
      {"type":"text","content":"Once you have downloaded PlatformIO on your system, watch the following video to set up your environment for our project"},
      {"type":"text","content":"The following video shows you how to clone our github repository, short-circuit-projects/smartwatch, to VSCode. This tutorial is done on Windows, so it will look different on Linux or MacOS."},
      {"type":"video_placeholder","content":"Add the video labeled Smartwatch Setup Tutorial here"}
    ]
  },

  'lesson-t-modular': {
    title: 'Modular Architecture',
    content: [
      {"type":"text","content":"In professional embedded systems, firmware is rarely written as a single file. Instead, it is structured to be modular, maintainable, and scalable so that systems can grow, be debugged efficiently, and be worked on my multiple engineers"},
      {"type":"text","content":"We organize code into clear layers and clean file boundaries. This makes each component independent and easier to debug, extend, or replace. In PlatformIO it is recommended that you use the /include and /src for your header (.h) and source (.c/.cpp) files respectively"}
    ]
  },

  'lesson-t-files': {
    title: 'File Structure: Headers and Source Files',
    content: [
      {"type":"text","content":"In C and C++ projects, header files define the interface, while source files implement the functionality. This separation allows different parts of the program to interact through well-defined boundaries."},
      {"type":"text","content":"Header files contain declarations, not executable code. Their purpose is to describe what a module provides, not how it works. Other files include a header file to understand how to use the functions, data types, or classes defined by that module."},
      {"type":"text","content":"A typical header file includes function prototypes for functions implemented elsewhere, constant definitions, and data type declarations such as struct, enum, or typedef. In C++ projects, header files may also contain class declarations that define the public interface of a class without exposing its internal implementation details."},
      {"type":"label","content":"Header File (accel.h)"},
      {"type":"text","content":"C source files contain the actual implementations of the functions and logic declared in their corresponding header files. This is where executable code lives and where the behavior of a module is defined."},
      {"type":"text","content":"These files typically include function definitions, internal helper functions, and low-level hardware or driver logic. Helper functions are often marked as static to limit their visibility to the file itself, helping enforce clean module boundaries and prevent unintended use elsewhere in the codebase."},
      {"type":"label","content":"C Source File (accel.c)"},
      {"type":"text","content":"C++ source files serve the same purpose as .c files but are used when the project relies on C++ features such as classes, objects, and encapsulation. They contain implementations of class methods and support object-oriented design patterns that improve code organization and reuse. In embedded systems, .cpp files are commonly used when interacting with C++ based libraries such as Arduino or FreeRTOS, or when structuring more complex application logic."},
      {"type":"text","content":"While the underlying principles remain the same, C++ enables more expressive abstractions on top of low-level embedded functionality."},
      {"type":"label","content":"C++ Source File (accel.cpp)"}
    ]
  },

  'lesson-t-layers': {
    title: 'Project Layers',
    content: [
      {"type":"text","content":"Well-structured embedded firmware is typically organized into logical layers, where each layer has a clearly defined responsibility. This layered approach improves modularity, simplifies debugging, and allows systems to scale without becoming difficult to maintain. A clean project may include up to five conceptual layers. Not every project will implement all five explicitly, but understanding the role of each layer is fundamental to writing professional embedded firmware."},
      {"type":"subheader","content":"Layer 1: Hardware"},
      {"type":"text","content":"This layer consists of the physical electronics themselves, including microcontrollers, sensors, displays, and power components. No software exists at this level. All higher layers ultimately interact with the hardware, either directly or indirectly."},
      {"type":"subheader","content":"Layer 2: Hardware Abstraction Layer (HAL)"},
      {"type":"text","content":"The Hardware Abstraction Layer is the lowest level of software that interacts directly with the hardware. Its purpose is to provide readable and reusable APIs that abstract away hardware registers and low-level details. By isolating register access and device-specific behavior within the HAL, the rest of the system can interact with hardware in a safer and more portable way."},
      {"type":"subheader","content":"Layer 3: Operating System / Middleware / Service Layer"},
      {"type":"text","content":"This layer sits above the hardware drivers and provides reusable software services. It combines low-level drivers into higher-level capabilities such as task scheduling, timing services, communication stacks, or sensor management. In systems that use an RTOS, this layer often includes OS services and middleware components that support concurrency and inter-task communication."},
      {"type":"subheader","content":"Layer 4: Application Logic Layer"},
      {"type":"text","content":"The application logic layer defines the behavior of the device. It manages system states, decision-making, and interactions between components. This layer acts as the brain of the system, implementing the products functionality without being tied to specific hardware details."},
      {"type":"subheader","content":"Layer 5: Application Interface Layer"},
      {"type":"text","content":"The application interface layer is the topmost layer and is responsible for presenting information to the user or exposing APIs to other systems. This may include user interfaces, display logic, input handling, or external communication interfaces."}
    ]
  }
};

// Output lessons as JSON for file-based execution
console.log(JSON.stringify(lessons, null, 2));
