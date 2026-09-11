import React, { useState } from 'react';
import { X, Database, Upload, Layers, Activity, Plus } from 'lucide-react';
import type { DatasetItem, Polarization } from '../types/remoteSensing';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

interface DatasetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeDatasetId: string;
  onSelectDataset: (dataset: DatasetItem) => void;
  onAddCustomDataset: (dataset: DatasetItem) => void;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  isOpen,
  onClose,
  activeDatasetId,
  onSelectDataset,
  onAddCustomDataset
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'custom'>('sample');

  const [customTitle, setCustomTitle] = useState('');
  const [customRegion, setCustomRegion] = useState('');
  const customOpticalSat = 'Sentinel-2 Photo Satellite';
  const customSarSat = 'Sentinel-1 Radar Satellite';
  const customPolarization: Polarization = 'VV+VH';
  const [customOpticalFile, setCustomOpticalFile] = useState<File | null>(null);
  const [customSarFile, setCustomSarFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customRegion) return;

    const opticalUrl = customOpticalFile
      ? URL.createObjectURL(customOpticalFile)
      : SAMPLE_DATASETS[0].opticalImageUrl;

    const sarUrl = customSarFile
      ? URL.createObjectURL(customSarFile)
      : SAMPLE_DATASETS[0].sarImageUrl;

    const newDataset: DatasetItem = {
      id: `custom-ds-${Date.now()}`,
      title: customTitle,
      region: customRegion,
      coordinates: '28.6139° N, 77.2090° E',
      description: `Custom ingested dataset for ${customTitle} (${customRegion})`,
      laymanSummary: `User-uploaded satellite imagery for ${customTitle} in ${customRegion}.`,
      isCustom: true,
      opticalImageUrl: opticalUrl,
      sarImageUrl: sarUrl,
      opticalMetadata: {
        satelliteName: customOpticalSat,
        agency: 'USER UPLOADED',
        acquisitionDate: new Date().toISOString().replace('T', ' ').substring(0, 10),
        resolution: '10-meter clarity',
        bands: ['RGB Photo'],
        crs: 'EPSG:4326',
        bounds: { minLat: 28.5, maxLat: 28.7, minLon: 77.1, maxLon: 77.3 },
        laymanSensorDescription: 'User-uploaded optical camera photo view.'
      },
      sarMetadata: {
        satelliteName: customSarSat,
        agency: 'USER UPLOADED',
        acquisitionDate: new Date().toISOString().replace('T', ' ').substring(0, 10),
        resolution: '5-meter detail',
        incidenceAngle: '38.0°',
        polarization: customPolarization,
        orbitDirection: 'Ascending',
        crs: 'EPSG:4326',
        bounds: { minLat: 28.5, maxLat: 28.7, minLon: 77.1, maxLon: 77.3 },
        laymanSensorDescription: 'User-uploaded radar image for cloud-free inspection.'
      },
      presetQueries: [
        `Where are the main ground features located in ${customTitle}?`,
        `Show me areas where clouds block the photo but radar sees clearly.`
      ],
      groundTruthObjects: [
        {
          id: `custom-gt-1`,
          label: `${customTitle} Main Ground Target`,
          category: 'anomaly',
          laymanCategory: 'Uploaded Target Feature',
          confidence: 0.92,
          iouScore: 0.88,
          bbox: [30, 30, 25, 25],
          coordinates: { lat: 28.61, lon: 77.20 },
          sarBackscatter: { vv_dB: -15.4, vh_dB: -22.1, ratio_dB: 6.7, coherence: 0.75 },
          opticalReflection: { rgb: '#38bdf8', nirValue: 0.45, ndvi: 0.32, ndwi: -0.10 },
          evidenceDescription: `Custom target object isolated via user-uploaded rasters.`,
          laymanExplanation: `Target detected in your uploaded satellite files.`,
          laymanGroundType: `Custom Ingested Ground Feature`
        }
      ]
    };

    onAddCustomDataset(newDataset);
    onSelectDataset(newDataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#0a101d] border border-[#1e2d4a] w-full max-w-[780px] max-h-[85vh] flex flex-col font-sans rounded-[2px] shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#0e1626] px-4 py-3 border-b border-[#1e2d4a] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Database className="w-4 h-4 text-amber-400" />
            <span>SATELLITE SCENARIO LIBRARY</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-[2px] hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Header Tabs */}
        <div className="flex items-center border-b border-[#1e2d4a] bg-[#080c14] px-4 font-sans text-xs">
          <button
            onClick={() => setActiveTab('sample')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sample'
                ? 'border-cyan-400 text-cyan-400 bg-[#0e1626]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            CURATED ISRO SCENARIOS ({SAMPLE_DATASETS.length})
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'border-cyan-400 text-cyan-400 bg-[#0e1626]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            UPLOAD YOUR OWN SATELLITE IMAGE
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080c14] font-sans">
          {activeTab === 'sample' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAMPLE_DATASETS.map((ds) => {
                const isActive = ds.id === activeDatasetId;

                return (
                  <div
                    key={ds.id}
                    onClick={() => {
                      onSelectDataset(ds);
                      onClose();
                    }}
                    className={`p-3 bg-[#0e1626] border rounded-[2px] transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-cyan-400 ring-1 ring-cyan-400 bg-[#121c30]'
                        : 'border-[#1e2d4a] hover:border-slate-500'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-sans text-xs">
                        <span className="font-bold text-slate-100 line-clamp-1">{ds.title}</span>
                        {isActive && (
                          <span className="text-cyan-400 font-bold text-[10px] font-mono bg-cyan-950/80 px-1.5 py-0.2 border border-cyan-800 shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-[10.5px] text-cyan-400">
                        {ds.region}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                        {ds.laymanSummary || ds.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#1e2d4a] grid grid-cols-2 gap-2 font-mono text-[9.5px] text-slate-400">
                      <div>PHOTO: <strong className="text-blue-400">{ds.opticalMetadata.satelliteName}</strong></div>
                      <div>RADAR: <strong className="text-cyan-400">{ds.sarMetadata.satelliteName}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 font-sans text-xs text-slate-200">
              <div className="bg-[#0e1626] border border-[#1e2d4a] p-3 rounded-[2px] space-y-3">
                <div className="text-cyan-400 font-bold text-xs uppercase border-b border-[#1e2d4a] pb-1.5 font-mono">
                  1. SATELLITE IMAGE DETAILS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">SCENARIO TITLE</label>
                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Flood Monitoring in Kerala"
                      className="w-full bg-[#080c14] border border-[#1e2d4a] text-slate-200 p-2 rounded-[2px] focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">LOCATION / CITY</label>
                    <input
                      type="text"
                      required
                      value={customRegion}
                      onChange={(e) => setCustomRegion(e.target.value)}
                      placeholder="e.g. Kochi, Kerala"
                      className="w-full bg-[#080c14] border border-[#1e2d4a] text-slate-200 p-2 rounded-[2px] focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#0e1626] border border-[#1e2d4a] p-3 rounded-[2px] space-y-2">
                  <div className="text-blue-400 font-bold text-xs uppercase flex items-center gap-1.5 font-mono">
                    <Layers className="w-4 h-4" />
                    <span>STANDARD PHOTO FILE (PNG/JPG/GEOTIFF)</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.tif,.tiff"
                    onChange={(e) => setCustomOpticalFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-[2px] file:border file:border-blue-800 file:bg-blue-950/60 file:text-blue-300 font-mono"
                  />
                </div>

                <div className="bg-[#0e1626] border border-[#1e2d4a] p-3 rounded-[2px] space-y-2">
                  <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5 font-mono">
                    <Activity className="w-4 h-4" />
                    <span>RADAR IMAGE FILE (PNG/JPG/GEOTIFF)</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.tif,.tiff"
                    onChange={(e) => setCustomSarFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-[2px] file:border file:border-cyan-800 file:bg-cyan-950/60 file:text-cyan-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-tech-secondary"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="btn-tech-primary font-semibold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  LOAD SATELLITE IMAGE
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
