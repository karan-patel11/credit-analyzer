import React, { useState } from 'react';
import ApplicationForm from './ApplicationForm';
import PipelineProgress from './PipelineProgress';
import CreditMemo from './CreditMemo';
import { DocumentSearchIcon } from '../../utils/icons';
import { useAppContext } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { demoScenarios } from '../../data/mockData';

const CreditAnalysis = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    annualRevenue: '',
    loanAmount: '',
    file: null
  });

  const [analysisState, setAnalysisState] = useState('idle'); // idle, analyzing, complete, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const { demoMode } = useAppContext();
  const { request } = useApi();

  const handleAnalyze = async () => {
    setAnalysisState('analyzing');
    setErrorMsg(null);
    setResult(null);

    // In a real app, we'd send the file via FormData. 
    // Here we'll simulate the delay or call a mock endpoint.

    if (demoMode) {
      let matchedResult = null;
      for (const key in demoScenarios) {
        if (demoScenarios[key].businessName === formData.businessName) {
          matchedResult = demoScenarios[key].result;
          break;
        }
      }

      // If no match (custom data), just return the 'borderline' result as fallback
      if (!matchedResult) {
        matchedResult = demoScenarios['borderline'].result;
      }

      // We don't need to do anything here because PipelineProgress handles its own visual timing
      // When PipelineProgress completes, it will call handlePipelineComplete
      // We just need to store the mock result to show later
      setResult(matchedResult);

    } else {
      // Live mode - simulate API call with FormData
      try {
        const payload = new FormData();
        payload.append('businessName', formData.businessName);
        payload.append('industry', formData.industry);
        payload.append('annualRevenue', formData.annualRevenue);
        payload.append('loanAmount', formData.loanAmount);
        if (formData.file) {
          payload.append('file', formData.file);
        }

        const data = await request('/analyze', {
          method: 'POST',
          body: payload,
          // don't set Content-Type header, let browser set it with boundary for FormData
        });
        
        setResult(data);
      } catch (err) {
        setErrorMsg("Analysis failed. Please check the backend connection or try Demo Mode.");
      }
    }
  };

  const handlePipelineComplete = () => {
    if (errorMsg) {
      setAnalysisState('error');
    } else {
      setAnalysisState('complete');
    }
  };

  const handleReset = () => {
    setFormData({
      businessName: '',
      industry: '',
      annualRevenue: '',
      loanAmount: '',
      file: null
    });
    setAnalysisState('idle');
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--bg-primary)] lg:flex-row">
      
      {/* Left Column - Input Form */}
      <div className="flex w-full shrink-0 flex-col border-r border-[var(--border-default)] lg:w-1/2">
        <div className="p-6 md:p-8 h-full overflow-y-auto">
          <ApplicationForm 
            formData={formData} 
            setFormData={setFormData}
            onAnalyze={handleAnalyze}
            isAnalyzing={analysisState === 'analyzing'}
          />
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[var(--bg-primary)]">
        
        {analysisState === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]">
              <DocumentSearchIcon className="h-8 w-8 text-[var(--text-tertiary)]" />
            </div>
            <h3 className="mb-2 text-[18px] font-normal tracking-[-0.03em] text-[var(--text-primary)]">Awaiting Data</h3>
            <p className="max-w-sm text-[14px] text-[var(--text-secondary)]">
              Submit an application or select a quick demo to see the AI-powered credit assessment.
            </p>
          </div>
        )}

        {analysisState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
            <h3 className="mb-8 text-[18px] font-normal tracking-[-0.03em] text-[var(--text-primary)]">Processing Application</h3>
            <div className="w-full max-w-md rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
              <PipelineProgress 
                isAnalyzing={true} 
                onComplete={handlePipelineComplete}
                error={errorMsg}
              />
            </div>
          </div>
        )}

        {analysisState === 'complete' && result && (
          <div className="h-full p-6 md:p-8">
            <CreditMemo result={result} onReset={handleReset} />
          </div>
        )}

        {analysisState === 'error' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(239,68,68,0.2)] bg-[var(--status-decline-subtle)]">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="mb-2 font-medium text-[var(--status-decline)]">Analysis Failed</h3>
            <p className="mb-6 max-w-sm text-[13px] text-[var(--text-secondary)]">{errorMsg}</p>
            <button 
              onClick={handleReset}
              className="tempo-button h-10 min-h-0 px-4 text-[13px]"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default CreditAnalysis;
