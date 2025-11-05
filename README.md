# StudyWithMe - Focus Timer & Clock

A sleek, customizable focus timer and clock application built with React, Framer Motion, and Tone.js, designed to create the perfect focus environment.

[![Deploy](https://img.shields.io/badge/View_Demo-Live-brightgreen)](https://YOUR_DEPLOYMENT_LINK)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---



## 🚀 Live Demo

**Try the app live:** [**https://YOUR_DEPLOYMENT_LINK**](https://YOUR_DEPLOYMENT_LINK)

## ✨ Features

**StudyWithMe** is a web-based productivity tool that combines a powerful Pomodoro timer, a world clock, and a stopwatch, all wrapped in a beautiful, customizable interface.

### 🍅 Core Timer Features
* **Pomodoro Timer:** A robust focus timer with customizable work, short break, and long break intervals.
* **Task Input:** Add your tasks before starting a session to stay focused on your goals.
* **Motivational Quotes:** Displays a new quote on each Pomodoro session to keep you inspired.
* **Stopwatch / Timer:** A dedicated tab for a simple, precise stopwatch and a quick-set countdown timer.

### ⚙️ Deep Customization
* **General Settings:**
    * **Background Themes:** 8+ built-in gradients, a time-of-day (morning/afternoon/evening/night) auto-theming mode, and a **custom image upload** feature.
    * **Brightness Control:** An overlay slider to control the overall screen brightness.
* **Sound & Alerts:**
    * **Multiple Sounds:** Choose from 9 built-in audio alerts.
    * **Custom Sound:** Upload your own MP3 or WAV file to use as an alert.
    * **Text-to-Speech (TTS):** Type a custom message (e.g., "Time's up, John!") and have the browser speak it as your alert.
    * **Volume Control:** A fine-grained volume slider for all alerts.
* **Clock Settings:**
    * **10 Digital Themes:** Select from 10 different font styles and colors for all digital timers (Neon, Retro, Matrix, etc.).
    * **10 Analog Themes:** Choose from 10 unique face and hand designs for the analog clock (Modern, Minimal, Royal, etc.).
    * **Live Previews:** See your theme changes in real-time in the settings menu.
    * **Timezone Support:** Search and select from any global timezone.
    * **12/24 Hour Format:** Toggle between time formats.

* **Persistent Settings:** Your preferences are automatically saved to your browser's local storage (with cookie consent).

## 🛠️ Tech Stack

This project was built using modern web technologies:

* **Frontend:** [React](https://reactjs.org/) (with extensive use of Hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Animation:** [Framer Motion](https://www.framer.com/motion/)
* **Audio:** [Tone.js](https://tonejs.github.io/) (for audio playback & volume control)
* **Time & Date:** [Day.js](https://day.js.org/) (for timezone and time formatting)
* **Icons:** [Lucide React](https://lucide.dev/)

## Local Setup

To run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    cd YOUR_REPO_NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173` (or a similar port).

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgements

* Alert sounds provided by [Mixkit](https://mixkit.co/).
* Icons by [Lucide](https://lucide.dev/).
