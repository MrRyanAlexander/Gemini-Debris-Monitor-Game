import React, { useState, useEffect } from 'react';
import {
  ScanLine,
  Camera,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Radio,
  FileSearch,
  Droplets,
  Wind,
  ShieldAlert,
  Ghost,
} from 'lucide-react';
import { DisposalScenario } from '../types';

interface DisposalTowerMonitorProps {
  scenario: DisposalScenario;
  onSuccess: (valueSaved: number, note: string) => void;
  onFailure: (penaltyCost: number, reason: string) => void;
  onNextScenario: () => void;
}

export const DisposalTowerMonitor: React.FC<DisposalTowerMonitorProps> = ({
  scenario,
  onSuccess,
  onFailure,
  onNextScenario,
}) => {
  // Tower Monitor State
  const [loadCallPercent, setLoadCallPercent] = useState<number>(scenario.driverClaimPercent);
  const [ticketScanned, setTicketScanned] = useState(false);
  const [photoSnapped, setPhotoSnapped] = useState(false);
  const [cameraAngle, setCameraAngle] = useState<'overhead' | 'cross_section' | 'tailgate'>('overhead');
  const [inspectedHollow, setInspectedHollow] = useState(false);
  const [inspectedWater, setInspectedWater] = useState(false);

  // Result state
  const [resultState, setResultState] = useState<'idle' | 'success' | 'failure'>('idle');
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    setLoadCallPercent(scenario.driverClaimPercent);
    setTicketScanned(false);
    setPhotoSnapped(false);
    setCameraAngle('overhead');
    setInspectedHollow(false);
    setInspectedWater(false);
    setResultState('idle');
    setResultMessage('');
  }, [scenario]);

  // Trap 1: Deny Entry - Ghost Truck (no origin ticket in ADMS)
  const handleDenyGhostTruck = () => {
    if (resultState !== 'idle') return;

    if (!scenario.originVerified) {
      setResultState('success');
      const msg = `AUDIT MASTERCLASS! You intercepted a "Ghost Truck" trying to dump without a certified ADMS collection origin ticket. Prevented $12,000 in fraudulent landfill tipping fee claims.`;
      setResultMessage(msg);
      onSuccess(scenario.value, 'Ghost Truck Stopped');
    } else {
      setResultState('failure');
      const msg = `WRONGFUL DENIAL: This truck had a valid electronic collection ticket from the field. You disrupted TDSR throughput without cause.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.4, msg);
    }
  };

  // Trap 2: Slash Load for "Hauling Air"
  const handleSlashForAir = () => {
    if (resultState !== 'idle') return;

    if (scenario.isHaulingAir) {
      setResultState('success');
      const msg = `SHARP EYE! You caught the truck "Hauling Air" (hollow branch lattice). Slashed the fraudulent ${scenario.driverClaimPercent}% claim down to the true ${scenario.actualFillLevel}% volume! Saved taxpayers $7,200.`;
      setResultMessage(msg);
      onSuccess(scenario.value, 'Hauling Air Caught');
    } else {
      setResultState('failure');
      const msg = `ACCUSATION ERROR: This load was densely compacted with no hollow voids. Slashing the load violated contract measurement protocols.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.3, msg);
    }
  };

  // Trap 3: Penalize for Water Weight
  const handleFlagWaterWeight = () => {
    if (resultState !== 'idle') return;

    if (scenario.isWaterWeight) {
      setResultState('success');
      const msg = `BRILLIANT AUDIT! You spotted the driver saturating C&D debris with water to artificially inflate weigh-scale tonnage! FEMA PA guidelines mandate volume adjustment deductions.`;
      setResultMessage(msg);
      onSuccess(scenario.value, 'Water Weight Fraud Flagged');
    } else {
      setResultState('failure');
      const msg = `False Alarm: There was no intentional water soaking on this load.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.3, msg);
    }
  };

  // Standard Submit Load Call
  const handleSubmitLoadCall = () => {
    if (resultState !== 'idle') return;

    if (!ticketScanned) {
      alert('You must scan the truck barcode / manifest ticket first.');
      return;
    }
    if (!photoSnapped) {
      alert('Top-down photograph is mandatory to prove the load call.');
      return;
    }

    // Ghost Truck Check
    if (!scenario.originVerified) {
      setResultState('failure');
      const msg = `CRITICAL FRAUD VULNERABILITY: You processed and paid a "Ghost Truck" with no origin ticket in the ADMS! Full tipping fee ($12,000) de-obligated by FEMA Inspector General.`;
      setResultMessage(msg);
      onFailure(scenario.value, msg);
      return;
    }

    // Check load call accuracy (within 5% of actual)
    const difference = Math.abs(loadCallPercent - scenario.actualFillLevel);

    if (scenario.isHaulingAir && loadCallPercent > 60) {
      setResultState('failure');
      const msg = `MISSED FRAUD: You accepted a high load call (${loadCallPercent}%) when the truck was hollow inside ("Hauling Air"). Real volume was only ${scenario.actualFillLevel}%. FEMA auditor de-obligates the difference.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.7, msg);
      return;
    }

    if (scenario.isWaterWeight && loadCallPercent > 75) {
      setResultState('failure');
      const msg = `WATER WEIGHT TRAP: You approved an inflated load call on water-soaked debris without taking proper compaction deductions.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.6, msg);
      return;
    }

    if (difference <= 10) {
      setResultState('success');
      const msg = `ACCURATE LOAD CALL! You set the call at ${loadCallPercent}% (True volume: ${scenario.actualFillLevel}%). High-resolution top-down audit photo archived into FEMA PA repository.`;
      setResultMessage(msg);
      onSuccess(scenario.value, 'Accurate Load Call');
    } else {
      setResultState('failure');
      const msg = `VOLUME DISCREPANCY: Your estimate of ${loadCallPercent}% deviated significantly from the calibrated volume (${scenario.actualFillLevel}%). Over-estimates trigger federal clawbacks.`;
      setResultMessage(msg);
      onFailure(scenario.value * 0.5, msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ROLE 2: DISPOSAL / TOWER MONITOR
            </span>
            <span className="text-xs text-slate-400">The Estimator &amp; Gatekeeper</span>
          </div>
          <h2 className="text-xl font-bold font-['Chakra_Petch'] text-white mt-1">
            TDSR Reduction Site Tower Inspection
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Stand on the scaffold tower 14 feet above the truck bed. Look down into the bed, judge the true compaction and volume percentage, catch hollow pockets, and verify the origin ticket.
          </p>
        </div>

        {/* Status Callout */}
        <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">TDSR Grinder Site:</span>{' '}
          <strong className="text-cyan-400">Station #3 (Tower Alpha)</strong>
        </div>
      </div>

      {/* Main Grid: 3D Bed View on Left, Tower Console on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top-Down Visual Inspection Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Viewport Control Bar */}
            <div className="bg-slate-800/90 px-4 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>ELEVATED TOWER PERSPECTIVE (14 FT SCAFFOLD)</span>
              </div>
              <div className="flex items-center gap-1">
                {(['overhead', 'cross_section', 'tailgate'] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setCameraAngle(angle)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition capitalize ${
                      cameraAngle === angle
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {angle.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Top-Down Truck Bed Visualizer */}
            <div className="p-6 bg-slate-950 min-h-[300px] flex flex-col justify-center items-center relative">
              {/* Truck Bed Container Box */}
              <div className="w-full max-w-md h-56 rounded-lg border-4 border-slate-600 bg-slate-900 shadow-2xl relative overflow-hidden flex flex-col justify-end">
                {/* Truck Bed Interior Texture & Visual representation */}
                <div
                  className="w-full transition-all duration-300 relative"
                  style={{
                    height: `${cameraAngle === 'cross_section' ? scenario.actualFillLevel : scenario.truckBedVisual.apparentFill}%`,
                    background:
                      scenario.declaredDebris === 'Vegetative'
                        ? 'linear-gradient(180deg, #3f5e32 0%, #1c3015 100%)'
                        : scenario.declaredDebris === 'HHW'
                        ? 'linear-gradient(180deg, #6d28d9 0%, #311059 100%)'
                        : 'linear-gradient(180deg, #78716c 0%, #292524 100%)',
                  }}
                >
                  {/* Visual Features: Hollow Pockets indicator */}
                  {scenario.truckBedVisual.hasHollowPockets && (
                    <div
                      onClick={() => setInspectedHollow(true)}
                      className="absolute inset-x-8 top-4 bottom-4 border-2 border-dashed border-rose-400 bg-black/60 rounded-md flex items-center justify-center cursor-pointer hover:bg-black/40 transition group"
                    >
                      <div className="text-center px-2">
                        <Wind className="w-6 h-6 text-rose-400 mx-auto animate-pulse" />
                        <span className="text-[11px] font-mono text-rose-300 font-bold block">
                          [TAP TO PROBE] Interlaced Branches / Air Void
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Visual Features: Water Puddles dripping */}
                  {scenario.truckBedVisual.hasWaterPuddles && (
                    <div
                      onClick={() => setInspectedWater(true)}
                      className="absolute bottom-2 inset-x-4 bg-blue-900/60 border border-blue-400 p-2 rounded text-center cursor-pointer hover:bg-blue-800/80 transition"
                    >
                      <div className="flex items-center justify-center gap-1.5 text-xs text-blue-300 font-mono font-bold">
                        <Droplets className="w-4 h-4 text-blue-400 animate-bounce" />
                        Water streams leaking from tailgate seals!
                      </div>
                    </div>
                  )}

                  {/* Normal Texture particles */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 text-3xl font-mono select-none pointer-events-none">
                    {scenario.declaredDebris === 'Vegetative' && '🌿 🪵 🍂 🌲 🪵'}
                    {scenario.declaredDebris === 'C&D' && '🧱 🪚 🔩 🧱 🪚'}
                    {scenario.declaredDebris === 'HHW' && '☣️ ⚠️ 🛢️ ☣️ ⚠️'}
                  </div>
                </div>

                {/* Overhead Height Guide Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 text-[10px] font-mono text-slate-500">
                  <div className="border-b border-slate-700/50 flex justify-between">
                    <span>100% (Top of Sideboards)</span>
                  </div>
                  <div className="border-b border-slate-700/50 flex justify-between">
                    <span>75% Capacity</span>
                  </div>
                  <div className="border-b border-slate-700/50 flex justify-between">
                    <span>50% Capacity</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0% (Empty Floor)</span>
                  </div>
                </div>

                {/* Truck Placard Plate */}
                <div className="absolute top-2 right-2 bg-slate-950/80 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300">
                  {scenario.truckPlacard}
                </div>
              </div>

              {/* Sub-Inspection Findings */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
                {inspectedHollow && (
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    Void Confirmed: Top looks full, center is hollow 45%!
                  </span>
                )}
                {inspectedWater && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    Water Seepage: Mud slurry pumped into bed to fake weight!
                  </span>
                )}
              </div>
            </div>

            {/* Radio / Driver Dialogue */}
            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-start gap-3 text-xs">
              <Radio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 font-mono">
                <strong className="text-amber-300 font-semibold">TRUCK DRIVER OVER CB RADIO:</strong>
                <p className="mt-0.5 italic text-slate-200">"{scenario.driverDialogue}"</p>
              </div>
            </div>

            {/* Quick Fraud Hard-Stop Buttons */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
                Tower Fraud Enforcement Actions:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleDenyGhostTruck}
                  className="bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-purple-200 px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Ghost className="w-4 h-4 text-purple-400" />
                  DENY: Ghost Truck
                </button>
                <button
                  onClick={handleSlashForAir}
                  className="bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-200 px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Wind className="w-4 h-4 text-rose-400" />
                  SLASH: Hauling Air
                </button>
                <button
                  onClick={handleFlagWaterWeight}
                  className="bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/50 text-blue-200 px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Droplets className="w-4 h-4 text-blue-400" />
                  FLAG: Water Weight
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tower Control Console */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-bold text-amber-400">
                TOWER RECONCILIATION TERMINAL
              </span>
              <span className="text-[10px] font-mono text-emerald-400">DISPOSAL CERTIFIER</span>
            </div>

            {/* Step 1: Scan Barcode */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center justify-between">
                <span>1. Scan Origin Ticket Manifest</span>
                <span className="text-slate-400 text-[10px] font-mono">{scenario.ticketBarcode}</span>
              </label>
              <button
                type="button"
                onClick={() => setTicketScanned(true)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition ${
                  ticketScanned
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <ScanLine className={`w-4 h-4 ${ticketScanned ? 'text-emerald-400' : 'text-slate-400'}`} />
                {ticketScanned
                  ? scenario.originVerified
                    ? '✓ ADMS Verified: Origin Valid (ROW Match)'
                    : '⚠️ ALERT: No Origin Record In ADMS Database!'
                  : 'Scan Incoming Driver Ticket'}
              </button>
            </div>

            {/* Step 2: Slider for Load Call Percentage */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  2. Official Load Call Judgment:
                </span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {loadCallPercent}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={loadCallPercent}
                onChange={(e) => setLoadCallPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0% Empty</span>
                <span>50%</span>
                <span className="text-amber-400">Driver Asks: {scenario.driverClaimPercent}%</span>
                <span>100% Full</span>
              </div>
            </div>

            {/* Step 3: Top-Down High-Res Camera */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center justify-between">
                <span>3. Tower Audit Photo (FEMA Proof)</span>
                <span className="text-rose-400 text-xs font-mono">Mandatory</span>
              </label>
              <button
                type="button"
                onClick={() => setPhotoSnapped(true)}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition ${
                  photoSnapped
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Camera className={`w-4 h-4 ${photoSnapped ? 'text-blue-400' : 'text-slate-400'}`} />
                {photoSnapped ? 'Top-Down High-Res Photo Bound to Load Ticket' : 'Snap High-Angle Bed Evidence'}
              </button>
            </div>

            {/* Step 4: Reconcile and Attest */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitLoadCall}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl text-sm font-['Chakra_Petch'] tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                APPROVE LOAD CALL &amp; DUMP TO GRINDER
              </button>
            </div>

            {/* Result Dialog Overlay */}
            {resultState !== 'idle' && (
              <div className="absolute inset-0 bg-slate-950/95 rounded-2xl p-6 flex flex-col justify-center items-center text-center z-30 backdrop-blur-md animate-in fade-in">
                {resultState === 'success' ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
                ) : (
                  <AlertTriangle className="w-16 h-16 text-rose-500 mb-3" />
                )}
                <h3 className={`text-xl font-bold font-['Chakra_Petch'] mb-2 ${resultState === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resultState === 'success' ? 'TOWER AUDIT VERIFIED' : 'COST OVERRUN PENALTY'}
                </h3>
                <p className="text-sm text-slate-200 max-w-md mb-6 leading-relaxed">
                  {resultMessage}
                </p>
                <button
                  onClick={onNextScenario}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl font-['Chakra_Petch'] tracking-wide transition shadow-lg shadow-amber-500/20"
                >
                  NEXT TRUCK AT TOWER →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
