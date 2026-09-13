import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapViewport } from './components/MapViewport';
import { ChatInterface } from './components/ChatInterface';
import { VisualEvidencePanel } from './components/VisualEvidencePanel';
import { AuditTrailDrawer } from './components/AuditTrailDrawer';
import { ExportReportModal } from './components/ExportReportModal';
import { DatasetSelector } from './components/DatasetSelector';
import type { DatasetItem, ViewModality, VLMQueryMessage, GroundingEvidence } from './types/remoteSensing';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { processVlmQuery } from './utils/analyticalEngine';
import { analyzeSatelliteQuery } from './services/api';

export function App() {
  const [, setAllDatasets] = useState<DatasetItem[]>(SAMPLE_DATASETS);
  const [activeDataset, setActiveDataset] = useState<DatasetItem>(SAMPLE_DATASETS[0]);
  const [viewModality, setViewModality] = useState<ViewModality>('split');
  
  // VLM State
  const [messages, setMessages] = useState<VLMQueryMessage[]>([]);
  const [activeEvidence, setActiveEvidence] = useState<GroundingEvidence[]>(activeDataset.groundTruthObjects);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Modals & Drawers
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);
  const [selectedAuditMessage, setSelectedAuditMessage] = useState<VLMQueryMessage | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDatasetSelectorOpen, setIsDatasetSelectorOpen] = useState<boolean>(false);

  // Initialize dataset with default query, prioritizing the FastAPI backend
  useEffect(() => {
    let isCancelled = false;
    const initialQuery = activeDataset.presetQueries[0];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const userGreeting: VLMQueryMessage = {
      id: 'msg-init-user',
      sender: 'user',
      timestamp,
      text: initialQuery
    };

    setMessages([userGreeting]);
    setIsProcessing(true);

    analyzeSatelliteQuery(initialQuery, activeDataset)
      .then((resp) => {
        if (!isCancelled) {
          setMessages([userGreeting, resp]);
          setActiveEvidence(resp.evidence || activeDataset.groundTruthObjects);
          setSelectedAuditMessage(resp);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('[SatQuery] Backend not reachable, using local preview mode:', err);
          const localResp = processVlmQuery(initialQuery, activeDataset);
          localResp.text = `[Local Mode] ${localResp.text}`;
          setMessages([userGreeting, localResp]);
          setActiveEvidence(localResp.evidence || activeDataset.groundTruthObjects);
          setSelectedAuditMessage(localResp);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeDataset]);

  const handleSendQuery = async (queryText: string) => {
    setIsProcessing(true);

    const userMsg: VLMQueryMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      text: queryText
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      // Execute query against FastAPI backend (/api/analyze)
      const response = await analyzeSatelliteQuery(queryText, activeDataset);
      setMessages(prev => [...prev, response]);
      setActiveEvidence(response.evidence || activeDataset.groundTruthObjects);
      setSelectedAuditMessage(response);
    } catch (err) {
      console.warn('[SatQuery] Backend query failed, using local demo engine:', err);
      const fallbackResp = processVlmQuery(queryText, activeDataset);
      fallbackResp.text = `[Local Mode - Backend Offline] ${fallbackResp.text}`;
      setMessages(prev => [...prev, fallbackResp]);
      setActiveEvidence(fallbackResp.evidence || activeDataset.groundTruthObjects);
      setSelectedAuditMessage(fallbackResp);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectDataset = (dataset: DatasetItem) => {
    setActiveDataset(dataset);
    setSelectedEvidenceId(null);
  };

  const handleAddCustomDataset = (newDataset: DatasetItem) => {
    setAllDatasets(prev => [newDataset, ...prev]);
  };

  const handleOpenAuditTrail = (msg: VLMQueryMessage) => {
    setSelectedAuditMessage(msg);
    setIsAuditTrailOpen(true);
  };

  const handleResetView = () => {
    setViewModality('split');
    setSelectedEvidenceId(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] text-slate-200 overflow-hidden font-sans select-none">
      {/* 1. Technical Mission Control Header */}
      <Header
        activeDataset={activeDataset}
        viewModality={viewModality}
        setViewModality={setViewModality}
        onOpenDatasetSelector={() => setIsDatasetSelectorOpen(true)}
        onOpenAuditReport={() => setIsReportModalOpen(true)}
        onResetView={handleResetView}
      />

      {/* 2. Main Dashboard Workspace Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-2 p-2 overflow-hidden bg-[#080c14]">
        {/* Left / Center: Interactive GIS Map Viewport */}
        <MapViewport
          activeDataset={activeDataset}
          viewModality={viewModality}
          activeEvidence={activeEvidence}
          selectedEvidenceId={selectedEvidenceId}
          onSelectEvidence={setSelectedEvidenceId}
        />

        {/* Right Panel 1: Visual Evidence Telemetry */}
        <VisualEvidencePanel
          evidenceList={activeEvidence}
          selectedEvidenceId={selectedEvidenceId}
          onSelectEvidence={setSelectedEvidenceId}
        />

        {/* Right Panel 2: Interactive VLM Query Console */}
        <ChatInterface
          activeDataset={activeDataset}
          messages={messages}
          isProcessing={isProcessing}
          onSendQuery={handleSendQuery}
          onOpenAuditTrail={handleOpenAuditTrail}
        />
      </main>

      {/* 3. Slide-out Auditable Analytical Reasoning Drawer */}
      <AuditTrailDrawer
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        activeMessage={selectedAuditMessage}
        onExportReport={() => setIsReportModalOpen(true)}
      />

      {/* 4. Formal ISRO Analytical Report Export Modal */}
      <ExportReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dataset={activeDataset}
        latestMessage={selectedAuditMessage}
      />

      {/* 5. Multimodal Dataset Selector & Ingestor Modal */}
      <DatasetSelector
        isOpen={isDatasetSelectorOpen}
        onClose={() => setIsDatasetSelectorOpen(false)}
        activeDatasetId={activeDataset.id}
        onSelectDataset={handleSelectDataset}
        onAddCustomDataset={handleAddCustomDataset}
      />
    </div>
  );
}

export default App;
