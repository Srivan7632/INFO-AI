# INFO-AI

# 📱 INFO__AI – Smart Daily Chatbot Assistant

**INFO__AI** is a lightweight AI-powered chatbot application built using **React Native** (with **Expo**) designed for mobile platforms. The goal is to create a personal assistant alternative to Google for handling day-to-day queries with a clean, fast, and interactive experience.

---

## 🚀 Purpose

Instead of typing queries into Google or browsing endlessly, INFO__AI provides a conversational interface that:
- Answers questions
- Performs quick lookups
- Helps with productivity
- Serves as a daily AI companion

This is built with minimal distraction and a strong focus on speed, utility, and future extensibility.

---

## 🛠️ How It Was Made

- **Frontend**: Built with React Native using the [Expo](https://expo.dev/) framework.
- **Design**: UI components are styled with [React Native Paper](https://callstack.github.io/react-native-paper/).
- **AI Backend**: Powered via [OpenRouter API](https://openrouter.ai/), utilizing models like Google Gemma for AI responses.
- **Storage**: Conversations are saved locally using `@react-native-async-storage/async-storage`.
- **Sound & Haptics**: Interactive audio feedback using `expo-av` and haptic feedback via `expo-haptics`.
- **File Sharing**: Export chat history as a `.txt` file using `expo-sharing`.
- **Offline Detection**: Integrated `@react-native-community/netinfo` to detect internet connectivity.
- **Animations**: Subtle fade-in effects for branding and graceful UI transitions using `Animated`.

---

## 💡 Features

- ✅ Conversational AI with natural responses.
- ✅ Chat export to `.txt` file.
- ✅ Chat clearing with confirmation.
- ✅ Mute/unmute button for sound effects.
- ✅ Fading logo animation on launch.
- ✅ Sound alerts on: App start, message send, receive, delete, and "goodbye".
- ✅ Detects phrases like "bye" to play farewell sound and fade UI.
- ✅ Offline check before sending a message.
- ✅ Persistent message history across sessions.
- ✅ Logo branding centered in the header.
- ✅ Haptic feedback on mute toggle.
- ✅ Manual volume toggle with persistent mute state.

---

## 📲 How To Run

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/info-ai-chatbot.git
   cd info-ai-chatbot
Install dependencies:

bash
Copy
Edit
npm install
Start the Expo development server:

bash
Copy
Edit
npx expo start
Open in Expo Go (on your Android/iOS device) by scanning the QR code.

📁 Folder Structure
go
Copy
Edit
.
├── assets/
│   ├── info_ai_logo.png
│   ├── startup.mp3
│   ├── send.mp3
│   ├── receive.mp3
│   ├── delete.mp3
│   └── goodbye.mp3
├── App.js
├── package.json
└── README.md
🧠 Future Features (Coming Soon)
INFO__AI is still in development. Many exciting enhancements are planned:

🌍 Web search integration (Bing, DuckDuckGo).

🔊 Voice input and TTS responses.

🧩 Plugin/module architecture for extensibility.

🧠 Prompt memory + smart history.

🎵 Music playback from streaming APIs.

🔐 Chat lock/pin security.

🌙 Dark mode & personalization.

🧑‍💻 Contributions
Want to improve this project or add features? Feel free to fork and submit a PR!

📝 License
MIT License.

Made with ❤️ to make daily search smarter.
