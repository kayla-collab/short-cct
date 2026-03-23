#!/usr/bin/env python3
"""
Update Ball & Beam course lessons in the D1 database.
"""

import subprocess
import json

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
# BALL & BEAM OVERVIEW MODULE
# ============================================

# bb-lesson-intro: Introduction
lessons.append({
    "id": "bb-lesson-intro",
    "description": "Learn what you will build in the Ball and Beam Control System program.",
    "content_json": [
        {"type":"text","content":"In this program you will model and create a robust ball and beam controller by creating an engineering model, designing control loop architecture, and deploying code on a real control system."},
        {"type":"text","content":"You'll work with a collection of 3D printed parts, electronics, and a wooden platform originally developed by Ian Carey. This project will help you develop an understanding of control theory, physics, and software written in Python and C++. It includes a combination of model-based design and hands-on testing which are techniques used in industry for designing and deploying control systems."},
        {"type":"text","content":"Throughout the program you'll build your project incrementally using provided training materials, reference implementations, and various examples. These resources are designed to support you without removing the need for engineering decision making."},
        {"type":"text","content":"If you need help, email support@shortcct.com with your specific questions and a zip file including any files relevant to your project. Remember, virtual support is available for 3 months after your product delivery date."}
    ]
})

# bb-lesson-background: Recommended Background
lessons.append({
    "id": "bb-lesson-background",
    "description": "Understand the recommended background knowledge for this project.",
    "content_json": [
        {"type":"text","content":"This project is designed for students who want hands-on control and embedded systems experience. You do not need a lot of experience, but some foundational knowledge is expected."},
        {"type":"subheading","content":"Required"},
        {"type":"bullets","content":["Introductory programming experience in C++ or Python","Basic knowledge of electronics"]},
        {"type":"subheading","content":"Helpful"},
        {"type":"bullets","content":["Introductory exposure to embedded systems","Basic understanding of physics and signal theory"]},
        {"type":"text","content":"If you find that you are missing some of this background, reach out to us at support@shortcct.com and we can explore options to get you up to speed!"}
    ]
})

# bb-lesson-industry: Industry Alignment
lessons.append({
    "id": "bb-lesson-industry",
    "description": "See how this project aligns with industry skills.",
    "content_json": [
        {"type":"text","content":"We analyzed the most in-demand skills across 50+ companies hiring embedded systems engineering interns. Below is how the Ball and Beam Project aligns with those skills."},
        {"type":"text","content":"Core skills are fully covered in the base project."},
        {"type":"text","content":"Extendable skills can be developed through optional project extensions and the design challenge."},
        {"type":"text","content":"Not Covered indicates skills that are outside the scope of the core project."},
        {"type":"callout","content":"Industry Alignment Table Coming Soon"},
        {"type":"subheading","content":"Documentation"},
        {"type":"bullets","content":["Control Stepper Motor with DRV8825 Driver Module & Arduino - Last Minute Engineers","How HC-SR04 Ultrasonic Sensor Works & Interface It With Arduino - Last Minute Engineers","Control Tutorials for MATLAB and Simulink - Ball & Beam: System Modeling"]}
    ]
})

# ============================================
# BALL & BEAM TRAINING MATERIALS MODULE
# ============================================

# bb-lesson-t-overview: Complete Project Overview
lessons.append({
    "id": "bb-lesson-t-overview",
    "description": "Watch the complete project overview video.",
    "content_json": [
        {"type":"subheading","content":"Complete Project Overview"},
        {"type":"callout","content":"Overview Video Coming Soon"},
        {"type":"text","content":"This video will provide a comprehensive overview of the entire Ball and Beam project."}
    ]
})

# bb-lesson-t-embedded: Basic Embedded Systems
lessons.append({
    "id": "bb-lesson-t-embedded",
    "description": "Learn the fundamentals of embedded systems for control applications.",
    "content_json": [
        {"type":"text","content":"The Ball and Beam system operates as a real-time embedded control system in which a microcontroller continuously reads the position of the ball, computes a corrective action, and commands a motor to adjust the beam angle. Unlike traditional desktop programs that run once and terminate, embedded systems execute in a continuous loop."},
        {"type":"text","content":"In the Arduino environment, every program is organized around two core functions: setup() and loop(). The setup() function runs once at startup and is used to initialize hardware components such as input/output pins, serial communication, sensors, and motor drivers. The loop() function runs repeatedly and forms the core control cycle of the system."},
        {"type":"text","content":"Within this loop, the microcontroller repeatedly performs three essential steps: measure the ball's position, calculate the control output, and update the actuator."},
        {"type":"text","content":"To interface with hardware, pins must be properly configured as inputs or outputs using pinMode(). Sensors such as potentiometers or distance sensors are typically read using analogRead(), which converts a voltage signal into a digital value using the microcontroller's internal analog-to-digital converter. Actuators such as motors are controlled using digital signals or Pulse Width Modulation (PWM). PWM allows the microcontroller to simulate an analog output by rapidly switching a pin on and off with a controllable duty cycle."},
        {"type":"text","content":"Timing is a critical component of any control system. The control loop must run at consistent intervals to ensure stable and predictable behavior. Instead of using blocking delays that pause execution, embedded systems should rely on non-blocking timing methods such as millis() to maintain a steady loop frequency."},
        {"type":"text","content":"Libraries are commonly used to simplify interaction with hardware components like ultrasonic sensors, servo motors, or communication modules. While these libraries abstract lower-level details, it is important to understand that they are configuring timers, managing communication protocols such as I2C or SPI, and handling signal timing behind the scenes."},
        {"type":"text","content":"Serial communication is an essential debugging tool in embedded development. By printing sensor values, control signals, and tuning parameters to the Serial Monitor, students can observe system behavior in real time and diagnose issues systematically."},
        {"type":"text","content":"By mastering these embedded fundamentals - program structure, hardware interfacing, PWM control, real-time timing, library usage, and serial debugging - students develop the foundation necessary to implement stable feedback control in the Ball and Beam system."}
    ]
})

# bb-lesson-t-circuits: Circuit Creation and Breadboarding
lessons.append({
    "id": "bb-lesson-t-circuits",
    "description": "Learn to translate circuit schematics into physical breadboard implementations.",
    "content_json": [
        {"type":"text","content":"Before the Ball and Beam system can be controlled in software, the hardware must be assembled correctly and safely. This section focuses on translating a circuit schematic into a physical breadboard implementation while understanding why each connection exists."},
        {"type":"text","content":"Every embedded circuit begins with power distribution. The microcontroller typically operates at 5V or 3.3V, and all sensors and logic components must share a common ground reference. On a breadboard, this means connecting the microcontroller's GND to the ground rail and distributing VCC to the positive rail."},
        {"type":"text","content":"The Ball and Beam system typically consists of three core hardware blocks: the microcontroller, the position sensor, and the motor driver. The position sensor provides a voltage or digital signal representing the ball's location. This signal is routed to an analog or digital input pin on the microcontroller."},
        {"type":"text","content":"The motor cannot be driven directly from a microcontroller pin because microcontroller pins can only source a small amount of current. Instead, a motor driver or transistor-based switching circuit must be used. The motor driver acts as a power interface, allowing the low-power logic signal to control a higher-power actuator safely."},
        {"type":"text","content":"When placing components on a breadboard, students should follow structured wiring practices. Keep power and ground rails organized. Use consistent wire colors (e.g., red for VCC, black for GND). Keep signal wires short to reduce noise. Avoid crossing wires unnecessarily."},
        {"type":"text","content":"Decoupling capacitors are also an important practical consideration. Placing small capacitors (e.g., 0.1 uF) across power and ground near sensitive components helps filter voltage spikes and noise caused by motors switching on and off."},
        {"type":"text","content":"Students should verify their circuit incrementally. First confirm that power rails supply the correct voltage using a multimeter. Next test the sensor independently by printing readings to the Serial Monitor. Then test motor actuation with a simple fixed PWM signal before integrating the full control algorithm."}
    ]
})

# bb-lesson-t-motors: Motors and Motor Controllers
lessons.append({
    "id": "bb-lesson-t-motors",
    "description": "Understand motor operation and motor driver circuits.",
    "content_json": [
        {"type":"text","content":"The Ball and Beam system relies on a motor to adjust the angle of the beam in response to the ball's position. Understanding how motors work - and how to control them safely - is essential for building a stable and reliable control system."},
        {"type":"text","content":"At a basic level, a motor converts electrical energy into mechanical motion. In this project, the motor's job is to rotate a shaft that tilts the beam. Depending on the design, this may be a DC motor, a servo motor, or a stepper motor."},
        {"type":"bullets","content":["A standard DC motor spins continuously when voltage is applied and requires external circuitry to control speed and direction.","A servo motor contains internal control electronics and moves to a commanded position based on a PWM control signal.","A stepper motor moves in discrete angular steps and is commonly used when precise positioning is required."]},
        {"type":"text","content":"Microcontrollers cannot power motors directly because motors require significantly more current than a microcontroller pin can provide. Instead, a motor controller - also called a motor driver - is used as an interface between the low-power logic signals and the higher-power motor supply."},
        {"type":"text","content":"For DC motors, an H-bridge driver is commonly used. An H-bridge allows both speed control and direction control by switching current flow through the motor in either direction. Speed is typically controlled using PWM."},
        {"type":"text","content":"For servo motors, control is typically simpler. A servo uses a single PWM control line where the pulse width determines the angular position."},
        {"type":"text","content":"For stepper motors, a stepper driver module generates the required coil switching sequences. The microcontroller typically sends step and direction signals to the driver."},
        {"type":"text","content":"Power management is critical when working with motors. Motors can draw large currents, especially during startup or stall conditions. A separate power supply is often required for the motor, and all grounds must be connected together to maintain a common reference."},
        {"type":"text","content":"When integrating the motor into the Ball and Beam system, it is important to test motor behavior independently before implementing feedback control. Start with fixed PWM signals or fixed position commands. Observe how the beam responds."}
    ]
})

# bb-lesson-t-sensing: Distance Sensing
lessons.append({
    "id": "bb-lesson-t-sensing",
    "description": "Learn about distance sensors and position measurement techniques.",
    "content_json": [
        {"type":"text","content":"Accurate position measurement is the foundation of the Ball and Beam control system. The motor adjusts the beam angle, but the system can only stabilize the ball if it knows where the ball is at all times. Distance sensing provides the feedback signal that makes closed-loop control possible."},
        {"type":"text","content":"In this project, the sensor measures the ball's position along the length of the beam. Depending on the hardware design, this may be accomplished using an ultrasonic sensor, an infrared (IR) distance sensor, or a linear potentiometer mechanism."},
        {"type":"text","content":"An ultrasonic sensor works by emitting a short pulse of sound and measuring the time it takes for the echo to return after reflecting off the ball. Because the speed of sound is known, the time-of-flight measurement can be converted into distance. These sensors typically use a trigger pin and an echo pin."},
        {"type":"text","content":"Infrared distance sensors operate differently. They emit infrared light and measure the intensity or angle of the reflected signal. These sensors usually provide an analog voltage output that varies with distance. The microcontroller reads this voltage using analogRead() and converts the raw value into a physical distance measurement using calibration data."},
        {"type":"text","content":"Regardless of the sensing method, raw measurements are rarely perfect. Sensor readings may contain noise, small fluctuations, or occasional outliers. Electrical noise from the motor, mechanical vibrations, and environmental conditions can all affect measurement quality. For this reason, filtering techniques - such as moving averages or exponential smoothing - are often applied to stabilize the signal before it is used in the control algorithm."},
        {"type":"text","content":"Calibration is another critical step. The raw sensor output must be mapped to actual physical distances along the beam. This often involves placing the ball at known positions, recording sensor readings, and generating a conversion equation or lookup table."},
        {"type":"text","content":"Sampling rate is also important. The sensor must be read at consistent intervals within the main control loop. If readings are taken too slowly, the system becomes sluggish and unstable. If readings are too fast without proper filtering, noise may dominate the signal."},
        {"type":"text","content":"In a closed-loop control system like Ball and Beam, the sensor is just as important as the motor. A powerful actuator cannot compensate for poor measurements."}
    ]
})

# bb-lesson-t-filtering: Filtering Techniques
lessons.append({
    "id": "bb-lesson-t-filtering",
    "description": "Learn filtering techniques to improve sensor measurements.",
    "content_json": [
        {"type":"text","content":"Filtering is a fundamental requirement in real-world control systems because sensors do not operate under ideal conditions. They introduce noise, measurement jitter, dropouts, and occasional spikes."},
        {"type":"text","content":"In the Ball and Beam system, the HC-SR04 ultrasonic sensor is particularly susceptible to these issues. Its readings can fluctuate due to surface reflections, beam angle variation, vibration, and electrical noise generated by the motor."},
        {"type":"text","content":"The derivative term of a PID controller is especially sensitive to noise because it estimates how fast the ball is moving based on changes in position. Since the derivative is based on rate of change, even small measurement spikes can produce large derivative outputs, effectively amplifying noise and causing aggressive, unstable motor corrections."},
        {"type":"subheading","content":"Exponential Moving Average (EMA) Filter"},
        {"type":"text","content":"One of the most practical filtering techniques for embedded systems is the Exponential Moving Average (EMA) filter. The EMA is a first-order low-pass, infinite impulse response (IIR) filter. It is called 'infinite impulse response' because each output depends on both the current measurement and the previous filtered output."},
        {"type":"text","content":"The EMA is defined by the equation: y_k = alpha * x_k + (1 - alpha) * y_{k-1}, where x_k is the new measurement, y_k is the filtered output, y_{k-1} is the previous filtered output, and alpha is a constant between 0 and 1."},
        {"type":"text","content":"When alpha is small, the filter heavily smooths the signal and reduces noise but responds more slowly to real changes. When alpha is large, the filter responds quickly but provides less smoothing."},
        {"type":"subheading","content":"Kalman Filter"},
        {"type":"text","content":"A more advanced filtering approach is the Kalman filter. The Kalman filter is an optimal recursive estimation algorithm used to estimate the state of a linear system from noisy and incomplete measurements."},
        {"type":"text","content":"It works in two steps: prediction, where the system's next state is estimated based on previous behavior, and correction, where that prediction is adjusted using the new measurement."},
        {"type":"text","content":"In practice, the EMA filter is recommended as a starting point due to its simplicity and effectiveness. The Kalman filter can be introduced later for improved estimation performance."}
    ]
})

# bb-lesson-t-pid: PID Control
lessons.append({
    "id": "bb-lesson-t-pid",
    "description": "Understand PID control theory and manual tuning techniques.",
    "content_json": [
        {"type":"text","content":"This section focuses on building an intuitive understanding of PID control - what each term does, how it affects system behavior, and how to tune the gains manually."},
        {"type":"text","content":"In the Ball and Beam system, PID control is used to stabilize the ball at a desired position by adjusting the beam angle through the motor. Rather than treating PID as a formula to memorize, the goal is to understand how each component influences motion and stability."},
        {"type":"text","content":"A PID controller operates within a closed-loop feedback system. The sensor measures the ball's position (the process variable) and sends that measurement to the controller. The controller compares this measured value to the desired position (the setpoint) and computes the error, which is simply the difference between the two."},
        {"type":"subheading","content":"The Three Components"},
        {"type":"text","content":"The PID controller consists of three components: proportional, integral, and derivative control."},
        {"type":"text","content":"The proportional term reacts to the present error. If the ball is far from the center, the proportional term generates a large corrective action. Increasing the proportional gain (Kp) makes the system respond more aggressively. However, too much proportional gain can cause oscillation or instability."},
        {"type":"text","content":"The integral term reacts to accumulated past error. If the ball settles slightly off-center and stays there, the integral term slowly builds up and pushes the system toward eliminating steady-state error. Increasing the integral gain (Ki) improves long-term accuracy but can introduce overshoot."},
        {"type":"text","content":"The derivative term reacts to the rate of change of the error. It predicts future behavior by observing how quickly the ball is moving. If the ball is moving rapidly toward the setpoint, the derivative term reduces the control effort to prevent overshoot. Increasing the derivative gain (Kd) improves damping and reduces oscillations."},
        {"type":"subheading","content":"Key Terms"},
        {"type":"bullets","content":["Process variable: the measured quantity being controlled (ball position)","Setpoint: the desired value (typically center of beam)","Error: difference between setpoint and measured position","Actuator: the device that influences the system (motor/servo)","Control signal: the output of the PID controller"]},
        {"type":"subheading","content":"Manual Tuning"},
        {"type":"text","content":"A common approach is to begin with Ki and Kd set to zero and increase Kp until the system responds quickly but begins to oscillate slightly. Then, introduce derivative gain to reduce oscillation and improve damping. Finally, add a small amount of integral gain to eliminate steady-state error."},
        {"type":"text","content":"PID controllers capture the present through proportional action, the past through integration, and anticipate the future through differentiation."}
    ]
})

# ============================================
# BALL & BEAM CONTROLLER IMPLEMENTATION MODULE
# ============================================

# bb-lesson-task1: Task 1: Implement the Real-Time Control Loop
lessons.append({
    "id": "bb-lesson-task1",
    "description": "Configure a fixed-interval control loop that runs deterministically.",
    "content_json": [
        {"type":"text","content":"In this module, you will bring the Ball and Beam system to life by integrating sensing, filtering, and actuation into a complete closed-loop PID controller. By the end of this module, the system should stabilize the ball at a desired setpoint and recover from small disturbances."},
        {"type":"subheading","content":"Task 1: Implement the Real-Time Control Loop"},
        {"type":"text","content":"Configure a fixed-interval control loop that runs deterministically. The loop should execute at a consistent sampling rate (for example, every 10 ms). All sensing, PID computation, and actuator updates must occur inside this timed loop."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Use a non-blocking timing method (such as millis() or a hardware timer) to maintain a constant loop interval","Store the loop interval in seconds for proper integral and derivative calculation","Ensure that sensor readings are filtered before entering the PID equation","Print loop timing and position values to Serial during early testing"]}
    ]
})

# bb-lesson-task2: Task 2: Implement the PID Algorithm
lessons.append({
    "id": "bb-lesson-task2",
    "description": "Write the PID controller logic using proportional, integral, and derivative terms.",
    "content_json": [
        {"type":"subheading","content":"Task 2: Implement the PID Algorithm"},
        {"type":"text","content":"Write the PID controller logic using proportional, integral, and derivative terms. The controller should compute the control output based on the error between the setpoint and measured ball position."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Define global variables for Kp, Ki, and Kd","Compute error as setpoint minus measured position","Accumulate the integral term using error multiplied by dt","Compute the derivative term using the change in error divided by dt","Store the previous error for the next iteration","Constrain the control output to safe actuator limits","Implement integral windup protection by clamping the integral term"]}
    ]
})

# bb-lesson-task3: Task 3: Integrate the Motor Driver
lessons.append({
    "id": "bb-lesson-task3",
    "description": "Convert the PID output into a valid actuator command.",
    "content_json": [
        {"type":"subheading","content":"Task 3: Integrate the Motor Driver"},
        {"type":"text","content":"Convert the PID output into a valid actuator command that safely drives the motor or servo controlling the beam."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Map the PID output to a PWM value or servo angle","Respect mechanical angle limits of the beam","Ensure smooth transitions when switching motor direction","Test actuator response independently before running full PID control","Add safety constraints to prevent sustained maximum output"]}
    ]
})

# bb-lesson-task4: Task 4: Tune the Controller
lessons.append({
    "id": "bb-lesson-task4",
    "description": "Tune the PID gains manually to achieve stable and responsive behavior.",
    "content_json": [
        {"type":"subheading","content":"Task 4: Tune the Controller"},
        {"type":"text","content":"Tune the PID gains manually to achieve stable and responsive behavior."},
        {"type":"subheading","content":"Implementation Guidance"},
        {"type":"bullets","content":["Begin with Ki and Kd set to zero","Increase Kp gradually until the system begins to oscillate","Introduce Kd to reduce oscillation and improve damping","Add a small Ki to eliminate steady-state error","Change one gain at a time and observe system response","Record final gain values and performance observations"]}
    ]
})

# bb-lesson-demo: Controller Implementation Demo
lessons.append({
    "id": "bb-lesson-demo",
    "description": "Submit your controller implementation demonstration video.",
    "content_json": [
        {"type":"subheading","content":"Controller Implementation Demo Video"},
        {"type":"text","content":"Record and submit a video demonstrating your complete Ball and Beam controller. Show the system stabilizing the ball at the setpoint and recovering from disturbances."},
        {"type":"subheading","content":"Deliverables and File Structure"},
        {"type":"text","content":"All code for this module must be implemented using the following structure:"},
        {"type":"bullets","content":["controller.h and controller.cpp handle PID calculations and gain management","actuator.h and actuator.cpp handle motor or servo control","sensor.h and sensor.cpp handle filtered position measurement","main.cpp coordinates system initialization and executes the timed control loop"]},
        {"type":"text","content":"No PID calculations, filtering logic, or motor control code should be written directly inside main.cpp beyond high-level coordination."}
    ]
})

# bb-lesson-quiz: Controller Implementation Quiz
lessons.append({
    "id": "bb-lesson-quiz",
    "description": "Test your understanding of the controller implementation concepts.",
    "content_json": [
        {"type":"text","content":"Complete the quiz to test your understanding of real-time control loops, PID implementation, motor integration, and tuning techniques."}
    ]
})

# lesson-bb-final-project: Submit Your Final Project
lessons.append({
    "id": "lesson-bb-final-project",
    "description": "Upload your completed Ball and Beam project.",
    "content_json": [
        {"type":"subheading","content":"Final Project Submission"},
        {"type":"text","content":"Upload a zip file with your complete Ball and Beam project contents. The zip file should include your entire project directory and your final working demo video."},
        {"type":"submission","content":{"type":"final-project","requirements":["Complete project directory as ZIP file","Working demo video showing ball stabilization","Brief description of your implementation and tuning approach"]}}
    ]
})

if __name__ == '__main__':
    print(f"Updating {len(lessons)} Ball & Beam lessons...")
    success = 0
    for lesson in lessons:
        if update_lesson(lesson['id'], lesson['description'], lesson['content_json']):
            success += 1
    print(f"\nCompleted: {success}/{len(lessons)} lessons updated successfully.")
