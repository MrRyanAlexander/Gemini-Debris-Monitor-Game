import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Truck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  HelpCircle,
  Layers,
  Ruler,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { CertifierScenario, RigType } from '../types';

interface TruckCertifierProps {
  scenario: CertifierScenario;
  onSuccess: (valueSaved: number, note: string) => void;
  onFailure: (penaltyCost: number, reason: string) => void;
  onNextScenario: () => void;
}

export const TruckCertifier: React.FC<TruckCertifierProps> = ({
  scenario,
  onSuccess,
  onFailure,
  onNextScenario,
}) => {
  // Geometric calculation state
  const [selectedRigType, setSelectedRigType] = useState<RigType | ''>('');
  const [sideboardAdded, setSideboardAdded] = useState(false);
  const [dogHouseDeducted, setDogHouseDeducted] = useState(false);
  const [wheelWellsDeducted, setWheelWellsDeducted] = useState(false);
  const [chamferDeducted, setChamferDeducted] = useState(false);

  // Result state
  const [resultState, setResultState] = useState<'idle' | 'success' | 'failure'>('idle');
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    setSelectedRigType('');
    setSideboardAdded(false);
    setDogHouseDeducted(false);
    setWheelWellsDeducted(false);
    setChamferDeducted(false);
    setResultState('idle');
    setResultMessage('');
  }, [scenario]);

  // Base raw volume (L x W x H) / 27
  const baseCY = scenario.baseCubicYards;

  // Real-time calculation of player math
  let computedCY = baseCY;
  if (sideboardAdded && scenario.features.sideboardsValid) {
    // Add 1 ft to height
    computedCY = ((scenario.dimensions.lengthFeet * scenario.dimensions.widthFeet * (scenario.dimensions.heightFeet + (scenario.features.sideboardsHeightInches / 12))) / 27);
  }
  if (dogHouseDeducted && scenario.features.hasDogHouse) {
    computedCY -= scenario.features.dogHouseCY;
  }
  if (wheelWellsDeducted && scenario.features.hasWheelWells) {
    computedCY -= scenario.features.wheelWellsCY;
  }
  if (chamferDeducted && scenario.features.hasChamferedTailgate) {
    computedCY -= scenario.features.chamferedCY;
  }
  computedCY = Math.max(0, Number(computedCY.toFixed(1)));

  // Trap 1: Frameless Dump Trailer Rejection (USACE Mandate)
  const handleRejectFramelessDump = () => {
    if (resultState !== 'idle') return;

    if (scenario.isFramelessDump) {
      setResultState('success');
      const msg = `CRITICAL SAFETY INTERVENTION! USACE and FEMA PA safety rules strictly forbid Frameless Dump Trailers due to severe tip-over rollover hazards at TDSR grinding sites. Truck banned!`;
      setResultMessage(msg);
      onSuccess(8500, 'Frameless Dump Banned');
    } else {
      setResultState('failure');
      const msg = `MISTAKE: This rig is a certified stable chassis dump, not a frameless dump. Certification improperly denied.`;
      setResultMessage(msg);
      onFailure(2500, msg);
    }
  };

  // Submit Certification Plate
  const handleCertifyPlacard = () => {
    if (resultState !== 'idle') return;

    // Check Frameless Dump
    if (scenario.isFramelessDump) {
      setResultState('failure');
      const msg = `FATAL SAFETY HAZARD CERTIFIED: You certified a Frameless Dump Trailer into the disaster hauling fleet! USACE safety inspectors shut down the staging area following a rollover incident.`;
      setResultMessage(msg);
      onFailure(12000, msg);
      return;
    }

    if (!selectedRigType) {
      alert('Please classify the Rig Type first.');
      return;
    }

    // Check Rig classification
    if (selectedRigType !== scenario.rigType) {
      setResultState('failure');
      const msg = `RIG CLASSIFICATION ERROR: You tagged this as "${selectedRigType}", but vehicle registration confirms "${scenario.rigType}". Mislabeled trucks fail ADMS audit verification.`;
      setResultMessage(msg);
      onFailure(3000, msg);
      return;
    }

    // Check required deductions
    if (scenario.features.hasDogHouse && !dogHouseDeducted) {
      setResultState('failure');
      const msg = `FAILED DEDUCTION: You forgot to deduct the front hydraulic hoist cover ("Dog House", -${scenario.features.dogHouseCY} CY). Overpaying by 2+ yards over 500 trips costs taxpayers over $30,000!`;
      setResultMessage(msg);
      onFailure(6500, msg);
      return;
    }

    if (scenario.features.hasWheelWells && !wheelWellsDeducted) {
      setResultState('failure');
      const msg = `FAILED DEDUCTION: You missed wheel well intrusions into the bed floor (-${scenario.features.wheelWellsCY} CY). Inaccurate certifications trigger clawbacks.`;
      setResultMessage(msg);
      onFailure(4500, msg);
      return;
    }

    if (scenario.features.sideboardsValid && !sideboardAdded) {
      setResultState('failure');
      const msg = `MEASUREMENT DISCREPANCY: The truck has reinforced, bolted sideboards (+12") that were properly secured, but you failed to credit the certified capacity.`;
      setResultMessage(msg);
      onFailure(2000, msg);
      return;
    }

    // Passed math certification!
    setResultState('success');
    const msg = `100% MATHEMATICAL PRECISION! Certified at ${computedCY} Cubic Yards with placard ADMS-${Math.floor(1000 + Math.random() * 9000)}. Stencil printed and vehicle cleared to haul!`;
    setResultMessage(msg);
    onSuccess(7500, 'Accurate Truck Certification');
  };

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ROLE 4: TRUCK CERTIFIER
            </span>
            <span className="text-xs text-slate-400">The Geometrician</span>
          </div>
          <h2 className="text-xl font-bold font-['Chakra_Petch'] text-white mt-1">
            Fleet Geometry, Additions, &amp; Volume Deductions
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Before any hauler can load debris, you must categorize the rig, calculate baseline cubic yards (L × W × H / 27), add secure sideboards, and deduct dog houses and wheel wells.
          </p>
        </div>

        {/* Status Callout */}
        <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Fleet Staging Depot:</span>{' '}
          <strong className="text-cyan-400">Inspection Pit #1</strong>
        </div>
      </div>

      {/* Main Grid: Truck Blueprint on Left, Calculator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Blueprint Schematic */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/90 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                VEHICLE BLUEPRINT &amp; PHYSICAL BED FEATURES
              </span>
              <span className="text-amber-400 font-bold">{scenario.licensePlate}</span>
            </div>

            {/* Blueprint Diagram */}
            <div className="p-6 bg-slate-950 min-h-[300px] flex flex-col justify-center items-center relative">
              <div className="w-full max-w-lg p-5 rounded-xl border-2 border-cyan-500/40 bg-slate-900/90 relative shadow-2xl">
                {/* Truck Info Header */}
                <div className="flex justify-between items-center text-xs font-mono border-b border-slate-700 pb-2 mb-4">
                  <span className="text-slate-300">Contractor: <strong className="text-white">{scenario.contractorName}</strong></span>
                  <span className="text-cyan-300">Chassis Model: {scenario.rigType}</span>
                </div>

                {/* Simulated Truck Bed Geometry Diagram */}
                <div className="relative border-2 border-slate-600 rounded bg-slate-950/80 p-4 h-48 flex flex-col justify-between">
                  {/* Sideboard Area */}
                  {scenario.features.sideboardsValid && (
                    <div
                      onClick={() => setSideboardAdded(!sideboardAdded)}
                      className={`border-2 border-dashed rounded p-1.5 text-center cursor-pointer transition text-xs font-mono ${
                        sideboardAdded
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : 'border-amber-400 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                      }`}
                    >
                      [TAP TO ADD] +12" Solid Wooden Sideboards (Bolted &amp; Sturdy)
                    </div>
                  )}

                  {/* Bed Center Dimensions */}
                  <div className="my-auto flex items-center justify-between text-xs font-mono text-slate-300 px-4">
                    <span>L: {scenario.dimensions.lengthFeet} ft</span>
                    <span>W: {scenario.dimensions.widthFeet} ft</span>
                    <span>H: {scenario.dimensions.heightFeet} ft</span>
                  </div>

                  {/* Deductions: Dog House & Wheel Wells */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {scenario.features.hasDogHouse && (
                      <button
                        type="button"
                        onClick={() => setDogHouseDeducted(!dogHouseDeducted)}
                        className={`p-2 rounded text-[11px] font-mono border transition ${
                          dogHouseDeducted
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        [TAP TO DEDUCT] Dog House (-{scenario.features.dogHouseCY} CY)
                      </button>
                    )}

                    {scenario.features.hasWheelWells && (
                      <button
                        type="button"
                        onClick={() => setWheelWellsDeducted(!wheelWellsDeducted)}
                        className={`p-2 rounded text-[11px] font-mono border transition ${
                          wheelWellsDeducted
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        [TAP TO DEDUCT] Wheel Wells (-{scenario.features.wheelWellsCY} CY)
                      </button>
                    )}
                  </div>
                </div>

                {/* USACE Safety Ban Alert for Frameless Dump */}
                {scenario.isFramelessDump && (
                  <div className="mt-4 p-3 rounded-lg bg-rose-950/70 border border-rose-500/60 text-xs font-mono text-rose-200 flex items-center justify-between">
                    <span>⚠️ Warning: Rig is a Frameless Dump Trailer!</span>
                    <button
                      type="button"
                      onClick={handleRejectFramelessDump}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded transition text-xs"
                    >
                      BAM: REJECT RIG (USACE BAN)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Formula Reference */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Volume Formula: <strong className="text-white">(L × W × H) ÷ 27 cu ft</strong></span>
              <span>Base CY: <strong className="text-amber-400">{scenario.baseCubicYards} CY</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: ADMS Vehicle Certifier Terminal */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-bold text-cyan-400">
                ADMS VEHICLE CERTIFICATION STATION
              </span>
              <span className="text-[10px] font-mono text-slate-400">FORM 90-128</span>
            </div>

            {/* Step 1: Name That Rig */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center justify-between">
                <span>1. Categorize Rig Type</span>
                <span className="text-rose-400 text-xs font-mono">*Required</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  'Self-Loader (Grapple)',
                  'Pup Trailer',
                  'Bucket Truck',
                  'Round Bottom',
                  'Box Truck',
                  'Frameless Dump Trailer',
                ] as RigType[]).map((rig) => (
                  <button
                    key={rig}
                    type="button"
                    onClick={() => setSelectedRigType(rig)}
                    className={`p-2 rounded-lg text-xs font-mono text-left border transition ${
                      selectedRigType === rig
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {rig}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Math Summary & Net Capacity */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Raw Geometric Volume:</span>
                <span className="text-white font-bold">{scenario.baseCubicYards} CY</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sideboard Addition:</span>
                <span className={sideboardAdded ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {sideboardAdded ? `+${(computedCY - baseCY).toFixed(1)} CY` : '+0.0 CY'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dog House / Wells Deduction:</span>
                <span className={dogHouseDeducted || wheelWellsDeducted ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                  {dogHouseDeducted ? `-${scenario.features.dogHouseCY} CY ` : ''}
                  {wheelWellsDeducted ? `-${scenario.features.wheelWellsCY} CY` : ''}
                  {!dogHouseDeducted && !wheelWellsDeducted && '-0.0 CY'}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-200">NET CERTIFIED CAPACITY:</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  {computedCY} CY
                </span>
              </div>
            </div>

            {/* Submit Certification */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCertifyPlacard}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold py-3 rounded-xl text-sm font-['Chakra_Petch'] tracking-wider shadow-lg shadow-cyan-500/20 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-slate-950" />
                ISSUE OFFICIAL ADMS PLACARD STENCIL
              </button>
            </div>

            {/* Result Dialog Overlay */}
            {resultState !== 'idle' && (
              <div className="absolute inset-0 bg-slate-950/95 rounded-2xl p-6 flex flex-col justify-center items-center text-center z-30 backdrop-blur-md animate-in fade-in">
                {resultState === 'success' ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
                ) : (
                  <AlertOctagon className="w-16 h-16 text-rose-500 mb-3" />
                )}
                <h3 className={`text-xl font-bold font-['Chakra_Petch'] mb-2 ${resultState === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resultState === 'success' ? 'TRUCK CERTIFICATION AUDIT PASSED' : 'FLEET CERTIFICATION ERROR'}
                </h3>
                <p className="text-sm text-slate-200 max-w-md mb-6 leading-relaxed">
                  {resultMessage}
                </p>
                <button
                  onClick={onNextScenario}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl font-['Chakra_Petch'] tracking-wide transition shadow-lg shadow-cyan-500/20"
                >
                  NEXT TRUCK TO CERTIFY →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
