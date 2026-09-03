import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Minus, Square, Maximize2, Folder, Code2, 
  Github, Menu, ChevronUp, Power, Settings, FileText,
  Music, Monitor, RefreshCw, Terminal, CheckCircle2, 
  Sparkles, Trash2, FileCode2, Upload, GitBranch, 
  Shield, Database, Plus, FolderOpen, HardDrive, 
  Wand2, SearchCheck, Box, Anchor, Film, Bot, MessageSquare, Key,
  Send, Play, Volume2, Image as ImageIcon, Loader2, Copy, Check, HelpCircle,
  Eye, Table, UploadCloud, TerminalSquare
} from 'lucide-react';

// =====================================================================
// 1. CORE OS SERVICES & VIRTUAL FILE SYSTEM (VFS)
// =====================================================================

const DEFAULT_VFS = [
  { id: 'emo_map', name: 'emo_map.html', type: 'code', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>EmoMap – Emotional Timeline Navigator</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-950 text-white flex items-center justify-center h-screen">\n  <div class="text-center">\n    <h1 class="text-3xl font-bold text-yellow-400 mb-4">EmoMap Integrated</h1>\n    <p class="text-slate-400">Open this file in the Live IDE and paste your full HTML code.</p>\n  </div>\n</body>\n</html>` },
  { id: 'soundcloud', name: 'soundcloud-eidolon.html', type: 'code', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>EIDOLON PROTOCOL // v5.0 MAGENTA SENTIENCE</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-black text-pink-500 flex items-center justify-center h-screen font-mono">\n  <div class="text-center border border-pink-500/30 p-8 rounded-xl bg-pink-500/5">\n    <h1 class="text-2xl font-bold mb-4 animate-pulse">EIDOLON PROTOCOL ONLINE</h1>\n    <p class="text-sm">VFS Link Established. Paste full source via IDE.</p>\n  </div>\n</body>\n</html>` },
  { id: 'sailor_poon', name: 'sailor-poon.html', type: 'code', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Sailor Poon's Magical Model</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-[#1a0a2e] text-[#fdf4e3] flex items-center justify-center h-screen font-serif">\n  <div class="text-center p-8 border-2 border-[#c9940a] rounded-full">\n    <h1 class="text-3xl font-bold mb-2">Sailor Poon</h1>\n    <p class="text-[#f0c040]">Magical Model Framework Ready.</p>\n  </div>\n</body>\n</html>` },
  { id: 'ai_dev_hub', name: 'ai_developer_hub.tsx', type: 'code', content: `import React from 'react';\nimport { Terminal, Cpu } from 'lucide-react';\n\nexport default function AIDevHub() {\n  return (\n    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400 p-8 font-mono">\n      <Cpu className="w-16 h-16 mb-6 animate-pulse" />\n      <h1 className="text-3xl font-bold mb-4">AI Developer Hub</h1>\n      <p className="text-slate-400">React Transpiler Active. Paste your full TSX code into this VFS file.</p>\n    </div>\n  );\n}` },
  { id: 'gatsling', name: 'gatsling.html', type: 'code', content: `<!DOCTYPE html>\n<html lang="hr">\n<head>\n  <meta charset="UTF-8">\n  <title>GATSLING v10.0 | THE SINGULARITY</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-[#030305] text-white flex items-center justify-center h-screen font-sans">\n  <div class="text-center border border-white/10 p-8 rounded-xl bg-white/5">\n    <h1 class="text-3xl font-bold mb-4 text-[#ffde00]">GATSLING v10.0</h1>\n    <p class="text-[#367c2b] mb-4">The Singularity Simulation is Ready.</p>\n    <p class="text-slate-400 text-sm">Open in Live IDE to paste full N-Body Gravity code.</p>\n  </div>\n</body>\n</html>` },
  { id: 'media_hub', name: 'media_hub.html', type: 'code', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>MediaHub Local</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-[#0f172a] text-white flex items-center justify-center h-screen font-sans">\n  <div class="text-center border border-white/10 p-8 rounded-xl bg-white/5">\n    <h1 class="text-3xl font-bold mb-4 text-blue-400">MediaHub Local</h1>\n    <p class="text-slate-300 mb-4">Local Media Streaming Server Ready.</p>\n    <p class="text-slate-500 text-sm">Open in Live IDE to paste full HTML code.</p>\n  </div>\n</body>\n</html>` }
];

const osEvents = new EventTarget();

const getVFS = () => {
  const saved = JSON.parse(localStorage.getItem('webos_vfs')) || [];
  const missingDefaults = DEFAULT_VFS.filter(df => !saved.some(sf => sf.id === df.id));
  return [...missingDefaults, ...saved];
};

// =====================================================================
// 1.5 GEMINI API SERVICES & HELPER UTILITIES
// =====================================================================

function pcmToWav(pcm16Data, sampleRate = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm16Data.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (v, offset, str) => {
    for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcm16Data.length; i++, offset += 2) {
    view.setInt16(offset, pcm16Data[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// 1. Standard Text Generation
const callGeminiText = async (prompt, systemInstruction = "") => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini Vision API Error (${response.status})`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No text response returned from Gemini API.");
  return text;
};

// 2. Google Search Grounded Generation
const callGeminiSearch = async (prompt, systemInstruction = "") => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ "google_search": {} }],
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini Structured API Error (${response.status})`);
  }

  const result = await response.json();
  const candidate = result?.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  
  let sources = [];
  const groundingMetadata = candidate?.groundingMetadata;
  if (groundingMetadata && groundingMetadata.groundingAttributions) {
    sources = groundingMetadata.groundingAttributions
      .map(attribution => ({
        uri: attribution.web?.uri,
        title: attribution.web?.title,
      }))
      .filter(source => source.uri && source.title);
  }

  if (!text) throw new Error("No grounded response returned from Gemini API.");
  return { text, sources };
};

// 3. Multi-turn Image Generation & Editing (Gemini 3.1 Flash Image)
const callGemini31FlashImage = async (chatHistory, aspectRatio = "1:1", sourceImg = null) => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

  const contents = [...chatHistory];
  let modalities = ['IMAGE'];

  if (sourceImg && contents.length > 0) {
    const lastIndex = contents.length - 1;
    if (contents[lastIndex].role === 'user') {
       contents[lastIndex] = {
           ...contents[lastIndex],
           parts: [
               ...contents[lastIndex].parts,
               { inlineData: { mimeType: sourceImg.mimeType, data: sourceImg.data } }
           ]
       };
       modalities = ['TEXT', 'IMAGE'];
    }
  }

  const payload = {
    contents: contents,
    generationConfig: {
      responseModalities: modalities,
      imageConfig: { aspectRatio }
    }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini 3.1 Flash Image Error (${response.status})`);
  }

  const result = await response.json();
  const candidate = result?.candidates?.[0];
  const part = candidate?.content?.parts?.find(p => p.inlineData);

  if (!part) throw new Error("No image data returned from Gemini 3.1 Flash Image.");
  
  return {
    imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
    rawCandidateContent: candidate?.content
  };
};

const callGeminiTTS = async (textPrompt, voiceName = "Kore") => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: textPrompt }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    },
    model: "gemini-2.5-flash-preview-tts"
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `TTS API Error (${response.status})`);
  }

  const result = await response.json();
  const part = result?.candidates?.[0]?.content?.parts?.[0];
  const audioDataBase64 = part?.inlineData?.data;
  const mimeType = part?.inlineData?.mimeType || "";

  if (!audioDataBase64) throw new Error("No audio payload received from Gemini TTS.");

  const binaryString = atob(audioDataBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const pcm16 = new Int16Array(bytes.buffer);

  let sampleRate = 24000;
  const match = mimeType.match(/rate=(\d+)/);
  if (match) sampleRate = parseInt(match[1], 10);

  const wavBlob = pcmToWav(pcm16, sampleRate);
  return URL.createObjectURL(wavBlob);
};

// 5. Image Understanding (Vision)
const callGeminiVision = async (prompt, base64ImageData, mimeType) => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64ImageData } }
        ]
      }
    ]
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini Vision API Error (${response.status})`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No text response returned from Gemini Vision API.");
  return text;
};

// 6. Structured Output Generation (JSON Schema)
const callGeminiStructured = async (prompt) => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            "id": { type: "STRING" },
            "name": { type: "STRING" },
            "attributes": { type: "ARRAY", items: { type: "STRING" } },
            "status": { type: "STRING" }
          },
          propertyOrdering: ["id", "name", "attributes", "status"]
        }
      }
    }
  };

  // Implement exponential backoff for structured generation
  let response;
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.status === 429) {
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    } else {
      break;
    }
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini Structured API Error (${response.status})`);
  }

  const result = await response.json();
  const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) throw new Error("No structured response returned.");
  return JSON.parse(jsonText);
};

// 7. OS Command Generation (AI Shell)
const callGeminiOSCommand = async (prompt, vfsList) => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const sysInstruction = `You are Web OS Terminal, a natural language command line interface.
  Convert the user's request into system actions.
  Current Files in VFS: ${JSON.stringify(vfsList.map(f => ({id: f.id, name: f.name})))}\n
  Available Apps to launch: fileManager, liveIDE, geminiAssistant, dataModeler, aiShell, emoMap, soundCloud, sailorPoon, aiDevHub, gatsling, mediaHub.
  
  You must respond with a JSON object containing:
  - "message": A string response to print to the terminal.
  - "actions": An array of action objects.
  
  Valid action objects:
  { "type": "create_file", "name": "filename.html", "content": "file content here" }
  { "type": "delete_file", "id": "exact-file-id" }
  { "type": "launch_app", "appId": "exact-app-id" }
  { "type": "read_file", "id": "exact-file-id" }
  { "type": "list_files" }`;

  const payload = {
    systemInstruction: { parts: [{ text: sysInstruction }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          message: { type: "STRING" },
          actions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                type: { type: "STRING" },
                name: { type: "STRING" },
                content: { type: "STRING" },
                id: { type: "STRING" },
                appId: { type: "STRING" }
              }
            }
          }
        }
      }
    }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `AI Shell API Error (${response.status})`);
  }
  const result = await response.json();
  const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) throw new Error("No response returned.");
  return JSON.parse(jsonText);
};

const callImagenAPI = async (prompt) => {
  const keys = JSON.parse(localStorage.getItem('webos_api_keys') || '{}');
  const apiKey = keys.gemini || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

  const payload = {
    instances: [{ prompt }],
    parameters: { sampleCount: 1 }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Imagen API Error (${response.status})`);
  }

  const result = await response.json();
  const base64Bytes = result?.predictions?.[0]?.bytesBase64Encoded;
  if (!base64Bytes) throw new Error("No image data returned from Imagen API.");
  return `data:image/png;base64,${base64Bytes}`;
};

// =====================================================================
// 2. CORE OS APPS
// =====================================================================

// --- A. FILE MANAGER ---
const FileManagerApp = ({ launchApp }) => {
  const [files, setFiles] = useState(getVFS);
  const fileInputRef = useRef(null);
  
  // AI File Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiFileName, setAiFileName] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const handleVFSUpdate = (e) => setFiles(e.detail);
    osEvents.addEventListener('vfs-updated', handleVFSUpdate);
    return () => osEvents.removeEventListener('vfs-updated', handleVFSUpdate);
  }, []);

  const saveVFS = (newFiles) => {
    setFiles(newFiles);
    localStorage.setItem('webos_vfs', JSON.stringify(newFiles));
    osEvents.dispatchEvent(new CustomEvent('vfs-updated', { detail: newFiles }));
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => {
          const next = [...prev, {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.name.match(/\.(jsx|tsx|js|ts|html|css)$/i) ? 'code' : 'text',
            content: event.target.result
          }];
          localStorage.setItem('webos_vfs', JSON.stringify(next));
          osEvents.dispatchEvent(new CustomEvent('vfs-updated', { detail: next }));
          return next;
        });
      };
      reader.readAsText(file);
    });
  };

  const handleAiCreateFile = async () => {
    if (!aiPrompt || !aiFileName) return;
    setIsGenerating(true);
    setAiError('');

    try {
      const sysInstruction = "You are an AI code generator. Generate complete, executable source code based on the prompt. Return ONLY code without conversational text or surrounding explanation markdown outside the block.";
      const rawCode = await callGeminiText(`Create a full application file named "${aiFileName}" based on: ${aiPrompt}`, sysInstruction);
      let cleanedCode = rawCode;
      if (cleanedCode.includes("```")) {
        cleanedCode = cleanedCode.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
      }

      const newFile = {
        id: 'ai_' + Date.now(),
        name: aiFileName.endsWith('.html') || aiFileName.endsWith('.tsx') ? aiFileName : `${aiFileName}.html`,
        type: 'code',
        content: cleanedCode
      };

      const nextFiles = [...files, newFile];
      saveVFS(nextFiles);
      setShowAiModal(false);
      setAiFileName('');
      setAiPrompt('');
      openFile(newFile);
    } catch (err) {
      setAiError(err.message || 'Failed to generate file with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteFile = (id) => {
    const nextFiles = files.filter(f => f.id !== id);
    saveVFS(nextFiles);
  };
  const openFile = (file) => launchApp('liveIDE', { initialFileId: file.id });

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 relative">
      <div className="flex items-center justify-between p-3 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <HardDrive className="w-4 h-4 text-blue-400" /> VFS: Root
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAiModal(true)} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow-md transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" /> AI Create File
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold">
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
        </div>
        <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
      </div>

      {/* AI File Generator Modal */}
      {showAiModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-purple-500/30 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between text-white font-bold text-sm border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Gemini AI File Creator</span>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">File Name</label>
              <input 
                type="text" 
                value={aiFileName} 
                onChange={(e) => setAiFileName(e.target.value)} 
                placeholder="e.g. crypto_dashboard.html or kanban.tsx" 
                className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Prompt / App Description</label>
              <textarea 
                value={aiPrompt} 
                onChange={(e) => setAiPrompt(e.target.value)} 
                rows={3}
                placeholder="e.g. Create a sleek dark-mode crypto price tracker with animated SVG graphs and search filter..." 
                className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {aiError && <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50">{aiError}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAiModal(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
              <button 
                disabled={isGenerating || !aiFileName || !aiPrompt} 
                onClick={handleAiCreateFile} 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />} Generate & Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {files.map(file => (
            <div key={file.id} onDoubleClick={() => openFile(file)} className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors relative">
              {file.type === 'code' ? <FileCode2 className="w-10 h-10 text-blue-400" /> : <FileText className="w-10 h-10 text-slate-400" />}
              <span className="text-xs font-medium text-center break-words w-full truncate">{file.name}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- B. LIVE REACT IDE ---
const generatePreviewHtml = (code) => {
  const base64Code = btoa(unescape(encodeURIComponent(code || '')));
  return `
    <!DOCTYPE html>
    <html lang="en" class="h-full">
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script type="importmap">
        {
          "imports": {
            "react": "https://esm.sh/react@18.2.0",
            "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
            "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
            "lucide-react": "https://esm.sh/lucide-react@0.344.0?bundle"
          }
        }
      </script>
    </head>
    <body class="h-full m-0 p-0 overflow-auto bg-white">
      <div id="root" class="h-full"></div>
      <script type="module">
        try {
          const rawCode = decodeURIComponent(escape(atob("${base64Code}")));
          let execCode = rawCode.replace(/export\\s+default\\s+(function|class)/g, 'const __DefaultExport = $1');
          execCode = execCode.replace(/export\\s+default\\s+/g, 'const __DefaultExport = ');
          execCode += "\\n\\nimport __React from 'react';\\nimport { createRoot as __createRoot } from 'react-dom/client';\\n";
          execCode += "const rootElement = document.getElementById('root');\\n";
          execCode += "if (rootElement && typeof __DefaultExport !== 'undefined') {\\n";
          execCode += "  const root = __createRoot(rootElement);\\n";
          execCode += "  root.render(__React.createElement(__DefaultExport));\\n}";
          const transformed = window.Babel.transform(execCode, { presets: ['react', 'typescript'], filename: 'app.tsx' }).code;
          const script = document.createElement('script'); script.type = 'module'; script.textContent = transformed; document.body.appendChild(script);
        } catch (e) { document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">Compilation Error:<br/>' + e.message + '</div>'; }
      </script>
    </body>
    </html>
  `;
};

const LiveIDEApp = ({ initialProps }) => {
  const [files, setFiles] = useState(getVFS);
  const [activeFileId, setActiveFileId] = useState(initialProps?.initialFileId || files[0]?.id);
  const [iframeSrc, setIframeSrc] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  // Gemini AI Copilot States in Live IDE
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const handleVFSUpdate = (e) => setFiles(e.detail);
    osEvents.addEventListener('vfs-updated', handleVFSUpdate);
    return () => osEvents.removeEventListener('vfs-updated', handleVFSUpdate);
  }, []);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const isHtml = activeFile?.name.endsWith('.html');
  
  const setCode = (newContent) => {
    const updatedFiles = files.map(f => f.id === activeFileId ? { ...f, content: newContent } : f);
    setFiles(updatedFiles);
    localStorage.setItem('webos_vfs', JSON.stringify(updatedFiles));
    osEvents.dispatchEvent(new CustomEvent('vfs-updated', { detail: updatedFiles }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeSrc(isHtml ? activeFile.content : generatePreviewHtml(activeFile?.content));
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeFile?.content, isHtml]);

  const handleAiRefine = async (actionType, customInstruction = "") => {
    setIsAiLoading(true);
    setAiError('');
    try {
      let promptText = "";
      if (actionType === 'custom') {
        promptText = customInstruction;
      } else if (actionType === 'fix') {
        promptText = "Find and fix any syntax errors, bugs, or missing imports in this code.";
      } else if (actionType === 'style') {
        promptText = "Enhance the styling of this code using modern Tailwind CSS gradients, glassmorphism, animations, and dark mode theme.";
      } else if (actionType === 'feature') {
        promptText = "Add an interactive user feature, such as a search filter, theme toggle, or dynamic controls.";
      }

      const fullPrompt = `Active File Name: ${activeFile?.name}\nUser Prompt: ${promptText}\n\nCurrent Code:\n\`\`\`\n${activeFile?.content || ''}\n\`\`\``;
      const sysInstruction = "You are Gemini, an expert code refactoring assistant built into Web OS. Return ONLY the complete updated executable source code for the file. Do not include introductory text or explanations outside the code block. Return valid HTML or TSX/React code ready to execute.";

      const rawResponse = await callGeminiText(fullPrompt, sysInstruction);
      let cleanedCode = rawResponse;
      if (cleanedCode.includes("```")) {
        cleanedCode = cleanedCode.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
      }
      setCode(cleanedCode);
      setAiPrompt('');
    } catch (err) {
      setAiError(err.message || "Failed to generate code from Gemini API.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#0d1117] text-slate-300">
      <div className={`flex flex-col border-r border-slate-800 ${showPreview ? 'w-1/2' : 'w-full'}`}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800 shrink-0 gap-2">
          <select value={activeFileId} onChange={(e) => setActiveFileId(e.target.value)} className="bg-transparent border-none outline-none text-blue-400 font-mono text-sm cursor-pointer truncate max-w-[160px]">
            {files.map(f => <option key={f.id} value={f.id} className="bg-slate-900">{f.name}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAiDrawer(!showAiDrawer)} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showAiDrawer ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Gemini Copilot
            </button>
            <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 hover:bg-slate-800 rounded-md"><Maximize2 className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Collapsible Gemini AI Drawer */}
        {showAiDrawer && (
          <div className="p-3 bg-[#161b22]/90 border-b border-slate-800 flex flex-col gap-2 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
              <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-purple-400" /> Ask Gemini LLM to edit code</span>
              <span className="text-[10px] text-slate-500 font-mono">gemini-3-flash-preview</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={aiPrompt} 
                onChange={(e) => setAiPrompt(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && aiPrompt && handleAiRefine('custom', aiPrompt)}
                placeholder="e.g. Add particle effect, fix styling, add dark mode button..." 
                className="flex-1 bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-500 font-sans"
              />
              <button 
                disabled={isAiLoading || !aiPrompt} 
                onClick={() => handleAiRefine('custom', aiPrompt)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <button onClick={() => handleAiRefine('style')} disabled={isAiLoading} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[11px] flex items-center gap-1 border border-slate-700">
                ✨ Modernize UI
              </button>
              <button onClick={() => handleAiRefine('feature')} disabled={isAiLoading} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[11px] flex items-center gap-1 border border-slate-700">
                ⚡ Add Interactivity
              </button>
              <button onClick={() => handleAiRefine('fix')} disabled={isAiLoading} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[11px] flex items-center gap-1 border border-slate-700">
                🐛 Fix Bugs
              </button>
              <button 
                onClick={() => handleAiRefine('custom', "Audit this code for security vulnerabilities, memory leaks, unhandled exceptions, and performance issues. Return the fully fixed and optimized version.")} 
                disabled={isAiLoading} 
                className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 rounded text-[11px] flex items-center gap-1 border border-emerald-800/50"
              >
                🛡️ Audit & Optimize
              </button>
            </div>

            {aiError && <div className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/50">{aiError}</div>}
          </div>
        )}

        <textarea value={activeFile?.content || ''} onChange={(e) => setCode(e.target.value)} spellCheck="false" className="flex-1 w-full bg-[#0d1117] text-[#c9d1d9] font-mono text-[13px] p-6 outline-none resize-none" />
      </div>
      {showPreview && (
        <div className="flex-1 bg-white relative">
          <iframe srcDoc={iframeSrc} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" />
        </div>
      )}
    </div>
  );
};

// =====================================================================
// 3. UNIVERSAL VFS APP RUNNERS (For the complex apps)
// =====================================================================

const HtmlRunnerApp = ({ initialProps }) => {
  const [content, setContent] = useState('');
  useEffect(() => {
    const loadFile = () => {
      const files = getVFS();
      const file = files.find(f => f.id === initialProps?.fileId);
      setContent(file ? file.content : `<div style="color:white;padding:20px;font-family:sans-serif;">Error: Application file not found in VFS.</div>`);
    };
    loadFile();
    osEvents.addEventListener('vfs-updated', loadFile);
    return () => osEvents.removeEventListener('vfs-updated', loadFile);
  }, [initialProps?.fileId]);

  return <iframe srcDoc={content} className="w-full h-full border-none bg-black" sandbox="allow-scripts allow-same-origin" />;
};

const ReactRunnerApp = ({ initialProps }) => {
  const [iframeSrc, setIframeSrc] = useState('');
  useEffect(() => {
    const loadFile = () => {
      const files = getVFS();
      const file = files.find(f => f.id === initialProps?.fileId);
      setIframeSrc(file ? generatePreviewHtml(file.content) : '');
    };
    loadFile();
    osEvents.addEventListener('vfs-updated', loadFile);
    return () => osEvents.removeEventListener('vfs-updated', loadFile);
  }, [initialProps?.fileId]);

  return <iframe srcDoc={iframeSrc} className="w-full h-full border-none bg-white" sandbox="allow-scripts allow-same-origin" />;
};

// --- C. GEMINI AI STUDIO & OS ASSISTANT ---
const GeminiAssistantApp = ({ launchApp }) => {
  const [activeTab, setActiveTab] = useState('chat');

  // Copilot Chat
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Hello! I am your Gemini LLM Assistant in Web OS. I can build new VFS files, research real-time facts with Google Search, generate spoken audio, or synthesize/edit images with Gemini 3.1 Flash Image. What shall we build today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Grounded Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Gemini 3.1 Flash Multi-turn Image Studio State
  const [imagePrompt, setImagePrompt] = useState('a futuristic neon cyberpunk desktop wallpaper with dark glass UI elements');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageHistory, setImageHistory] = useState([]); // Keeps turn history for multi-turn edits
  const [currentImageObj, setCurrentImageObj] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imagenSourceFile, setImagenSourceFile] = useState(null);

  // TTS State
  const [ttsText, setTtsText] = useState('Say cheerfully: Welcome to the Web OS Master Edition powered by Gemini LLM!');
  const [ttsVoice, setTtsVoice] = useState('Kore');
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');

  // Vision State
  const [visionImage, setVisionImage] = useState(null);
  const [visionPrompt, setVisionPrompt] = useState('Analyze this image in detail. What are the key elements?');
  const [visionResult, setVisionResult] = useState('');
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const sysInstruction = "You are Gemini, the native AI Architect inside Web OS Master Edition. You answer developer questions, explain code, and if asked to build an app or webpage, return the full executable HTML code inside ```html ... ``` block.";
      const answer = await callGeminiText(userMsg, sysInstruction);
      setChatMessages(prev => [...prev, { role: 'model', text: answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: `⚠️ Gemini Error: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGroundedSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchLoading(true);
    setSearchError('');
    try {
      const sysInstruction = "Provide a comprehensive, factual analysis using up-to-date Google Search findings.";
      const result = await callGeminiSearch(searchQuery, sysInstruction);
      setSearchResults(result);
    } catch (err) {
      setSearchError(err.message || 'Grounded Search Failed.');
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleImagenUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Data = ev.target.result.split(',')[1];
      setImagenSourceFile({ data: base64Data, mimeType: file.type, url: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate31Image = async (isEdit = false) => {
    if (!imagePrompt.trim()) return;
    setIsImageLoading(true);
    setImageError('');

    try {
      let newHistory = [];
      if (isEdit && imageHistory.length > 0) {
        newHistory = [...imageHistory, { role: 'user', parts: [{ text: imagePrompt }] }];
      } else {
        newHistory = [{ role: 'user', parts: [{ text: imagePrompt }] }];
      }

      const res = await callGemini31FlashImage(newHistory, aspectRatio, imagenSourceFile);
      setCurrentImageObj(res.imageUrl);
      
      if (res.rawCandidateContent) {
        setImageHistory([...newHistory, res.rawCandidateContent]);
      }
    } catch (err) {
      setImageError(err.message || 'Image Generation/Editing Failed.');
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleSaveToVfs = (code, suggestedName = 'ai_app.html') => {
    const existingVfs = getVFS();
    const fileId = 'ai_' + Date.now();
    const newFile = { id: fileId, name: suggestedName, type: 'code', content: code };
    const updatedVfs = [...existingVfs, newFile];
    localStorage.setItem('webos_vfs', JSON.stringify(updatedVfs));
    osEvents.dispatchEvent(new CustomEvent('vfs-updated', { detail: updatedVfs }));
    launchApp('liveIDE', { initialFileId: fileId });
  };

  const handleGenerateTTS = async () => {
    setIsTtsLoading(true);
    setTtsError('');
    try {
      if (ttsAudioUrl) URL.revokeObjectURL(ttsAudioUrl);
      const url = await callGeminiTTS(ttsText, ttsVoice);
      setTtsAudioUrl(url);
    } catch (err) {
      setTtsError(err.message || 'TTS Generation Failed.');
    } finally {
      setIsTtsLoading(false);
    }
  };

  const handleVisionUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Data = ev.target.result.split(',')[1];
      setVisionImage({ data: base64Data, mimeType: file.type, url: ev.target.result });
      setVisionResult('');
    };
    reader.readAsDataURL(file);
  };

  const handleVisionAnalyze = async () => {
    if (!visionImage || !visionPrompt) return;
    setIsVisionLoading(true);
    setVisionError('');
    try {
      const result = await callGeminiVision(visionPrompt, visionImage.data, visionImage.mimeType);
      setVisionResult(result);
    } catch (err) {
      setVisionError(err.message || 'Vision Analysis Failed.');
    } finally {
      setIsVisionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 font-sans">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'chat' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bot className="w-4 h-4" /> Architect
          </button>
          <button 
            onClick={() => setActiveTab('search')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'search' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <SearchCheck className="w-4 h-4 text-emerald-400" /> Grounded Search
          </button>
          <button 
            onClick={() => setActiveTab('imagen')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'imagen' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" /> 3.1 Flash Image
          </button>
          <button 
            onClick={() => setActiveTab('tts')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'tts' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Volume2 className="w-4 h-4" /> Voice TTS
          </button>
          <button 
            onClick={() => setActiveTab('vision')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'vision' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Eye className="w-4 h-4 text-cyan-400" /> Vision AI
          </button>
        </div>
        <span className="text-[10px] text-purple-400 font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 hidden sm:inline">
          Gemini 3.1 API Engine
        </span>
      </div>

      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {chatMessages.map((msg, idx) => {
              const codeMatch = msg.text.match(/```(?:html|jsx|tsx|javascript)?\n([\s\S]*?)```/);
              return (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161b22] border border-slate-800 text-slate-200 rounded-bl-none shadow-md'}`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    
                    {codeMatch && msg.role === 'model' && (
                      <div className="mt-3 p-3 bg-black/50 border border-slate-700/60 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold font-mono">
                          <span>✨ Executable Code Detected</span>
                          <button 
                            onClick={() => handleSaveToVfs(codeMatch[1], `gemini_app_${Date.now().toString().slice(-4)}.html`)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <FileCode2 className="w-3 h-3" /> Save to VFS & Open
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse bg-[#161b22] p-3 rounded-xl border border-slate-800 w-fit">
                <Loader2 className="w-4 h-4 animate-spin" /> Gemini is generating code...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-[#161b22] border-t border-slate-800 flex items-center gap-2 shrink-0">
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask Gemini to build an app, generate HTML, or answer code questions..." 
              className="flex-1 bg-[#0d1117] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500 font-sans"
            />
            <button 
              disabled={isChatLoading || !chatInput} 
              onClick={handleSendChat}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-5 max-w-2xl mx-auto w-full">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <SearchCheck className="w-4 h-4 text-emerald-400" /> Google Search Grounded Research Engine
            </h3>
            <p className="text-xs text-slate-400">Uses Gemini 3 Flash grounded with real-time web search results and source citations.</p>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGroundedSearch()}
              placeholder="e.g. Latest breaking technological developments in AI quantum computing..." 
              className="flex-1 bg-[#0d1117] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500 font-sans"
            />
            <button 
              disabled={isSearchLoading || !searchQuery} 
              onClick={handleGroundedSearch}
              className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {isSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchCheck className="w-4 h-4" />} Search
            </button>
          </div>

          {searchError && <div className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-800/50">{searchError}</div>}

          {searchResults && (
            <div className="bg-[#161b22] border border-slate-800 p-5 rounded-2xl space-y-4 animate-in fade-in">
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {searchResults.text}
              </div>

              {searchResults.sources?.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">Grounding Web Citations:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.sources.map((src, i) => (
                      <a 
                        key={i} 
                        href={src.uri} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[10px] text-blue-400 truncate max-w-xs transition-colors flex items-center gap-1"
                      >
                        🌐 {src.title || src.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'imagen' && (
    <div className="flex-1 p-6 overflow-y-auto space-y-5 max-w-xl mx-auto w-full">
      <div>
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Gemini 3.1 Flash Image Studio
        </h3>
        <p className="text-xs text-slate-400">Supports text-to-image generation, image-to-image editing, and multi-turn iterative editing.</p>
      </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Image Prompt / Modification Request</label>
              <input 
                type="text" 
                value={imagePrompt} 
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full bg-[#0d1117] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-sans"
                placeholder={currentImageObj || imagenSourceFile ? "Describe edits e.g. 'Remove background', 'Add neon lighting'..." : "e.g. 3D isometric cyberpunk city..."}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-300 mb-1">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1:1', '16:9', '9:16', '4:3'].map(ratio => (
                    <button 
                      key={ratio} 
                      onClick={() => setAspectRatio(ratio)} 
                      className={`py-1.5 rounded-lg text-xs font-mono border ${aspectRatio === ratio ? 'bg-amber-600/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Image (Optional)</label>
                <input type="file" accept="image/*" onChange={handleImagenUpload} id="imagen-upload" className="hidden" />
                <label htmlFor="imagen-upload" className="flex items-center justify-center h-[34px] bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 cursor-pointer transition-colors px-2 truncate">
                  {imagenSourceFile ? "🖼️ Image Selected" : "Upload to Edit"}
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                disabled={isImageLoading || !imagePrompt} 
                onClick={() => handleGenerate31Image(false)}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-900/20"
              >
                {isImageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {imagenSourceFile ? 'Apply Edit (Img2Img)' : 'Fresh Generate'}
              </button>

              {currentImageObj && !imagenSourceFile && (
                <button 
                  disabled={isImageLoading || !imagePrompt} 
                  onClick={() => handleGenerate31Image(true)}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
                >
                  {isImageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Refine Previous Image
                </button>
              )}
            </div>
          </div>

          {currentImageObj && (
            <div className="p-4 bg-[#161b22] border border-slate-700 rounded-xl flex flex-col items-center gap-3 animate-in fade-in">
              <img src={currentImageObj} alt="Generated asset" className="max-h-64 rounded-lg object-contain shadow-lg border border-slate-800" />
              <a 
                href={currentImageObj} 
                download="gemini_31_flash_image.png" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                Download PNG
              </a>
            </div>
          )}

          {imageError && <div className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-800/50">{imageError}</div>}
        </div>
      )}

      {activeTab === 'tts' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-5 max-w-xl mx-auto w-full">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-400" /> Gemini Voice Synthesizer (PCM16 to WAV)
            </h3>
            <p className="text-xs text-slate-400">Generate high quality voice audio using `gemini-2.5-flash-preview-tts`.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Text Prompt & Voice Control</label>
            <textarea 
              value={ttsText} 
              onChange={(e) => setTtsText(e.target.value)}
              rows={3}
              className="w-full bg-[#0d1117] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-purple-500 font-sans"
              placeholder="Say cheerfully: Hello world!"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Voice Selection</label>
            <select 
              value={ttsVoice} 
              onChange={(e) => setTtsVoice(e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-700 rounded-xl p-2.5 text-xs text-purple-300 outline-none focus:border-purple-500"
            >
              <option value="Kore">Kore (Firm)</option>
              <option value="Zephyr">Zephyr (Bright)</option>
              <option value="Puck">Puck (Upbeat)</option>
              <option value="Charon">Charon (Informative)</option>
              <option value="Fenrir">Fenrir (Excitable)</option>
              <option value="Aoede">Aoede (Breezy)</option>
            </select>
          </div>

          <button 
            disabled={isTtsLoading || !ttsText} 
            onClick={handleGenerateTTS}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
          >
            {isTtsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Synthesize Speech
          </button>

          {ttsAudioUrl && (
            <div className="p-4 bg-[#161b22] border border-purple-500/30 rounded-xl space-y-2 animate-in fade-in">
              <span className="text-xs font-semibold text-purple-300 block">Generated Audio Output:</span>
              <audio controls src={ttsAudioUrl} className="w-full h-10 rounded-lg" />
            </div>
          )}

          {ttsError && <div className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-800/50">{ttsError}</div>}
        </div>
      )}

      {activeTab === 'vision' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-5 max-w-2xl mx-auto w-full">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" /> Gemini Vision Studio
            </h3>
            <p className="text-xs text-slate-400">Upload an image and ask Gemini questions about it using multimodal understanding.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/3 space-y-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square bg-[#161b22] border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-slate-800 transition-colors relative overflow-hidden"
              >
                {visionImage ? (
                  <img src={visionImage.url} alt="Upload preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-400">Click to Upload</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleVisionUpload} className="hidden" />
              {visionImage && (
                <button onClick={() => setVisionImage(null)} className="w-full py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg">Remove Image</button>
              )}
            </div>

            <div className="w-full md:w-2/3 space-y-3">
              <textarea 
                value={visionPrompt} 
                onChange={(e) => setVisionPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#0d1117] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-cyan-500 font-sans"
                placeholder="Ask something about the image..."
              />
              <button 
                disabled={isVisionLoading || !visionImage || !visionPrompt} 
                onClick={handleVisionAnalyze}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-900/20"
              >
                {isVisionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analyze Image
              </button>
              
              {visionError && <div className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-800/50">{visionError}</div>}
              
              {visionResult && (
                <div className="p-4 bg-[#161b22] border border-cyan-500/30 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-2">Vision Analysis Result:</span>
                  <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{visionResult}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- D. AI DATA MODELER (Structured JSON App) ---
const AIDataModelerApp = () => {
  const [prompt, setPrompt] = useState('Generate a list of 5 cyberpunk characters with futuristic roles');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateData = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError('');
    setData([]);

    try {
      const result = await callGeminiStructured(prompt);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to generate structured data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 font-sans">
      <div className="p-4 bg-[#161b22] border-b border-slate-800 shrink-0 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">AI Data Modeler</h2>
            <p className="text-[10px] text-slate-400">Uses responseSchema to force Gemini to output structured JSON Arrays.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateData()}
            placeholder="e.g. Generate 5 fantasy tavern menu items..." 
            className="flex-1 bg-[#0d1117] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-sans"
          />
          <button 
            disabled={isLoading || !prompt} 
            onClick={handleGenerateData}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />} Generate Array
          </button>
        </div>
        {error && <div className="text-xs text-rose-400">{error}</div>}
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-emerald-500/50 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono">Enforcing JSON Schema...</span>
          </div>
        ) : data.length > 0 ? (
          <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-xl animate-in fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0d1117] border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Attributes</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-emerald-300">{row.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.attributes?.map((attr, aIdx) => (
                          <span key={aIdx} className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-md text-[10px] text-slate-300">{attr}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded-full text-[10px] font-semibold">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
            <Database className="w-12 h-12 opacity-20" />
            <p className="text-xs text-center max-w-xs">Enter a prompt above to generate structured data. The output is strictly typed to match the required UI table.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- E. AI SHELL (Natural Language Terminal) ---
const AIShellApp = ({ launchApp }) => {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Web OS Master Edition - A.I. Shell v1.0' },
    { type: 'system', text: 'Type a command in plain English (e.g., "Create a snake game", "Delete the media hub file", "Open the file manager").' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleExecute = async () => {
    if (!input.trim()) return;
    const userCmd = input;
    setInput('');
    setHistory(p => [...p, { type: 'input', text: `> ${userCmd}` }]);
    setIsLoading(true);

    try {
      const vfs = getVFS();
      const res = await callGeminiOSCommand(userCmd, vfs);
      
      let newHistory = [];
      if (res.message) newHistory.push({ type: 'output', text: res.message });

      if (res.actions && res.actions.length > 0) {
        let updatedVfs = [...vfs];
        let vfsChanged = false;

        for (const action of res.actions) {
          switch(action.type) {
            case 'create_file':
              const newId = 'file_' + Date.now() + Math.random();
              updatedVfs.push({ 
                id: newId, 
                name: action.name || 'untitled.txt', 
                type: action.name?.match(/\.(js|jsx|html|css|ts|tsx)$/) ? 'code' : 'text', 
                content: action.content || '' 
              });
              vfsChanged = true;
              newHistory.push({ type: 'system', text: `[Success] Created file: ${action.name}` });
              break;
            case 'delete_file':
              updatedVfs = updatedVfs.filter(f => f.id !== action.id);
              vfsChanged = true;
              newHistory.push({ type: 'system', text: `[Success] Deleted file ID: ${action.id}` });
              break;
            case 'launch_app':
              launchApp(action.appId);
              newHistory.push({ type: 'system', text: `[Success] Launched App: ${action.appId}` });
              break;
            case 'read_file':
              const file = updatedVfs.find(f => f.id === action.id);
              if (file) {
                newHistory.push({ type: 'output', text: `--- ${file.name} ---\n${file.content}\n--- EOF ---` });
              } else {
                newHistory.push({ type: 'error', text: `[Error] File ID ${action.id} not found.` });
              }
              break;
            case 'list_files':
              const list = updatedVfs.map(f => `${f.name} (ID: ${f.id})`).join('\n');
              newHistory.push({ type: 'output', text: `Files:\n${list || 'No files found.'}` });
              break;
          }
        }

        if (vfsChanged) {
          localStorage.setItem('webos_vfs', JSON.stringify(updatedVfs));
          osEvents.dispatchEvent(new CustomEvent('vfs-updated', { detail: updatedVfs }));
        }
      }

      setHistory(p => [...p, ...newHistory]);
    } catch (err) {
      setHistory(p => [...p, { type: 'error', text: `[Fatal] ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-cyan-400 font-mono text-xs">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {history.map((msg, idx) => (
          <div key={idx} className={`whitespace-pre-wrap ${
            msg.type === 'input' ? 'text-white' : 
            msg.type === 'error' ? 'text-rose-500' : 
            msg.type === 'system' ? 'text-slate-400' : 
            'text-cyan-400'
          }`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="text-cyan-500/50 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Parsing OS command...
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-2 border-t border-cyan-900/30 bg-black flex items-center">
        <span className="text-cyan-600 mr-2 shrink-0">root@webos:~#</span>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
          disabled={isLoading}
          className="flex-1 bg-transparent outline-none text-white w-full placeholder:text-cyan-900/50"
          placeholder="Type a natural language command..."
          autoFocus
        />
      </div>
    </div>
  );
};


// =====================================================================
// 4. APP REGISTRY & WINDOW MANAGER
// =====================================================================

const APPS_REGISTRY = {
  fileManager: { id: 'fileManager', title: 'File Explorer', icon: <Folder className="w-5 h-5 text-amber-400" />, component: FileManagerApp, defaultSize: { w: 700, h: 500 } },
  liveIDE: { id: 'liveIDE', title: 'Live React IDE', icon: <Code2 className="w-5 h-5 text-blue-400" />, component: LiveIDEApp, defaultSize: { w: 900, h: 600 } },
  geminiAssistant: { id: 'geminiAssistant', title: 'Gemini AI Studio', icon: <Sparkles className="w-5 h-5 text-purple-400" />, component: GeminiAssistantApp, defaultSize: { w: 900, h: 650 } },
  dataModeler: { id: 'dataModeler', title: 'AI Data Modeler', icon: <Database className="w-5 h-5 text-emerald-400" />, component: AIDataModelerApp, defaultSize: { w: 800, h: 600 } },
  aiShell: { id: 'aiShell', title: 'A.I. Shell', icon: <TerminalSquare className="w-5 h-5 text-cyan-400" />, component: AIShellApp, defaultSize: { w: 750, h: 500 } },
  emoMap: { id: 'emoMap', title: 'Emo Map', icon: <Monitor className="w-5 h-5 text-yellow-400" />, component: HtmlRunnerApp, defaultProps: { fileId: 'emo_map' }, defaultSize: { w: 1000, h: 650 } },
  soundCloud: { id: 'soundCloud', title: 'SoundCloud Protocol', icon: <Music className="w-5 h-5 text-pink-500" />, component: HtmlRunnerApp, defaultProps: { fileId: 'soundcloud' }, defaultSize: { w: 900, h: 600 } },
  sailorPoon: { id: 'sailorPoon', title: 'Sailor Poon', icon: <Anchor className="w-5 h-5 text-[#f0c040]" />, component: HtmlRunnerApp, defaultProps: { fileId: 'sailor_poon' }, defaultSize: { w: 800, h: 600 } },
  aiDevHub: { id: 'aiDevHub', title: 'AI Dev Hub', icon: <Terminal className="w-5 h-5 text-emerald-500" />, component: ReactRunnerApp, defaultProps: { fileId: 'ai_dev_hub' }, defaultSize: { w: 950, h: 700 } },
  gatsling: { id: 'gatsling', title: 'Gatsling v10.0', icon: <Box className="w-5 h-5 text-[#367c2b]" />, component: HtmlRunnerApp, defaultProps: { fileId: 'gatsling' }, defaultSize: { w: 1000, h: 800 } },
  mediaHub: { id: 'mediaHub', title: 'Media Hub', icon: <Film className="w-5 h-5 text-blue-400" />, component: HtmlRunnerApp, defaultProps: { fileId: 'media_hub' }, defaultSize: { w: 1000, h: 700 } }
};

const OSWindow = ({ windowData, onClose, onMinimize, onMaximize, onFocus, updatePosition, isActive, launchApp }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || windowData.maximized) return;
      updatePosition(windowData.id, {
        x: (e.touches ? e.touches[0].clientX : e.clientX) - dragOffset.x,
        y: Math.max(0, (e.touches ? e.touches[0].clientY : e.clientY) - dragOffset.y)
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset, windowData.id, windowData.maximized, updatePosition]);

  const handleMouseDown = (e) => {
    if (windowData.maximized) return;
    onFocus(windowData.id);
    const rect = windowRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOffset({ x: clientX - rect.left, y: clientY - rect.top });
    setIsDragging(true);
  };

  if (windowData.minimized) return null;

  const style = windowData.maximized 
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)' } 
    : { top: windowData.y, left: windowData.x, width: windowData.w, height: windowData.h };

  const AppContent = APPS_REGISTRY[windowData.appId].component;

  return (
    <div 
      ref={windowRef}
      onMouseDown={() => onFocus(windowData.id)}
      onTouchStart={() => onFocus(windowData.id)}
      style={{ ...style, zIndex: windowData.zIndex }}
      className={`absolute flex flex-col bg-[#161b22] border ${isActive ? 'border-blue-500/50 shadow-2xl shadow-blue-900/20' : 'border-slate-700 shadow-xl'} rounded-xl overflow-hidden transition-all ${isDragging ? 'duration-0 opacity-95' : 'duration-200'}`}
    >
      <div 
        onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}
        className={`h-10 flex items-center justify-between px-3 shrink-0 ${windowData.maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${isActive ? 'bg-[#161b22]' : 'bg-[#0d1117]'} border-b border-slate-800 select-none`}
      >
        <div className="flex items-center gap-2 text-slate-300 pointer-events-none">
          {APPS_REGISTRY[windowData.appId].icon}
          <span className="text-xs font-semibold tracking-wide">{windowData.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(windowData.id); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10"><Minus className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(windowData.id); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10">
            {windowData.maximized ? <Square className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(windowData.id); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative bg-[#0d1117]">
        <AppContent launchApp={launchApp} initialProps={windowData.props} />
      </div>
    </div>
  );
};

export default function App() {
  const [windows, setWindows] = useState(() => {
    try {
      const saved = localStorage.getItem('webos_windows');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeZIndex, setActiveZIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('webos_zindex');
      return saved ? parseInt(saved, 10) : 10;
    } catch { return 10; }
  });
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // OS API Keys State
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('webos_api_keys');
    return saved ? JSON.parse(saved) : { gemini: '', openai: '', anthropic: '', github: '' };
  });

  // Sync window state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('webos_windows', JSON.stringify(windows));
  }, [windows]);

  // Sync z-index hierarchy
  useEffect(() => {
    localStorage.setItem('webos_zindex', activeZIndex.toString());
  }, [activeZIndex]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('webos_api_keys', JSON.stringify(apiKeys));
    setShowSettings(false);
    // Dispatch event so apps using keys know they updated
    osEvents.dispatchEvent(new CustomEvent('apikeys-updated', { detail: apiKeys }));
  };

  const launchApp = useCallback((appId, customProps = null) => {
    setShowStartMenu(false);
    const app = APPS_REGISTRY[appId];
    
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow && !customProps) {
      setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, minimized: false, zIndex: activeZIndex + 1 } : w));
      setActiveZIndex(prev => prev + 1);
      return;
    }

    const finalProps = customProps || app.defaultProps || null;
    const maxW = typeof window !== 'undefined' ? window.innerWidth * 0.9 : app.defaultSize.w;
    const maxH = typeof window !== 'undefined' ? (window.innerHeight - 48) * 0.9 : app.defaultSize.h;
    
    const newWindow = {
      id: `${appId}-${Date.now()}`,
      appId: appId,
      title: app.title,
      x: Math.max(20, (windows.length * 30) % 150),
      y: Math.max(20, (windows.length * 30) % 150),
      w: Math.min(app.defaultSize.w, maxW),
      h: Math.min(app.defaultSize.h, maxH),
      minimized: false,
      maximized: typeof window !== 'undefined' && window.innerWidth < 768,
      zIndex: activeZIndex + 1,
      props: finalProps
    };
    
    setWindows(prev => [...prev, newWindow]);
    setActiveZIndex(prev => prev + 1);
  }, [windows, activeZIndex]);

  const closeWindow = (id) => setWindows(windows.filter(w => w.id !== id));
  const toggleMinimize = (id) => setWindows(windows.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
  const toggleMaximize = (id) => setWindows(windows.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  const focusWindow = (id) => {
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: activeZIndex + 1, minimized: false } : w));
    setActiveZIndex(prev => prev + 1);
  };
  const updateWindowPosition = (id, newPos) => setWindows(windows.map(w => w.id === id ? { ...w, ...newPos } : w));

  const activeWindowId = windows.length > 0 ? windows.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current).id : null;

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-900 flex flex-col relative font-sans text-slate-200 select-none">
      
      {/* Settings Modal Layer */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-[#0d1117]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Key className="w-5 h-5 text-blue-400" /> OS Configuration</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-slate-400 mb-2">Configure API keys for system-wide AI and GitHub integrations.</p>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Gemini API Key
                </label>
                <input 
                  type="password" value={apiKeys.gemini} onChange={e => setApiKeys({...apiKeys, gemini: e.target.value})} 
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200" 
                  placeholder="AI Studio Key..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" /> OpenAI API Key
                </label>
                <input 
                  type="password" value={apiKeys.openai} onChange={e => setApiKeys({...apiKeys, openai: e.target.value})} 
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200" 
                  placeholder="sk-proj-..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" /> Anthropic API Key
                </label>
                <input 
                  type="password" value={apiKeys.anthropic} onChange={e => setApiKeys({...apiKeys, anthropic: e.target.value})} 
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200" 
                  placeholder="sk-ant-..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-100" /> GitHub PAT
                </label>
                <input 
                  type="password" value={apiKeys.github} onChange={e => setApiKeys({...apiKeys, github: e.target.value})} 
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200" 
                  placeholder="ghp_..." 
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 bg-[#0d1117]">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Cancel</button>
              <button onClick={saveSettings} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">Save Keys</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden" onClick={() => setShowStartMenu(false)}>
        <div className="absolute inset-0 bg-slate-950">
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[150px]" />
           <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-purple-600/15 rounded-full blur-[100px]" />
        </div>

        {/* Desktop Icons */}
        <div className="absolute top-6 left-6 flex flex-col flex-wrap max-h-[calc(100%-100px)] gap-6 pointer-events-auto">
          {Object.values(APPS_REGISTRY).map(app => (
            <div 
              key={`desktop-${app.id}`} 
              onClick={() => launchApp(app.id)}
              className="flex flex-col items-center gap-2 w-24 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
            >
              <div className="w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:bg-white/10 transition-all">
                {app.icon}
              </div>
              <span className="text-xs text-center font-medium drop-shadow-md px-1 leading-tight">{app.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Window Manager Layer */}
      <div className="flex-1 relative z-10 w-full h-[calc(100%-48px)] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 pointer-events-auto">
          {windows.map(win => (
            <OSWindow 
              key={win.id} windowData={win} isActive={activeWindowId === win.id && !win.minimized}
              onClose={closeWindow} onMinimize={toggleMinimize} onMaximize={toggleMaximize}
              onFocus={focusWindow} updatePosition={updateWindowPosition} launchApp={launchApp}
            />
          ))}
        </div>
      </div>

      {/* Start Menu Overlay */}
      {showStartMenu && (
        <div className="absolute bottom-14 left-2 w-80 bg-[#161b22]/95 backdrop-blur-2xl border border-slate-700 shadow-2xl rounded-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-5 border-b border-slate-700/50 flex items-center gap-4 bg-gradient-to-r from-[#161b22] to-slate-800">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-inner text-xl">W</div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Web OS Master</h3>
              <p className="text-xs text-slate-400">Integrated Build</p>
            </div>
          </div>
          <div className="p-3 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">All Apps</div>
            {Object.values(APPS_REGISTRY).map(app => (
              <button 
                key={`menu-${app.id}`} onClick={() => launchApp(app.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left group"
              >
                <div className="group-hover:scale-110 transition-transform">{app.icon}</div>
                <span className="text-sm font-medium text-slate-200 group-hover:text-white">{app.title}</span>
              </button>
            ))}
          </div>
          <div className="p-3 bg-[#0d1117] border-t border-slate-700/50 flex justify-between">
            <button 
              onClick={() => { setShowSettings(true); setShowStartMenu(false); }}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors" title="Power"><Power className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {/* Taskbar Layer */}
      <div className="h-12 bg-[#0d1117]/95 backdrop-blur-xl border-t border-slate-800 shrink-0 z-40 flex items-center justify-between px-3 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] relative">
        <div className="flex items-center gap-2 h-full">
          <button 
            onClick={() => setShowStartMenu(!showStartMenu)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showStartMenu ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-700/50 mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[50vw]">
            {windows.map(win => {
              const isActive = activeWindowId === win.id && !win.minimized;
              return (
                <button
                  key={`taskbar-${win.id}`} onClick={() => focusWindow(win.id)}
                  className={`flex items-center gap-2 px-3 h-9 rounded-lg transition-all max-w-[140px] shrink-0 border ${isActive ? 'bg-slate-800 border-slate-700 shadow-inner text-white' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                >
                  <div className="shrink-0">{APPS_REGISTRY[win.appId].icon}</div>
                  <span className="text-xs font-medium truncate hidden sm:inline">{win.title}</span>
                  {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-blue-500 rounded-t-full" />}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 text-slate-300 h-full">
          <div className="flex items-center gap-2 px-2 hover:bg-white/10 h-9 rounded-lg cursor-pointer transition-colors" onClick={() => setShowSettings(true)}>
             <Settings className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col items-end justify-center px-3 hover:bg-white/10 h-9 rounded-lg cursor-pointer transition-colors">
            <span className="text-xs font-medium leading-tight text-slate-200">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}