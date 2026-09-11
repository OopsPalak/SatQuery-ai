import type { DatasetItem } from '../types/remoteSensing';

// SVG generator functions for high-quality Optical & SAR rasters
function createOpticalSvg(title: string, type: 'flood' | 'vessel' | 'urban' | 'agri' | 'landslide'): string {
  let content = '';
  if (type === 'flood') {
    content = `
      <rect width="800" height="600" fill="#1b382b" />
      <path d="M0,0 L800,0 L800,200 L0,300 Z" fill="#2d5a3f" />
      <path d="M100,100 Q300,50 500,180 T800,120 L800,0 L0,0 Z" fill="#1e442f" />
      <path d="M0,250 Q200,220 450,320 T800,400 L800,600 L0,600 Z" fill="#203a43" />
      <path d="M150,300 C300,280 400,450 650,420 C750,400 800,550 800,600 L0,600 Z" fill="#152938" />
      <rect x="50" y="320" width="120" height="80" fill="#2b4c3b" stroke="#3d6650" stroke-width="2" opacity="0.7"/>
      <rect x="190" y="340" width="140" height="90" fill="#1d352b" stroke="#3d6650" stroke-width="2" opacity="0.8"/>
      <rect x="360" y="380" width="160" height="110" fill="#142631" stroke="#254752" stroke-width="2" opacity="0.9"/>
      <rect x="540" y="440" width="180" height="100" fill="#0f1d26" stroke="#254752" stroke-width="2" opacity="0.9"/>
      <ellipse cx="320" cy="270" rx="90" ry="25" fill="#5a523b" />
      <ellipse cx="620" cy="350" rx="110" ry="30" fill="#685d43" />
      <ellipse cx="200" cy="80" rx="180" ry="50" fill="#ffffff" opacity="0.15" />
      <ellipse cx="650" cy="140" rx="220" ry="70" fill="#ffffff" opacity="0.2" />
    `;
  } else if (type === 'vessel') {
    content = `
      <rect width="800" height="600" fill="#0b1d28" />
      <path d="M0,0 L800,0 L800,600 L0,600 Z" fill="#0c2332" />
      <path d="M0,0 L350,0 C320,150 280,300 200,450 L0,600 Z" fill="#1c2b36" />
      <path d="M200,450 L380,380 L320,320 L160,390 Z" fill="#334756" />
      <path d="M260,250 L460,180 L420,130 L220,200 Z" fill="#334756" />
      <g transform="translate(520, 240) rotate(25)">
        <polygon points="0,-35 12,-15 12,35 -12,35 -12,-15" fill="#e76f51" />
        <rect x="-8" y="-10" width="16" height="35" fill="#2a9d8f" />
      </g>
      <g transform="translate(610, 410) rotate(-40)">
        <polygon points="0,-45 15,-20 15,45 -15,45 -15,-20" fill="#e9c46a" />
        <rect x="-10" y="-15" width="20" height="50" fill="#d4a373" />
      </g>
      <g transform="translate(420, 480) rotate(10)">
        <polygon points="0,-18 7,-8 7,18 -7,18 -7,-8" fill="#f4a261" />
      </g>
      <circle cx="500" cy="180" r="160" fill="#ffffff" opacity="0.35" />
      <circle cx="620" cy="220" r="140" fill="#ffffff" opacity="0.4" />
    `;
  } else if (type === 'urban') {
    content = `
      <rect width="800" height="600" fill="#1e242b" />
      <path d="M0,300 L800,300" stroke="#485460" stroke-width="18" />
      <path d="M400,0 L400,600" stroke="#485460" stroke-width="14" />
      <path d="M100,0 L700,600" stroke="#3d4852" stroke-width="8" />
      <ellipse cx="620" cy="160" rx="110" ry="70" fill="#0f2b3c" stroke="#1d4d68" stroke-width="3" />
      <ellipse cx="220" cy="460" rx="90" ry="50" fill="#0f2b3c" stroke="#1d4d68" stroke-width="3" />
      <g fill="#576574" stroke="#8395a7" stroke-width="1">
        <rect x="50" y="50" width="80" height="60" />
        <rect x="150" y="40" width="100" height="90" />
        <rect x="60" y="140" width="120" height="80" />
        <rect x="450" y="80" width="110" height="140" fill="#8395a7" />
        <rect x="480" y="340" width="140" height="100" />
        <rect x="650" y="320" width="110" height="160" fill="#8395a7" />
        <rect x="260" y="340" width="90" height="80" />
        <rect x="100" y="350" width="80" height="80" />
      </g>
      <rect x="280" y="60" width="120" height="180" fill="#2e5138" rx="5" />
    `;
  } else if (type === 'agri') {
    content = `
      <rect width="800" height="600" fill="#1b2e1b" />
      <g stroke="#2d4a2d" stroke-width="2">
        <rect x="20" y="20" width="180" height="130" fill="#3a6b35" />
        <rect x="210" y="20" width="220" height="130" fill="#4d8b43" />
        <rect x="440" y="20" width="170" height="130" fill="#2d5229" />
        <rect x="620" y="20" width="160" height="130" fill="#5fa453" />
        
        <rect x="20" y="160" width="240" height="180" fill="#529447" />
        <rect x="270" y="160" width="190" height="180" fill="#335c2e" />
        <rect x="470" y="160" width="310" height="180" fill="#437a3a" />

        <rect x="20" y="350" width="300" height="230" fill="#294625" />
        <rect x="330" y="350" width="220" height="230" fill="#5ca750" />
        <rect x="560" y="350" width="220" height="230" fill="#3d7034" />
      </g>
      <path d="M0,155 L800,155" stroke="#1d4e6d" stroke-width="8" />
      <path d="M265,0 L265,600" stroke="#1d4e6d" stroke-width="6" />
    `;
  } else {
    content = `
      <rect width="800" height="600" fill="#2b261f" />
      <path d="M0,0 L400,250 L800,0 Z" fill="#1c1813" />
      <path d="M0,600 L350,300 L800,600 Z" fill="#1c1813" />
      <path d="M300,180 Q450,220 520,380 T380,520 Z" fill="#6e5843" stroke="#8c7258" stroke-width="3" />
      <path d="M380,450 C480,480 580,530 650,600 L250,600 Z" fill="#524334" opacity="0.9" />
      <path d="M0,0 L300,180 L0,400 Z" fill="#2d3d29" />
      <path d="M520,380 L800,0 L800,500 Z" fill="#253322" />
      <path d="M0,420 Q350,380 800,460" stroke="#7f8c8d" stroke-width="6" fill="none" stroke-dasharray="15,5" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    ${content}
    <text x="15" y="585" fill="#ffffff" font-family="monospace" font-size="12" opacity="0.6">${title} | STANDARD PHOTO VIEW</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createSarSvg(title: string, type: 'flood' | 'vessel' | 'urban' | 'agri' | 'landslide'): string {
  let content = '';
  if (type === 'flood') {
    content = `
      <rect width="800" height="600" fill="#12161f" />
      <filter id="speckle">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.15 0"/>
      </filter>
      <rect width="800" height="600" filter="url(#speckle)" />
      <path d="M0,0 L800,0 L800,200 L0,300 Z" fill="#4a5568" opacity="0.6" />
      <path d="M100,100 Q300,50 500,180 T800,120 L800,0 L0,0 Z" fill="#718096" opacity="0.7" />
      <path d="M0,250 Q200,220 450,320 T800,400 L800,600 L0,600 Z" fill="#030712" />
      <path d="M150,300 C300,280 400,450 650,420 C750,400 800,550 800,600 L0,600 Z" fill="#020617" />
      <path d="M50,320 L170,320 L170,400 L50,400 Z" fill="#030712" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="4,2"/>
      <path d="M190,340 L330,340 L330,430 L190,430 Z" fill="#030712" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="500" y="50" fill="#06b6d4" font-family="sans-serif" font-size="11">[RADAR PENETRATES CLOUDS: 100% CLEAR]</text>
    `;
  } else if (type === 'vessel') {
    content = `
      <rect width="800" height="600" fill="#050a14" />
      <rect width="800" height="600" fill="#0f172a" />
      <path d="M0,0 L350,0 C320,150 280,300 200,450 L0,600 Z" fill="#334155" />
      <path d="M200,450 L380,380 L320,320 L160,390 Z" fill="#94a3b8" />
      <path d="M260,250 L460,180 L420,130 L220,200 Z" fill="#94a3b8" />
      <g transform="translate(520, 240) rotate(25)">
        <polygon points="0,-35 12,-15 12,35 -12,35 -12,-15" fill="#ffffff" stroke="#06b6d4" stroke-width="4" />
        <circle cx="0" cy="0" r="25" fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.8"/>
      </g>
      <g transform="translate(610, 410) rotate(-40)">
        <polygon points="0,-45 15,-20 15,45 -15,45 -15,-20" fill="#ffffff" stroke="#06b6d4" stroke-width="4" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.8"/>
      </g>
      <g transform="translate(420, 480) rotate(10)">
        <polygon points="0,-18 7,-8 7,18 -7,18 -7,-8" fill="#ffffff" stroke="#f59e0b" stroke-width="3" />
      </g>
      <g transform="translate(560, 160) rotate(60)">
        <polygon points="0,-25 10,-10 10,25 -10,25 -10,-10" fill="#ffffff" stroke="#10b981" stroke-width="4" />
        <text x="18" y="5" fill="#10b981" font-family="sans-serif" font-size="10">HIDDEN SHIP SEEN BY RADAR</text>
      </g>
    `;
  } else if (type === 'urban') {
    content = `
      <rect width="800" height="600" fill="#090d16" />
      <ellipse cx="620" cy="160" rx="110" ry="70" fill="#020617" stroke="#1e293b" stroke-width="2" />
      <ellipse cx="220" cy="460" rx="90" ry="50" fill="#020617" stroke="#1e293b" stroke-width="2" />
      <g fill="#ffffff" stroke="#06b6d4" stroke-width="1.5">
        <rect x="50" y="50" width="80" height="60" />
        <rect x="150" y="40" width="100" height="90" />
        <rect x="60" y="140" width="120" height="80" />
        <rect x="450" y="80" width="110" height="140" fill="#38bdf8" />
        <rect x="480" y="340" width="140" height="100" />
        <rect x="650" y="320" width="110" height="160" fill="#38bdf8" />
        <rect x="260" y="340" width="90" height="80" />
        <rect x="100" y="350" width="80" height="80" />
      </g>
    `;
  } else if (type === 'agri') {
    content = `
      <rect width="800" height="600" fill="#0f172a" />
      <g stroke="#334155" stroke-width="2">
        <rect x="20" y="20" width="180" height="130" fill="#1e293b" />
        <rect x="210" y="20" width="220" height="130" fill="#475569" />
        <rect x="440" y="20" width="170" height="130" fill="#0f172a" />
        <rect x="620" y="20" width="160" height="130" fill="#64748b" />
        
        <rect x="20" y="160" width="240" height="180" fill="#475569" />
        <rect x="270" y="160" width="190" height="180" fill="#1e293b" />
        <rect x="470" y="160" width="310" height="180" fill="#334155" />

        <rect x="20" y="350" width="300" height="230" fill="#0f172a" />
        <rect x="330" y="350" width="220" height="230" fill="#64748b" />
        <rect x="560" y="350" width="220" height="230" fill="#334155" />
      </g>
      <path d="M0,155 L800,155" stroke="#020617" stroke-width="8" />
      <path d="M265,0 L265,600" stroke="#020617" stroke-width="6" />
    `;
  } else {
    content = `
      <rect width="800" height="600" fill="#0b0f19" />
      <path d="M0,0 L800,0 L800,600 L0,600 Z" fill="#1e293b" />
      <path d="M300,180 Q450,220 520,380 T380,520 Z" fill="#020617" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,3" />
      <text x="340" y="260" fill="#f59e0b" font-family="sans-serif" font-size="12">SLIDING LAND DEBRIS ZONE</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    ${content}
    <text x="15" y="585" fill="#06b6d4" font-family="sans-serif" font-size="12" opacity="0.9">${title} | ALL-WEATHER RADAR VIEW</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_DATASETS: DatasetItem[] = [
  {
    id: 'ds-kaziranga-flood-2026',
    title: 'Assam Flood & Submerged Paddy Crop Analysis',
    region: 'Kaziranga National Park & Brahmaputra Basin, Assam',
    coordinates: '26.5775° N, 93.1711° E',
    description: 'Monsoon flood mapping over Assam farmlands comparing optical photo view with all-weather radar to pinpoint submerged crops.',
    laymanSummary: 'This satellite scene monitors severe monsoon flooding along the Brahmaputra river. Standard optical photos are partially blocked by clouds, but radar microwaves pierce straight through the cloud cover to outline every flooded farm field.',
    opticalImageUrl: createOpticalSvg('ASSAM-FLOODS', 'flood'),
    sarImageUrl: createSarSvg('ASSAM-RADAR', 'flood'),
    opticalMetadata: {
      satelliteName: 'Sentinel-2 / ISRO Resourcesat-2',
      agency: 'ISRO / ESA',
      acquisitionDate: '2026-08-14 (Morning Capture)',
      resolution: '10-meter crisp clarity',
      bands: ['Red', 'Green', 'Blue', 'Near-Infrared (Plant Health)'],
      crs: 'EPSG:4326 (Standard Map Projection)',
      bounds: { minLat: 26.45, maxLat: 26.70, minLon: 93.00, maxLon: 93.35 },
      laymanSensorDescription: 'Standard Earth observation camera capturing natural colors and plant infrared light.'
    },
    sarMetadata: {
      satelliteName: 'Sentinel-1 Radar Satellite',
      agency: 'ESA / ISRO Space Centre',
      acquisitionDate: '2026-08-14 (Evening Radar Pass)',
      resolution: '5-meter detail',
      incidenceAngle: '38° inclination',
      polarization: 'VV+VH',
      orbitDirection: 'Descending',
      crs: 'EPSG:4326 (Standard Map Projection)',
      bounds: { minLat: 26.45, maxLat: 26.70, minLon: 93.00, maxLon: 93.35 },
      laymanSensorDescription: 'All-weather active radar pulse satellite. It bounces radio waves off the Earth to see water, buildings, and ground roughness regardless of clouds or night.'
    },
    presetQueries: [
      'Where are the flooded agricultural fields and how deep is the water?',
      'Show me areas where clouds block the photo camera but radar can see clearly.',
      'Which crop fields are completely under water right now?',
      'Calculate the total flooded farmland area in acres.'
    ],
    groundTruthObjects: [
      {
        id: 'gt-flood-01',
        label: 'Submerged Rice Paddy Field A',
        category: 'flood_inundation',
        laymanCategory: 'Flooded Farmland',
        confidence: 0.96,
        iouScore: 0.91,
        bbox: [18, 52, 18, 15],
        coordinates: { lat: 26.542, lon: 93.125 },
        opticalReflection: { rgb: '#1d352b', nirValue: 0.12, ndvi: -0.15, ndwi: 0.68 },
        sarBackscatter: { vv_dB: -22.4, vh_dB: -28.1, ratio_dB: 5.7, coherence: 0.14 },
        evidenceDescription: 'Smooth water surface bounces radar signals away, producing a dark signal (-22.4 dB). Water index (NDWI) is +0.68.',
        laymanExplanation: 'The radar beam bounced off flat standing water like a mirror into space, creating a dark patch. This proves this rice paddy is fully submerged under water.',
        laymanGroundType: 'Flooded Rice Field (Standing Water)'
      },
      {
        id: 'gt-flood-02',
        label: 'Brahmaputra River Flood Extension',
        category: 'flood_inundation',
        laymanCategory: 'River Overflow Zone',
        confidence: 0.98,
        iouScore: 0.95,
        bbox: [45, 63, 22, 18],
        coordinates: { lat: 26.581, lon: 93.210 },
        opticalReflection: { rgb: '#142631', nirValue: 0.08, ndvi: -0.28, ndwi: 0.82 },
        sarBackscatter: { vv_dB: -24.8, vh_dB: -30.5, ratio_dB: 5.7, coherence: 0.08 },
        evidenceDescription: 'Main river channel overflow with high water index (+0.82) and zero radar coherence.',
        laymanExplanation: 'The main river breached its natural embankments and spread over nearby lowlands.',
        laymanGroundType: 'Overflowing River Stream'
      },
      {
        id: 'gt-flood-03',
        label: 'Flooded Road Levee Structure',
        category: 'building_structure',
        laymanCategory: 'Road & Embankment',
        confidence: 0.88,
        iouScore: 0.84,
        bbox: [67, 73, 23, 16],
        coordinates: { lat: 26.615, lon: 93.290 },
        opticalReflection: { rgb: '#0f1d26', nirValue: 0.18, ndvi: 0.05, ndwi: 0.45 },
        sarBackscatter: { vv_dB: -17.1, vh_dB: -24.0, ratio_dB: 6.9, coherence: 0.22 },
        evidenceDescription: 'Elevated dirt road sticking out slightly above surrounding flood waters.',
        laymanExplanation: 'This raised dirt embankment is partially above water, reflecting a faint radar echo.',
        laymanGroundType: 'Partially Submerged Dirt Road'
      }
    ]
  },
  {
    id: 'ds-mumbai-maritime-vessel-2026',
    title: 'Mumbai Offshore Harbor Ships & Cloud-Penetration',
    region: 'Mumbai Port & Coastline, Maharashtra',
    coordinates: '18.9400° N, 72.8500° E',
    description: 'Surveillance of cargo ships and ocean vessels in Mumbai harbor, demonstrating radar penetrating heavy monsoon cloud cover.',
    laymanSummary: 'Monsoon clouds frequently block standard optical cameras over Mumbai harbor. Radar pulses cut through thick clouds to highlight every metal ship as a bright glowing point.',
    opticalImageUrl: createOpticalSvg('MUMBAI-PHOTO', 'vessel'),
    sarImageUrl: createSarSvg('MUMBAI-RADAR', 'vessel'),
    opticalMetadata: {
      satelliteName: 'Cartosat-3 / Sentinel-2',
      agency: 'ISRO / ESA',
      acquisitionDate: '2026-07-22 (Daytime Capture)',
      resolution: '0.25-meter high resolution',
      bands: ['Visible Color'],
      crs: 'EPSG:4326',
      bounds: { minLat: 18.85, maxLat: 19.05, minLon: 72.75, maxLon: 72.95 },
      laymanSensorDescription: 'High-detail camera capturing visible colors. Obscured by monsoon clouds.'
    },
    sarMetadata: {
      satelliteName: 'ISRO RISAT-1A / Sentinel-1 Radar',
      agency: 'ISRO Space Applications Centre (SAC)',
      acquisitionDate: '2026-07-22 (Evening Pass)',
      resolution: '3-meter radar detail',
      incidenceAngle: '41°',
      polarization: 'VV',
      orbitDirection: 'Ascending',
      crs: 'EPSG:4326',
      bounds: { minLat: 18.85, maxLat: 19.05, minLon: 72.75, maxLon: 72.95 },
      laymanSensorDescription: 'Radar satellite pulse. Metal ship hulls act like bright mirrors, reflecting radio signals strongly back to the satellite.'
    },
    presetQueries: [
      'Show me all cargo ships in the harbor even if hidden under thick clouds.',
      'Which ships are visible in both the regular photo and the radar view?',
      'Identify small fishing boats vs large container ships in the port.',
      'Are there any oil slick spills or smooth water damping patches?'
    ],
    groundTruthObjects: [
      {
        id: 'gt-vessel-01',
        label: 'Large Container Cargo Ship (240 meters)',
        category: 'vessel',
        laymanCategory: 'Cargo Container Ship',
        confidence: 0.97,
        iouScore: 0.94,
        bbox: [62, 38, 8, 12],
        coordinates: { lat: 18.925, lon: 72.842 },
        opticalReflection: { rgb: '#e76f51', nirValue: 0.42, ndvi: 0.12, ndwi: -0.32 },
        sarBackscatter: { vv_dB: +24.6, vh_dB: +16.2, ratio_dB: 8.4, coherence: 0.92 },
        evidenceDescription: 'Metallic hull wall creates intense double-bounce radar echo (+24.6 dB).',
        laymanExplanation: 'The vertical steel walls of this 240-meter container ship bounced the radar signal straight back, creating a bright spot on the radar map.',
        laymanGroundType: 'Steel Container Ship Hull'
      },
      {
        id: 'gt-vessel-02',
        label: 'Oil Tanker Ship (310 meters)',
        category: 'vessel',
        laymanCategory: 'Oil Tanker Vessel',
        confidence: 0.99,
        iouScore: 0.96,
        bbox: [73, 65, 9, 14],
        coordinates: { lat: 18.892, lon: 72.880 },
        opticalReflection: { rgb: '#e9c46a', nirValue: 0.38, ndvi: 0.08, ndwi: -0.28 },
        sarBackscatter: { vv_dB: +27.2, vh_dB: +18.9, ratio_dB: 8.3, coherence: 0.95 },
        evidenceDescription: 'Extreme radar echo (+27.2 dB) with clear bow wave disturbance on water.',
        laymanExplanation: 'Super-tanker ship sitting in deep anchorage water, creating strong radar reflections.',
        laymanGroundType: 'Large Ocean Crude Oil Tanker'
      },
      {
        id: 'gt-vessel-03',
        label: 'Cloud-Covered Patrol Boat',
        category: 'vessel',
        laymanCategory: 'Ship Under Cloud Cover',
        confidence: 0.94,
        iouScore: 0.89,
        bbox: [68, 25, 7, 10],
        coordinates: { lat: 18.960, lon: 72.865 },
        opticalReflection: { rgb: '#ffffff', nirValue: 0.85, ndvi: 0.0, ndwi: 0.0 },
        sarBackscatter: { vv_dB: +21.4, vh_dB: +14.1, ratio_dB: 7.3, coherence: 0.88 },
        evidenceDescription: 'Target hidden under 35% optical cloud cover; clearly isolated by radar.',
        laymanExplanation: 'This boat is completely covered by thick white clouds in the regular photo, but the radar microwave easily sees through the clouds and reveals the ship.',
        laymanGroundType: 'Coastal Patrol Boat (Cloud-Obscured)'
      }
    ]
  },
  {
    id: 'ds-bengaluru-urban-2026',
    title: 'Bengaluru Building Sprawl & Wetland Lake Buffer',
    region: 'Bengaluru Tech Corridor, Karnataka',
    coordinates: '12.9716° N, 77.5946° E',
    description: 'Monitoring urban growth, high-rise office towers, and lake conservation zones in Bengaluru.',
    laymanSummary: 'Uses satellite photos and radar to identify concrete buildings, tech parks, and green lake buffers to ensure urban construction is not encroaching into protected wetlands.',
    opticalImageUrl: createOpticalSvg('BENGALURU-CITY', 'urban'),
    sarImageUrl: createSarSvg('BENGALURU-RADAR', 'urban'),
    opticalMetadata: {
      satelliteName: 'Cartosat-2S / Resourcesat-2',
      agency: 'ISRO',
      acquisitionDate: '2026-03-10',
      resolution: '2.5-meter detail',
      bands: ['Color', 'Infrared'],
      crs: 'EPSG:4326',
      bounds: { minLat: 12.90, maxLat: 13.05, minLon: 77.50, maxLon: 77.70 },
      laymanSensorDescription: 'High-detail camera showing city roads, rooftops, and lake shorelines.'
    },
    sarMetadata: {
      satelliteName: 'ISRO EOS-04 (RISAT-1A) / Sentinel-1',
      agency: 'ISRO / ESA',
      acquisitionDate: '2026-03-11',
      resolution: '5-meter detail',
      incidenceAngle: '35°',
      polarization: 'VV+VH',
      orbitDirection: 'Descending',
      crs: 'EPSG:4326',
      bounds: { minLat: 12.90, maxLat: 13.05, minLon: 77.50, maxLon: 77.70 },
      laymanSensorDescription: 'Radar satellite mapping concrete building walls vs dark smooth lake water.'
    },
    presetQueries: [
      'Which tall concrete office buildings show strong radar reflections?',
      'Are there any new construction encroachments near the lake buffer?',
      'Show me green park areas versus concrete building clusters.'
    ],
    groundTruthObjects: [
      {
        id: 'gt-urban-01',
        label: 'Tech Park Office High-Rise Cluster',
        category: 'building_structure',
        laymanCategory: 'Tall Office Building',
        confidence: 0.95,
        iouScore: 0.92,
        bbox: [56, 13, 14, 23],
        coordinates: { lat: 12.985, lon: 77.630 },
        opticalReflection: { rgb: '#8395a7', nirValue: 0.22, ndvi: 0.10, ndwi: -0.45 },
        sarBackscatter: { vv_dB: +18.5, vh_dB: +11.2, ratio_dB: 7.3, coherence: 0.89 },
        evidenceDescription: 'Vertical concrete walls reflect radar waves back strongly (+18.5 dB).',
        laymanExplanation: 'The straight vertical walls of concrete office towers bounce radar signals back intensely, appearing as bright structural blocks.',
        laymanGroundType: 'Concrete High-Rise Commercial Building'
      },
      {
        id: 'gt-urban-02',
        label: 'Bellandur Lake Water Buffer',
        category: 'anomaly',
        laymanCategory: 'Protected Lake Zone',
        confidence: 0.91,
        iouScore: 0.87,
        bbox: [74, 25, 15, 12],
        coordinates: { lat: 12.935, lon: 77.670 },
        opticalReflection: { rgb: '#0f2b3c', nirValue: 0.06, ndvi: -0.22, ndwi: 0.74 },
        sarBackscatter: { vv_dB: -21.8, vh_dB: -27.4, ratio_dB: 5.6, coherence: 0.12 },
        evidenceDescription: 'Smooth lake surface absorbs radar waves, bounded by building echoes.',
        laymanExplanation: 'This is the protected lake surface. It shows up very dark on radar because smooth water scatters radar signals away.',
        laymanGroundType: 'Natural Lake Wetland Body'
      }
    ]
  },
  {
    id: 'ds-punjab-agriculture-2026',
    title: 'Punjab Wheat & Paddy Farm Health Monitoring',
    region: 'Ludhiana Agricultural Belt, Punjab',
    coordinates: '30.9010° N, 75.8573° E',
    description: 'Evaluating farm crop health, plant growth density, and soil moisture levels in Punjab.',
    laymanSummary: 'Combines infrared plant health photos with crop radar scattering to assess plant growth stages and detect dry vs well-watered soil plots.',
    opticalImageUrl: createOpticalSvg('PUNJAB-FARMS', 'agri'),
    sarImageUrl: createSarSvg('PUNJAB-RADAR', 'agri'),
    opticalMetadata: {
      satelliteName: 'Sentinel-2 / Resourcesat-2',
      agency: 'ISRO / ESA',
      acquisitionDate: '2026-02-18',
      resolution: '10-meter detail',
      bands: ['Green', 'Red', 'Near-Infrared (Plant Health)'],
      crs: 'EPSG:4326',
      bounds: { minLat: 30.80, maxLat: 31.00, minLon: 75.70, maxLon: 76.00 },
      laymanSensorDescription: 'Infrared satellite camera measuring green leaf chlorophyll content.'
    },
    sarMetadata: {
      satelliteName: 'Sentinel-1 Radar',
      agency: 'ESA / ISRO',
      acquisitionDate: '2026-02-19',
      resolution: '10-meter detail',
      incidenceAngle: '37°',
      polarization: 'VV+VH',
      orbitDirection: 'Ascending',
      crs: 'EPSG:4326',
      bounds: { minLat: 30.80, maxLat: 31.00, minLon: 75.70, maxLon: 76.00 },
      laymanSensorDescription: 'Radar pulse measuring crop stem density and soil moisture content.'
    },
    presetQueries: [
      'Which crop fields have healthy green plant growth right now?',
      'Show me farm plots with high soil moisture levels.',
      'Where are the irrigation canals located across the fields?'
    ],
    groundTruthObjects: [
      {
        id: 'gt-agri-01',
        label: 'Healthy Green Wheat Field Plot 4B',
        category: 'vegetation_loss',
        laymanCategory: 'Healthy Green Crop',
        confidence: 0.94,
        iouScore: 0.90,
        bbox: [41, 4, 28, 22],
        coordinates: { lat: 30.920, lon: 75.820 },
        opticalReflection: { rgb: '#5fa453', nirValue: 0.78, ndvi: 0.76, ndwi: -0.52 },
        sarBackscatter: { vv_dB: -11.2, vh_dB: -16.8, ratio_dB: 5.6, coherence: 0.65 },
        evidenceDescription: 'High infrared leaf reflection (NDVI +0.76) and dense crop canopy radar bounce.',
        laymanExplanation: 'Bright infrared reflection confirms thick, healthy green wheat leaves with strong crop density.',
        laymanGroundType: 'Dense Wheat Farm Crop'
      }
    ]
  },
  {
    id: 'ds-himalayas-landslide-2026',
    title: 'Himalayan Mountain Landslide & Debris Safety',
    region: 'Uttarkashi Highway Corridor, Uttarakhand',
    coordinates: '30.7268° N, 78.4354° E',
    description: 'Detecting mountain slope soil slides and loose rock debris near mountain transit highways.',
    laymanSummary: 'Tracks unstable mountain slopes along mountain roads using satellite radar to alert authorities to loose soil movement and landslide debris before road blockages occur.',
    opticalImageUrl: createOpticalSvg('UTTARAKHAND-SLOPE', 'landslide'),
    sarImageUrl: createSarSvg('UTTARAKHAND-RADAR', 'landslide'),
    opticalMetadata: {
      satelliteName: 'ISRO Cartosat-3 / EOS-06',
      agency: 'ISRO National Remote Sensing Centre',
      acquisitionDate: '2026-08-02',
      resolution: '1-meter ultra-sharp',
      bands: ['High-Res Photo'],
      crs: 'EPSG:4326',
      bounds: { minLat: 30.65, maxLat: 30.80, minLon: 78.35, maxLon: 78.55 },
      laymanSensorDescription: 'Ultra-high detail mountain camera mapping exposed brown rock and road cuts.'
    },
    sarMetadata: {
      satelliteName: 'Sentinel-1 Radar Pair',
      agency: 'ESA / ISRO',
      acquisitionDate: '2026-08-03',
      resolution: '5-meter detail',
      incidenceAngle: '44°',
      polarization: 'VV',
      orbitDirection: 'Descending',
      crs: 'EPSG:4326',
      bounds: { minLat: 30.65, maxLat: 30.80, minLon: 78.35, maxLon: 78.55 },
      laymanSensorDescription: 'Radar satellite pair measuring subtle ground soil movement down mountain slopes.'
    },
    presetQueries: [
      'Where is the active landslide scarp with loose falling soil?',
      'Are mountain highway roads at risk from sliding rock debris?',
      'Show me stable forested slopes versus bare sliding dirt.'
    ],
    groundTruthObjects: [
      {
        id: 'gt-slide-01',
        label: 'Active Mountain Landslide Slope',
        category: 'landslide',
        laymanCategory: 'Unstable Landslide Area',
        confidence: 0.93,
        iouScore: 0.88,
        bbox: [38, 30, 26, 32],
        coordinates: { lat: 30.735, lon: 78.442 },
        opticalReflection: { rgb: '#6e5843', nirValue: 0.19, ndvi: 0.08, ndwi: -0.15 },
        sarBackscatter: { vv_dB: -14.2, vh_dB: -21.0, ratio_dB: 6.8, coherence: 0.05 },
        evidenceDescription: 'Loss of radar phase stability (0.05) indicates active ground soil sliding.',
        laymanExplanation: 'Radar pulse decorrelation confirms loose dirt and rocks are actively sliding down this steep mountain slope.',
        laymanGroundType: 'Active Landslide Dirt Scarp'
      }
    ]
  }
];
