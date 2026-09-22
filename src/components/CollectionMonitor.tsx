import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  ShieldCheck,
  FileText,
  Camera,
  Layers,
  HelpCircle,
  Radio,
  FileCheck2,
} from 'lucide-react';
import { CollectionScenario, DebrisType } from '../types';

interface CollectionMonitorProps {
  scenario: CollectionScenario;
  onSuccess: (valueSaved: number, note: string) => void;
  onFailure: (penaltyCost: number, reason: string) => void;
  onNextScenario: () => void;
}

export const CollectionMonitor: React.FC<CollectionMonitorProps> = ({
  scenario,
  onSuccess,
  onFailure,
  onNextScenario,
}) => {
  // ADMS Form State
  const [selectedDebris, setSelectedDebris] = useState<DebrisType | ''>('');
  const [gpsLocked, setGpsLocked] = useState(false);
  const [inputPlacard, setInputPlacard] = useState('');
  const [photoSnapped, setPhotoSnapped] = useState(false);
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(scenario.timeLimitSec);
  const [resultState, setResultState] = useState<'idle' | 'success' | 'failure'>('idle');
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    // Reset inputs on scenario change
    setSelectedDebris('');
    setGpsLocked(false);
    setInputPlacard('');
    setPhotoSnapped(false);
    setAttestationChecked(false);
    setTimeLeft(scenario.timeLimitSec);
    setResultState('idle');
    setResultMessage('');
  }, [scenario]);

  useEffect(() => {
    if (resultState !== 'idle') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, resultState]);

  const handleTimeout = () => {
    setResultState('failure');
    const msg = 'Time expired! Crew loaded unverified material while you hesitated. Auditor flagged lack of origin documentation.';
    setResultMessage(msg);
    onFailure(scenario.value * 0.75, msg);
  };

  // Crew pressure or PPDR trap rejection
  const handleRejectLoad = (reason: 'ppdr_no_roe' | 'ineligible_waste' | 'mixed_load') => {
    if (resultState !== 'idle') return;

    if (reason === 'ppdr_no_roe') {
      if (!scenario.isPublicROW && !scenario.hasROE) {
        setResultState('success');
        const msg = 'EXEMPLARY CALL! You blocked an unauthorized Private Property Debris Removal (PPDR) trespass! Saved $9,200 in improper contractor billing and FEMA audit de-obligations.';
        setResultMessage(msg);
        onSuccess(scenario.value, 'PPDR Trespass Blocked');
      } else if (!scenario.isPublicROW && scenario.hasROE) {
        setResultState('failure');
        const msg = 'MISTAKE: This property had an officially verified, executed Right-of-Entry (ROE) permit on file for an imminent health/safety hazard. The rejection improperly halted emergency operations.';
        setResultMessage(msg);
        onFailure(scenario.value * 0.5, msg);
      } else {
        setResultState('failure');
        const msg = 'INCORRECT REJECTION: This debris pile is positioned legally on the public Right-of-Way (ROW). Rejection was unwarranted.';
        setResultMessage(msg);
        onFailure(scenario.value * 0.4, msg);
      }
    } else if (reason === 'ineligible_waste') {
      if (scenario.contamination === 'Ineligible Garbage') {
        setResultState('success');
        const msg = 'EXCELLENT DETECTION! You spotted household garbage mixed into disaster C&D. FEMA PA only reimburses disaster-generated debris, never standard municipal garbage.';
        setResultMessage(msg);
        onSuccess(scenario.value, 'Ineligible Garbage Rejected');
      } else {
        setResultState('failure');
        const msg = 'Improper rejection! There was no municipal garbage in this certified disaster pile.';
        setResultMessage(msg);
        onFailure(scenario.value * 0.3, msg);
      }
    } else if (reason === 'mixed_load') {
      if (scenario.contamination === 'C&D' && scenario.primaryDebris === 'Vegetative') {
        setResultState('success');
        const msg = 'GREAT CATCH! You rejected a mixed load (Vegetative and C&D). FEMA requires separation of waste streams to maintain reduction site environmental permits.';
        setResultMessage(msg);
        onSuccess(scenario.value, 'Mixed Load Blocked');
      } else {
        setResultState('failure');
        const msg = 'Improper call: This load is not an incompatible mixed stream.';
        setResultMessage(msg);
        onFailure(scenario.value * 0.3, msg);
      }
    }
  };

  // Submit Origin Ticket
  const handleSubmitTicket = () => {
    if (resultState !== 'idle') return;

    // Validation checks
    if (!selectedDebris) {
      alert('Please classify the Debris Type first.');
      return;
    }
    if (!gpsLocked) {
      alert('You must capture and verify the GPS waypoint before submitting.');
      return;
    }
    if (!photoSnapped) {
      alert('Mandatory photo of debris pile in the ROW is required.');
      return;
    }
    if (!attestationChecked) {
      alert('You must sign the legal attestation checkbox.');
      return;
    }

    // Now evaluate accuracy
    // 1. PPDR check
    if (!scenario.isPublicROW && !scenario.hasROE) {
      setResultState('failure');
      const msg = 'CRITICAL COMPLIANCE BREACH: You approved loading from private property without an executed ROE! FEMA has de-obligated $9,200 and opened a fraud inquiry on your firm.';
      setResultMessage(msg);
      onFailure(scenario.value, msg);
      return;
    }

    // 2. Contamination check
    if (scenario.contamination) {
      setResultState('failure');
      const msg = `AUDIT FAILURE: You approved a contaminated pile containing ${scenario.contamination}! Mixing waste streams or loading ineligible municipal garbage violates 2 CFR 200.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.8, msg);
      return;
    }

    // 3. Debris Type mismatch
    if (selectedDebris !== scenario.primaryDebris) {
      setResultState('failure');
      const msg = `CLASSIFICATION ERROR: You marked this as ${selectedDebris}, but the physical material is ${scenario.primaryDebris}. Mismatched manifests cause TDSR rejection.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.5, msg);
      return;
    }

    // If passed all
    setResultState('success');
    const msg = `PERFECT ORIGIN TICKET! ADMS Ticket #${Math.floor(100000 + Math.random() * 900000)} generated with valid GPS, photos, and compliant public ROW attestation.`;
    setResultMessage(msg);
    onSuccess(scenario.value, 'Valid Origin Ticket');
  };

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              ROLE 1: COLLECTION MONITOR
            </span>
            <span className="text-xs text-slate-400">The Frontline Filter</span>
          </div>
          <h2 className="text-xl font-bold font-['Chakra_Petch'] text-white mt-1">
            Curb-Side Load Generation &amp; Origin Control
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Stand in the street, inspect the debris pile, verify ROW boundaries, filter out ineligible waste, and generate the digital ADMS origin ticket.
          </p>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 font-mono">
          <Clock className={`w-5 h-5 ${timeLeft <= 8 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Field Response Timer</div>
            <div className={`text-lg font-bold ${timeLeft <= 8 ? 'text-rose-400' : 'text-amber-400'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scene on Left, ADMS Handheld Device on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Scene & Real-World Interaction */}
        <div className="lg:col-span-6 space-y-4">
          {/* Street Scene Canvas Representation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-lg">
            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {scenario.streetAddress}
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${scenario.isPublicROW ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300 animate-pulse'}`}>
                {scenario.isPublicROW ? 'PUBLIC RIGHT-OF-WAY' : 'PRIVATE PROPERTY (PPDR)'}
              </span>
            </div>

            {/* Simulated Live Viewport */}
            <div className="p-5 bg-gradient-to-b from-slate-950 to-slate-900 min-h-[260px] flex flex-col justify-between relative overflow-hidden">
              {/* Overlay Street Markers */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
                <span className="bg-slate-800/90 px-2 py-1 rounded border border-slate-700">
                  Target Equipment: <strong className="text-white">{scenario.truckPlacard}</strong>
                </span>
                <span className="bg-slate-800/90 px-2 py-1 rounded border border-slate-700">
                  Capacity: <strong className="text-amber-400">{scenario.capacityCY} CY</strong>
                </span>
              </div>

              {/* Central Visual Graphic Representation */}
              <div className="my-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/80 backdrop-blur-sm relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-2xl">
                    {scenario.primaryDebris === 'Vegetative' && '🌲'}
                    {scenario.primaryDebris === 'C&D' && '🧱'}
                    {scenario.primaryDebris === 'White Goods' && '🧊'}
                    {scenario.primaryDebris === 'HHW' && '☣️'}
                  </div>
                  <div>
                    <div className="text-xs uppercase font-mono text-amber-400 font-semibold">Physical Material Inspection</div>
                    <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                      {scenario.pileVisual}
                    </p>
                    {scenario.hasROE && (
                      <div className="mt-2 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded flex items-center gap-1.5 font-mono">
                        <FileCheck2 className="w-4 h-4" />
                        ROE Document #FL-2026-992 signed by property owner on GIS records!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Driver & Crew Pressure Bubble */}
              <div className="bg-slate-950/90 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200 relative z-10 font-mono shadow-md">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                  FIELD AUDIO / CREW COMMUNICATION:
                </div>
                "{scenario.driverBribeOrPressure}"
              </div>

              {/* Background ambient aesthetic grid lines */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            </div>

            {/* Quick Rejection Buttons (The Compliance Traps) */}
            <div className="p-4 bg-slate-800/90 border-t border-slate-700/80">
              <div className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
                Monitor Compliance Interventions (Hard-Stops):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleRejectLoad('ppdr_no_roe')}
                  className="bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/50 text-rose-300 px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  REJECT: PPDR / No ROE
                </button>
                <button
                  onClick={() => handleRejectLoad('mixed_load')}
                  className="bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-amber-300 px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  REJECT: Mixed Stream
                </button>
                <button
                  onClick={() => handleRejectLoad('ineligible_waste')}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <XCircle className="w-4 h-4 text-slate-400" />
                  REJECT: Normal Garbage
                </button>
              </div>
            </div>
          </div>

          {/* Compliance Tip Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Debris Monitor Tip:</strong> Never cross onto private lawns or driveways unless a FEMA-certified Right of Entry (ROE) document is validated in the system. The contractor is paid per yard, so they will push you to sweep everything. You are the taxpayer's guardian.
            </div>
          </div>
        </div>

        {/* Right Column: Simulated ADMS Handheld Rugged Tablet */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-2xl space-y-5 relative">
            {/* Tablet Header / Stylized Bezel */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-mono text-xs font-bold text-slate-300">ADMS HANDHELD v4.2.1 [ORIGIN DISPATCH]</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">BATTERY: 98% • SAT-LINK: 5/5</span>
            </div>

            {/* Step 1: Debris Classification */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center gap-1.5">
                <span>1. Debris Stream Classification</span>
                <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Vegetative', 'C&D', 'HHW', 'White Goods'] as DebrisType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedDebris(type)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition ${
                      selectedDebris === type
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: GPS Coordinate Waypoint */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center justify-between">
                <span>2. GPS Waypoint &amp; ROW Verification</span>
                <span className="text-[10px] text-slate-400">Lat/Long Precision</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGpsLocked(true)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition ${
                    gpsLocked
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${gpsLocked ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {gpsLocked ? 'GPS Waypoint Locked: 30.4213° N, -87.2169° W' : 'Tap to Capture Precision GPS'}
                </button>
              </div>
            </div>

            {/* Step 3: Truck Placard Verification */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center justify-between">
                <span>3. Truck Placard / Equipment #</span>
                <span className="text-amber-400 text-xs font-mono">Present: {scenario.truckPlacard}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter or confirm placard (e.g. TRK-842)"
                  value={inputPlacard}
                  onChange={(e) => setInputPlacard(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setInputPlacard(scenario.truckPlacard)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono px-3 py-2 rounded-lg border border-slate-700"
                >
                  Auto-Fill
                </button>
              </div>
            </div>

            {/* Step 4: Mandatory Photographic Evidence */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center justify-between">
                <span>4. Mandatory Photo Documentation</span>
                <span className="text-xs text-rose-400 font-mono">Audit Proof</span>
              </label>
              <button
                type="button"
                onClick={() => setPhotoSnapped(!photoSnapped)}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition ${
                  photoSnapped
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Camera className={`w-4 h-4 ${photoSnapped ? 'text-blue-400' : 'text-slate-400'}`} />
                {photoSnapped ? 'Geo-Tagged Photo Uploaded to FEMA Vault [IMG_8829.RAW]' : 'Tap to Snap Timestamped Pile Photo'}
              </button>
            </div>

            {/* Step 5: Legal Attestation */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-300 font-mono cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={attestationChecked}
                  onChange={(e) => setAttestationChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>
                  I attest under penalty of perjury (18 U.S.C. § 1001) that this debris originated within eligible public Right-of-Way boundaries and is storm-generated.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitTicket}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl text-sm font-['Chakra_Petch'] tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                TRANSMIT &amp; PRINT ORIGIN TICKET
              </button>
            </div>

            {/* Modal / Overlay for Result */}
            {resultState !== 'idle' && (
              <div className="absolute inset-0 bg-slate-950/95 rounded-2xl p-6 flex flex-col justify-center items-center text-center z-30 backdrop-blur-md animate-in fade-in">
                {resultState === 'success' ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
                ) : (
                  <AlertOctagon className="w-16 h-16 text-rose-500 mb-3" />
                )}
                <h3 className={`text-xl font-bold font-['Chakra_Petch'] mb-2 ${resultState === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resultState === 'success' ? 'AUDIT VERIFICATION PASSED' : 'FEMA COMPLIANCE INFRACTION'}
                </h3>
                <p className="text-sm text-slate-200 max-w-md mb-6 leading-relaxed">
                  {resultMessage}
                </p>
                <button
                  onClick={onNextScenario}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl font-['Chakra_Petch'] tracking-wide transition shadow-lg shadow-amber-500/20"
                >
                  NEXT TRUCK DISPATCH →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
