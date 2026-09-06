'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, ShieldCheck, AlertTriangle, Image as ImageIcon, ArrowRight, RefreshCw, CloudSun, MapPin, CheckCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agrifusion-ai.onrender.com';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [temp, setTemp] = useState(26.5);
  const [canopyRH, setCanopyRH] = useState(85);
  const [soilMoisture, setSoilMoisture] = useState(65);
  const [locationLabel, setLocationLabel] = useState("Tomato Belt (Nashik/Kolar)");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const onFileSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleGPSDetect = () => {
    setFetchingWeather(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported by this browser.");
      setFetchingWeather(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(2));
        const lon = parseFloat(pos.coords.longitude.toFixed(2));
        try {
          const res = await fetch(`${API_BASE_URL}/api/weather-by-coords?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          setTemp(data.temperature);
          setCanopyRH(data.humidity);
          setLocationLabel(`Farm GPS (${lat}°, ${lon}°)`);
        } catch {
          alert("Could not pull live weather; backend offline.");
        } finally {
          setFetchingWeather(false);
        }
      },
      () => {
        alert("Location access denied. Defaulting to agro-climatic values.");
        setFetchingWeather(false);
      }
    );
  };

  const handleRunPipeline = async () => {
    if (!selectedFile) {
      alert("Please upload or capture a leaf photo first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("temp", temp.toString());
      formData.append("canopy_rh", canopyRH.toString());
      formData.append("soil_moisture", soilMoisture.toString());

      const res = await fetch(`${API_BASE_URL}/api/diagnose-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch {
      alert("Backend unreachable. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-emerald-400">TomatoGuard AI</h1>
            <p className="text-xs text-slate-400">Multimodal Crop Health & Microclimate Decision Engine</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[160px]">{locationLabel}</span>
          </div>
        </header>

        {/* Step 1: Upload or Capture */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">1</span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Leaf Sample Capture & Upload
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 justify-center">
              
              {/* Camera Input */}
              <input 
                type="file" 
                ref={cameraInputRef}
                accept="image/*" 
                capture="environment"
                onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
                className="hidden" 
              />
              <button 
                onClick={() => cameraInputRef.current?.click()}
                type="button"
                className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo with Camera</span>
              </button>

              {/* Upload Input */}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="flex items-center justify-center space-x-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm border border-slate-700 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload from Device</span>
              </button>

              {selectedFile && (
                <div className="flex items-center justify-center space-x-1.5 p-2 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
              )}
            </div>

            {/* Dropzone / Preview */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="h-44 bg-slate-950 rounded-xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center overflow-hidden cursor-pointer p-2 transition"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Leaf Preview" className="h-full w-full object-contain rounded-lg" />
              ) : (
                <div className="text-slate-600 flex flex-col items-center text-center">
                  <ImageIcon className="w-8 h-8 mb-1.5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-400">Click to pick or drag & drop leaf</span>
                  <span className="text-[10px] text-slate-600 mt-0.5">JPG, PNG supported</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Microclimate Telemetry */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Microclimate Fusion Layer
              </h2>
            </div>
            <button
              onClick={handleGPSDetect}
              disabled={fetchingWeather}
              type="button"
              className="flex items-center space-x-1.5 text-xs bg-sky-950 border border-sky-600/40 hover:bg-sky-900 text-sky-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>{fetchingWeather ? "Syncing..." : "Sync GPS Weather"}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">Temperature: {temp}°C</label>
              <input 
                type="range" min="10" max="40" step="0.5" 
                value={temp} 
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">Canopy RH: {canopyRH}%</label>
              <input 
                type="range" min="30" max="100" 
                value={canopyRH} 
                onChange={(e) => setCanopyRH(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">Soil Moisture: {soilMoisture}%</label>
              <input 
                type="range" min="10" max="90" 
                value={soilMoisture} 
                onChange={(e) => setSoilMoisture(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <button 
            onClick={handleRunPipeline}
            disabled={loading || !selectedFile}
            type="button"
            className={`flex items-center justify-center space-x-2 w-full py-3.5 rounded-xl transition font-bold ${
              selectedFile 
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-950/40" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
            }`}
          >
            {loading ? (
              <RefreshCw className="animate-spin w-5 h-5" />
            ) : (
              <>
                <span>{selectedFile ? "Run Vision + Environmental Fusion" : "Upload an Image Above First"}</span>
                {selectedFile && <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>

        {/* Step 3: Diagnostic Results */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              result.status === "AUTO_CONFIRMED" 
                ? "bg-emerald-950/30 border-emerald-500/50" 
                : "bg-amber-950/30 border-amber-500/50"
            }`}>
              <div className="flex items-center space-x-3">
                {result.status === "AUTO_CONFIRMED" ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                )}
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Diagnosis Verdict</div>
                  <div className="text-lg font-bold">{result.disease}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-slate-400">Severity Metric</div>
                <div className="text-sm font-semibold text-amber-300">{result.severity} ({result.lesion_coverage}%)</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
                <span className="text-[11px] text-slate-400 block">1. CNN Vision</span>
                <div className="text-xl sm:text-2xl font-bold text-sky-400 mt-0.5">{(result.cnn_confidence * 100).toFixed(0)}%</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
                <span className="text-[11px] text-slate-400 block">2. Env Risk Match</span>
                <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">{(result.environmental_favorability * 100).toFixed(0)}%</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
                <span className="text-[11px] text-slate-400 block">3. Fused Score</span>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{(result.fused_confidence * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Agronomic Field Action & Reduction Plan
              </h3>
              <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-300">
                {result.advisory.map((item: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
