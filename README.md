# DSA Hint Copilot💡

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0-brightgreen)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-purple)
![Platform](https://img.shields.io/badge/Platform-LeetCode-red)
![Platform](https://img.shields.io/badge/Platform-GFG-green)
![AI](https://img.shields.io/badge/AI-Groq%20LLaMA-purple)
![License](https://img.shields.io/badge/License-MIT-blue)

Get progressive AI-powered hints for coding problems without spoilers. One click, instant learning.

## Features

- **4 Progressive Hints** - Subtle → Insightful → Near-solution
- **Dual Platform** - LeetCode & GeeksforGeeks support
- **Smart Caching** - One API call, 4 instant hints (~70ms response)
- **Anti-Spam** - Prevents API abuse
- **Clean UI** - Non-intrusive gradient overlay


## Performance

#### 1. First Click (Generates All 4 Hints)

```
User Click → DOM Extract → ONE API Call (4 hints) → Display Hint 1
   ~20ms   →   ~100ms   →      ~1.4-4.8s           →     ~50ms
```

**Total: ~1.5-4.9 seconds** (one-time cost)

#### 2. Clicks 2-4 (Instant)

```
User Click → Display cached hint
   ~20ms   →      ~50ms
```

**Total: ~70ms per hint**

**Cost**: ~$0.00 per problem (free api)

## Tech Stack

- Manifest V3 (Chrome Extensions)
- Groq API (llama-3.1-8b-instant)
- Vanilla JavaScript
- DOM-based problem extraction

## Core Files

- `content.js` - Main logic & hint management
- `background.js` - Extension event handler
- `hint-display.css` - UI styling
- `manifest.json` - Extension config


## Quick Start

1. Navigate to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → Select `dsa-hint-copilot` folder
4. Visit any LeetCode/GFG problem and click the extension icon