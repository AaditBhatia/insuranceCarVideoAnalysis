# Vinci Forensic Hub 🛡️📹

Vinci Forensic Hub is a world-class forensic intelligence platform designed for the insurance and automotive industries. It leverages the cutting-edge capabilities of Google's Gemini and Veo models to transform raw video data into actionable evidence and cinematic recreations.

## 🎥 Demo

https://github.com/user-attachments/assets/screen-recording-demo.mov

[Screen Recording 2026-01-18 at 4.08.20 PM.mov](./Screen%20Recording%202026-01-18%20at%204.08.20%20PM.mov)

## 🌟 Key Features

### 🔍 Forensic Video-to-Text Analysis
- **Model**: `gemini-3-pro-preview`
- **Capabilities**: Analyzes dashcam and surveillance footage to provide a multi-point forensic audit.
- **Insurance Focus**: Automatically assesses liability, identifies vehicle impact zones, notes environmental factors (weather, road conditions), and generates timestamped logs of events.

### 🗺️ Contextual Maps Grounding
- **Model**: `gemini-3-flash-preview`
- **Tool**: `googleMaps`
- **Capabilities**: Uses real-time geolocation to find and link highly-rated insurance claim centers and repair shops nearby, ensuring immediate support after an incident.

### 🎬 Veo Generation Studio
- **Model**: `veo-3.1-fast-generate-preview`
- **Capabilities**: High-fidelity video generation from text prompts. Useful for recreating accident scenarios, visualizing traffic flow improvements, or cinematic storytelling.
- **Specs**: Supports 720p/1080p resolutions and both Landscape (16:9) and Portrait (9:16) aspect ratios.

## 🚀 Tech Stack

- **Framework**: React 19 (ESM)
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **AI SDK**: `@google/genai` (Google Generative AI SDK)
- **Icons**: Custom SVG implementation for performance and zero-dependency footprint
- **State Management**: React Hooks (useState, useEffect)

## 🛠️ Getting Started

This application requires a Google Gemini API Key with access to the following models:
- `gemini-3-pro-preview`
- `gemini-3-flash-preview`
- `veo-3.1-fast-generate-preview`

### Key Selection
The app integrates with AI Studio's key selection dialog. Ensure your project has the **Gemini API** enabled in the Google Cloud Console and a valid billing method attached for Veo access.

## ⚖️ Disclaimer

Vinci Forensic Hub provides AI-generated assessments intended for use as supporting evidence. All reports should be reviewed and verified by a licensed human insurance adjuster or forensic specialist.

---
*Built with precision and aesthetics by a Senior Frontend Engineer.*