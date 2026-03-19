let hintIndex = 0;
let hints = [];
let apiBusy = false;

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = "your_api_key";

// Plateform Detect
function detectPlatform() {
  const hostname = window.location.hostname;

  if (hostname.includes("leetcode.com")) {
    return "leetcode";
  } else if (hostname.includes("geeksforgeeks.org")) {
    return "geeksforgeeks";
  }
  return "unknown";
}

// Problem extraction
function extractLeetCodeProblem() {
  try {
    // Using selectors from leetcode_structure.txt
    const title = document.querySelector('.text-title-large a')?.innerText.trim() || "No title found";

    const root = document.querySelector('div[data-track-load="description_content"]');
    if (!root) return null;

    // Description paragraphs
    const descriptions = [...root.querySelectorAll('p:not([style*="opacity:0"])')]
      .filter(p => !p.querySelector('strong.example'))
      .map(p => p.innerText.trim())
      .join("\n\n")
      .replace(/\n+Constraints:.*$/s, "")
      .trim();

    // Examples
    const examples = [...root.querySelectorAll('pre')].map(pre => {
      const inputMatch = pre.innerText.match(/Input:\s*(.*)/);
      const outputMatch = pre.innerText.match(/Output:\s*(.*)/);
      const explanationMatch = pre.innerText.match(/Explanation:\s*(.*)/);

      return {
        input: inputMatch ? inputMatch[1].trim() : "",
        output: outputMatch ? outputMatch[1].trim() : "",
        explanation: explanationMatch ? explanationMatch[1].trim() : ""
      };
    });

    // Constraints
    const constraintsHeader = [...root.querySelectorAll('p')]
      .find(p => p.innerText.includes("Constraints"));

    const constraints = constraintsHeader?.nextElementSibling
      ? [...constraintsHeader.nextElementSibling.querySelectorAll('li')]
        .map(li => li.innerText.trim())
      : [];

    return {
      title,
      description: descriptions,
      examples: examples.length > 0 ? JSON.stringify(examples) : "",
      constraints: constraints.join(", ")
    };
  } catch (error) {
    console.error("Error extracting LeetCode problem:", error);
    return null;
  }
}

function extractGFGProblem() {
  try {
    // Using selectors from gfg_structure.txt
    const root = document.querySelector("#scrollableDiv");
    if (!root) return null;

    const title = root.querySelector("h3")?.innerText;

    const descriptionParts = [];
    const nodes = root.querySelectorAll("p, pre, li, h2, h3");

    for (const el of nodes) {
      const text = el.innerText.trim();

      // Stop when constraints start
      if (/^constraints?/i.test(text)) break;

      if (el.matches("p, pre, li")) {
        descriptionParts.push(text);
      }
    }

    const constraints = [...root.querySelectorAll("p")]
      .find(el => el.innerText.includes("Constraints"))
      ?.innerText;

    const description = descriptionParts.join("\n");

    return {
      title,
      description,
      constraints: constraints || ""
    };
  } catch (error) {
    console.error("Error extracting GFG problem:", error);
    return null;
  }
}

function extractProblemData() {
  const platform = detectPlatform();

  if (platform === "leetcode") {
    return extractLeetCodeProblem();
  } else if (platform === "geeksforgeeks") {
    return extractGFGProblem();
  }

  return null;
}

// API CALL (snippet code avaiable at demo\api_call.js)
async function callGroqModel(prompt, options = {}) {
  const {
    model = "llama-3.3-70b-versatile", // llama-3.1-8b-instant
    temperature = 0.5,
    max_tokens = 300,
    systemPrompt = "You are an expert coding assistant who gives concise dsa hints."
  } = options;

  try {
    const payload = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature,
      max_completion_tokens: max_tokens
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return data.choices?.[0]?.message?.content || "No output from model";
  }

  catch (err) {
    console.error("Error calling Groq API:", err);
    return null;
  }
}

async function fetchHintsFromAPI(problemData) {
  const problemStatement = `
Title: ${problemData.title}

Description:
${problemData.description}

${problemData.examples ? "Examples: " + problemData.examples : ""}

${problemData.constraints ? "Constraints: " + problemData.constraints : ""}
`;

  const PROMPT = `
Given the following problem, provide exactly 4 progressive hints. Each hint should be very short (1-2 sentences), concise, and clear:
Hint 1: Very subtle, minimal information.
Hint 2: Slightly more informative than Hint 1.
Hint 3: Gives insight into the approach without revealing the solution.
Hint 4: Almost reveals the solution but do NOT give full code.

Return the hints as a numbered list like:
1. ...
2. ...
3. ...
4. ...

Problem: ${problemStatement}
`;

  const LLM_OUTPUT = await callGroqModel(PROMPT);

  if (!LLM_OUTPUT) return null;

  // Parse the hints from the numbered list
  const hintLines = LLM_OUTPUT.split('\n').filter(line => /^\d+\./.test(line.trim()));
  const parsedHints = hintLines.map(line => line.replace(/^\d+\.\s*/, '').trim());

  return parsedHints.length === 4 ? parsedHints : null;
}

// Display Hints
function createHintContainer() {
  let container = document.getElementById('dsa-hint-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'dsa-hint-container';
    container.className = 'dsa-hint-box';
    document.body.appendChild(container);
  }

  return container;
}

function displayHint(hintText, hintNumber) {
  const container = createHintContainer();
  container.innerHTML = `
    <div class="hint-header">
      <span class="hint-title">💡 Hint ${hintNumber}/4</span>
      <button class="hint-close" id="hint-close-btn">✕</button>
    </div>
    <div class="hint-content">
      ${hintText}
    </div>
  `;

  container.style.display = 'block';

  // Add close button functionality
  document.getElementById('hint-close-btn').addEventListener('click', () => {
    container.style.display = 'none';
  });
}

function showError(message) {
  const container = createHintContainer();
  container.innerHTML = `
    <div class="hint-header">
      <span class="hint-title">⚠️ Error</span>
      <button class="hint-close" id="hint-close-btn">✕</button>
    </div>
    <div class="hint-content hint-error">
      ${message}
    </div>
  `;

  container.style.display = 'block';

  document.getElementById('hint-close-btn').addEventListener('click', () => {
    container.style.display = 'none';
  });
}

function showLoading() {
  const container = createHintContainer();
  container.innerHTML = `
    <div class="hint-header">
      <span class="hint-title">🔄 Loading...</span>
    </div>
    <div class="hint-content">
      Generating hints for your problem...
    </div>
  `;

  container.style.display = 'block';
}


// Main Click Hnadler
async function handleHintRequest() {
  if (apiBusy) {
    console.log("API busy, ignoring spam click");
    return;
  }

  apiBusy = true;

  try {
    if (hints.length === 0) {
      // First call: fetch hints from API
      showLoading();

      const problemData = extractProblemData();

      if (!problemData) {
        showError("Could not extract problem data. Make sure you're on a problem page.");
        apiBusy = false;
        return;
      }

      const fetchedHints = await fetchHintsFromAPI(problemData);

      if (!fetchedHints) {
        showError("Failed to fetch hints from API. Please try again.");
        apiBusy = false;
        return;
      }

      hints = fetchedHints;
      displayHint(hints[hintIndex], hintIndex + 1);
      hintIndex++;
    } else {
      // Subsequent calls: use stored hints
      const currentIndex = Math.min(hintIndex, hints.length - 1);
      displayHint(hints[currentIndex], currentIndex + 1);
      hintIndex = Math.min(hintIndex + 1, hints.length);
    }
  } catch (error) {
    console.error("Error in hint request:", error);
    showError("An unexpected error occurred. Check console for details.");
  } finally {
    apiBusy = false;
  }
}

// ============================================
// MESSAGE LISTENER
// ============================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showNextHint") {
    handleHintRequest();
  }
});

console.log("DSA Hint Helper loaded successfully!");