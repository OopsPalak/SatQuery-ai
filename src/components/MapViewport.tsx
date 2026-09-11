import React, { useState, useRef, useEffect } from 'react';
import { Crosshair, Eye, EyeOff, Sliders, Activity, Compass } from 'lucide-react';
import type { ViewModality, DatasetItem, GroundingEvidence, PixelProbeData } from '../types/remoteSensing';
import { calculatePixelProbe } from '../utils/analyticalEngine';

interface MapViewportProps {
  activeDataset: DatasetItem;
  viewModality: ViewModality;
  activeEvidence: GroundingEvidence[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (id: string | null) => void;
}

export const MapViewport: React.FC<MapViewportProps> = ({
  activeDataset,
  viewModality,
  activeEvidence,
  selectedEvidenceId,
  onSelectEvidence
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showRadarScan, setShowRadarScan] = useState<boolean>(true);
  const [showGridLines] = useState<boolean>(true);
  const [showPixelProbe, setShowPixelProbe] = useState<boolean>(true);
  const [showTechnicalNumbers, setShowTechnicalNumbers] = useState<boolean>(false);
  const [pixelProbeData, setPixelProbeData] = useState<PixelProbeData | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    if (isDraggingSplit) {
      setSplitPos(Math.max(5, Math.min(95, xPct)));
    }

    if (showPixelProbe) {
      const probe = calculatePixelProbe(xPct, yPct, activeDataset);
      setPixelProbeData(probe);
    }
  };

  const handleMouseLeave = () => {
    setIsDraggingSplit(false);
  };

  const handleMouseUp = () => {
    setIsDraggingSplit(false);
  };

  useEffect(() => {
    if (selectedEvidenceId) {
      const ev = activeEvidence.find(e => e.id === selectedEvidenceId);
      if (ev) {
        const xPct = ev.bbox[0] + ev.bbox[2] / 2;
        const yPct = ev.bbox[1] + ev.bbox[3] / 2;
        setPixelProbeData(calculatePixelProbe(xPct, yPct, activeDataset));
      }
    }
  }, [selectedEvidenceId, activeEvidence, activeDataset]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080c14] relative overflow-hidden select-none border border-[#1e2d4a] rounded-[2px]">
      {/* Viewport Control Bar */}
      <div className="bg-[#0a101d] px-3 py-1.5 border-b border-[#1e2d4a] flex items-center justify-between font-mono text-[11px] text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold font-sans">
            <Compass className="w-3.5 h-3.5" />
            <span>SATELLITE MAP VIEWER</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-sans">
            LOCATION: <span className="text-slate-100 font-semibold font-mono">{activeDataset.coordinates}</span>
          </span>
        </div>

        {/* Viewport Toggles (Layman Friendly) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`btn-tech ${
              showBoundingBoxes ? 'bg-cyan-950/60 text-cyan-400 border-cyan-700' : 'bg-transparent text-slate-500 border-slate-800'
            }`}
            title="Show or hide AI highlight boxes over targets"
          >
            {showBoundingBoxes ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
            AI Outlines ({activeEvidence.length})
          </button>

          <button
            onClick={() => setShowRadarScan(!showRadarScan)}
            className={`btn-tech ${
              showRadarScan ? 'bg-cyan-950/60 text-cyan-400 border-cyan-700' : 'bg-transparent text-slate-500 border-slate-800'
            }`}
            title="Radar pulse animation"
          >
            <Activity className="w-3 h-3" />
            Radar Sweep
          </button>

          <button
            onClick={() => setShowPixelProbe(!showPixelProbe)}
            className={`btn-tech ${
              showPixelProbe ? 'bg-[#06b6d4]/20 text-cyan-300 border-cyan-600' : 'bg-transparent text-slate-500 border-slate-800'
            }`}
            title="Hover over any spot to see what is on the ground"
          >
            <Crosshair className="w-3 h-3" />
            Hover Inspector
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#0e1626] border border-[#1e2d4a] px-2 py-0.5 rounded-[2px]">
            <button 
              onClick={() => setZoomLevel(Math.max(80, zoomLevel - 20))}
              className="text-slate-400 hover:text-white font-mono px-1 cursor-pointer"
            >-</button>
            <span className="font-mono text-[10px] text-cyan-400">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 20))}
              className="text-slate-400 hover:text-white font-mono px-1 cursor-pointer"
            >+</button>
          </div>
        </div>
      </div>

      {/* Main Map Render Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        className={`flex-1 relative overflow-hidden bg-[#05080e] ${showGridLines ? 'gis-grid-bg' : ''}`}
      >
        <div 
          className="w-full h-full relative transition-transform duration-200 origin-center"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {/* Base Layer Images */}
          {viewModality === 'optical' && (
            <img 
              src={activeDataset.opticalImageUrl} 
              alt="Standard Photo Satellite View" 
              className="w-full h-full object-cover block"
            />
          )}

          {viewModality === 'sar' && (
            <img 
              src={activeDataset.sarImageUrl} 
              alt="Radar Cloud-Free View" 
              className="w-full h-full object-cover block filter contrast-125"
            />
          )}

          {viewModality === 'fusion' && (
            <div className="w-full h-full relative">
              <img 
                src={activeDataset.opticalImageUrl} 
                alt="Optical Base" 
                className="w-full h-full object-cover block"
              />
              <img 
                src={activeDataset.sarImageUrl} 
                alt="SAR Overlay" 
                className="w-full h-full object-cover block absolute top-0 left-0 mix-blend-screen opacity-70"
              />
            </div>
          )}

          {/* Side-by-Side Slider Mode */}
          {viewModality === 'split' && (
            <div className="w-full h-full relative overflow-hidden">
              <img 
                src={activeDataset.opticalImageUrl} 
                alt="Standard Photo View" 
                className="w-full h-full object-cover absolute top-0 left-0"
              />

              <div 
                className="w-full h-full absolute top-0 left-0 overflow-hidden border-l-2 border-cyan-400"
                style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
              >
                <img 
                  src={activeDataset.sarImageUrl} 
                  alt="Radar Cloud-Free View" 
                  className="w-full h-full object-cover block filter contrast-125"
                />
              </div>

              {/* Slider Drag Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_#06b6d4] cursor-col-resize z-30 flex items-center justify-center"
                style={{ left: `${splitPos}%` }}
                onMouseDown={() => setIsDraggingSplit(true)}
              >
                <div className="bg-[#0a101d] border-2 border-cyan-400 text-cyan-400 p-1.5 rounded-[2px] shadow-lg flex items-center justify-center gap-1 font-sans text-[10px] font-bold uppercase tracking-tight">
                  <Sliders className="w-3 h-3 rotate-90" />
                  <span>DRAG SLIDER</span>
                </div>
              </div>

              <div className="absolute top-3 left-3 bg-[#0a101d]/90 border border-blue-600/50 px-2.5 py-1 text-blue-300 font-sans text-[11px] font-semibold uppercase rounded-[2px] z-20">
                STANDARD PHOTO VIEW
              </div>
              <div className="absolute top-3 right-3 bg-[#0a101d]/90 border border-cyan-600/50 px-2.5 py-1 text-cyan-300 font-sans text-[11px] font-semibold uppercase rounded-[2px] z-20">
                RADAR VIEW (CLOUD-FREE)
              </div>
            </div>
          )}

          {showRadarScan && <div className="radar-scan-line" />}

          {/* AI Grounding Bounding Box Overlays */}
          {showBoundingBoxes && activeEvidence.map((ev) => {
            const isSelected = ev.id === selectedEvidenceId;
            const [x, y, w, h] = ev.bbox;

            let borderColor = 'border-cyan-400 bg-cyan-500/10 text-cyan-300';
            if (ev.category === 'vessel') borderColor = 'border-amber-400 bg-amber-500/15 text-amber-300';
            if (ev.category === 'flood_inundation') borderColor = 'border-blue-400 bg-blue-500/15 text-blue-300';

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvidence(ev.id)}
                className={`absolute border-2 transition-all cursor-pointer z-20 ${borderColor} ${
                  isSelected ? 'ring-2 ring-white ring-offset-1 scale-[1.01] shadow-[0_0_15px_rgba(6,182,212,0.6)] z-30' : 'hover:border-white'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                }}
              >
                {/* Crosshair corners */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                {/* Friendly Label Badge */}
                <div className="absolute -top-6 left-0 bg-[#0a101d] border border-[#1e2d4a] px-1.5 py-0.5 text-[10px] font-sans whitespace-nowrap flex items-center gap-1.5 rounded-[2px] shadow-md">
                  <span className="font-bold text-white uppercase">{ev.label}</span>
                  <span className="text-emerald-400 bg-emerald-950/80 px-1 border border-emerald-800 font-mono">
                    {(ev.confidence * 100).toFixed(0)}% CERTAIN
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Layman Hover Inspector HUD Overlay */}
        {showPixelProbe && pixelProbeData && (
          <div className="absolute bottom-3 left-3 bg-[#0a101d]/95 border border-[#1e2d4a] p-3 rounded-[2px] shadow-2xl font-sans text-xs text-slate-200 z-30 max-w-[340px] pointer-events-auto backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#1e2d4a] pb-1.5 mb-2 text-cyan-400 font-bold tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>HOVER INSPECTOR</span>
              </span>
              <button 
                onClick={() => setShowTechnicalNumbers(!showTechnicalNumbers)}
                className="text-[9.5px] font-mono text-slate-400 hover:text-cyan-300 underline cursor-pointer"
              >
                {showTechnicalNumbers ? 'Hide Numbers' : 'Show GIS Values'}
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="bg-[#080c14] border border-[#1e2d4a] p-1.5 rounded-[2px] flex items-center justify-between">
                <span className="text-slate-400">SPOT FEATURE:</span>
                <strong className="text-amber-400 font-semibold">{pixelProbeData.laymanGroundType}</strong>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                <div className="bg-[#080c14] border border-[#1e2d4a] p-1.5 rounded-[2px]">
                  <div className="text-slate-400 text-[9.5px]">WATER CONTENT:</div>
                  <div className="text-blue-400 font-semibold">{pixelProbeData.laymanWaterIndexText}</div>
                </div>

                <div className="bg-[#080c14] border border-[#1e2d4a] p-1.5 rounded-[2px]">
                  <div className="text-slate-400 text-[9.5px]">PLANT HEALTH:</div>
                  <div className="text-emerald-400 font-semibold">{pixelProbeData.laymanPlantHealthText}</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                LAT/LON: {pixelProbeData.lat.toFixed(4)}° N, {pixelProbeData.lon.toFixed(4)}° E | ELEV: {pixelProbeData.elevationMeters}m
              </div>

              {/* Optional Advanced Technical Telemetry Toggle */}
              {showTechnicalNumbers && (
                <div className="bg-[#080c14] border border-[#1e2d4a] p-2 rounded-[2px] font-mono text-[9.5px] text-slate-400 space-y-1 pt-1 border-t">
                  <div>SAR VV Backscatter: <strong className="text-cyan-300">{pixelProbeData.sarVv_dB} dB</strong></div>
                  <div>NDWI Water Index: <strong className="text-blue-300">+{pixelProbeData.ndwi}</strong></div>
                  <div>NDVI Plant Index: <strong className="text-emerald-300">+{pixelProbeData.ndvi}</strong></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Viewport Watermark Badge */}
        <div className="absolute top-3 right-3 bg-[#0a101d]/90 border border-[#1e2d4a] px-2.5 py-1 text-right font-sans text-[10px] z-20 rounded-[2px]">
          <div className="text-cyan-400 font-bold tracking-wider uppercase">
            ACTIVE VIEW: {viewModality === 'optical' ? 'Standard Photo' : viewModality === 'sar' ? 'Radar (Cloud-Free)' : viewModality === 'fusion' ? 'Smart Combined' : 'Side-by-Side'}
          </div>
        </div>
      </div>

      {/* Simplified Footer Telemetry */}
      <div className="bg-[#0a101d] px-3 py-1.5 border-t border-[#1e2d4a] flex flex-wrap items-center justify-between font-sans text-[11px] text-slate-300">
        <div>
          SATELLITE PHOTO: <span className="text-slate-100 font-mono">{activeDataset.opticalMetadata.satelliteName}</span>
        </div>
        <div>
          RADAR SATELLITE: <span className="text-cyan-400 font-mono">{activeDataset.sarMetadata.satelliteName}</span>
        </div>
        <div className="text-slate-400">
          CAPTURED: <span className="text-slate-200 font-mono">{activeDataset.sarMetadata.acquisitionDate}</span>
        </div>
      </div>
    </div>
  );
};
