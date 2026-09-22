import React, { useState, useEffect } from 'react';
import {
  TreePine,
  Search,
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Ruler,
  Bug,
  Sparkles,
  HelpCircle,
  Radio,
  Eye,
  Scissors,
} from 'lucide-react';
import { LHSScenario } from '../types';

interface LHSMonitorProps {
  scenario: LHSScenario;
  onSuccess: (valueSaved: number, note: string) => void;
  onFailure: (penaltyCost: number, reason: string) => void;
  onNextScenario: () => void;
}

export const LHSMonitor: React.FC<LHSMonitorProps> = ({
  scenario,
  onSuccess,
  onFailure,
  onNextScenario,
}) => {
  // Mini-game specific states
  // 1. Find Hanger
  const [foundHanger, setFoundHanger] = useState(false);
  // 2. Measure Hanger
  const [caliperDiameter, setCaliperDiameter] = useState<number>(3.0);
  // 3. Judge Leaner
  const [protractorAngle, setProtractorAngle] = useState<number>(25);
  // 4. CSI Wood
  const [csiInspected, setCsiInspected] = useState(false);

  // Time limit
  const [timeLeft, setTimeLeft] = useState(scenario.timeLimitSec);
  const [resultState, setResultState] = useState<'idle' | 'success' | 'failure'>('idle');
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    setFoundHanger(false);
    setCaliperDiameter(scenario.data.diameterInches || 2.5);
    setProtractorAngle(scenario.data.leanDegrees ? scenario.data.leanDegrees - 5 : 28);
    setCsiInspected(false);
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
    const msg = 'Time expired! Tree crew drove past or cut without proper documentation. Ineligible unit-price hazard was not stopped.';
    setResultMessage(msg);
    onFailure(scenario.femaValue * 0.75, msg);
  };

  // Mini-Game 1: Find the Hanger click
  const handleTapCanopyTarget = (target: { id: string; isHanger: boolean }) => {
    if (resultState !== 'idle') return;

    if (target.isHanger) {
      setFoundHanger(true);
      setResultState('success');
      const msg = 'TARGET ACQUIRED! You pinpointed the dangling limb suspended in the public roadway canopy in time for bucket truck deployment.';
      setResultMessage(msg);
      onSuccess(scenario.femaValue, 'Hanger Located');
    } else {
      setResultState('failure');
      const msg = 'MISIDENTIFIED: That was healthy foliage, not a broken hanging branch. Crew boom set up on false alarm.';
      setResultMessage(msg);
      onFailure(scenario.femaValue * 0.4, msg);
    }
  };

  // Mini-Game 2: Measure Hanger (Swipe Right: Approve cut, Swipe Left: Reject cut)
  const handleMeasureDecision = (approve: boolean) => {
    if (resultState !== 'idle') return;

    const diameter = scenario.data.diameterInches || 0;
    const isEligible = diameter >= 2.0 && scenario.data.overPublicROW;

    if (approve) {
      if (isEligible) {
        setResultState('success');
        const msg = `APPROVED: Limb measures ${diameter.toFixed(1)}" (>= 2.0") and threatens public ROW. Valid FEMA PA unit cut ($175) approved.`;
        setResultMessage(msg);
        onSuccess(scenario.femaValue, 'Valid Hanger Cut Approved');
      } else {
        setResultState('failure');
        const msg = `AUDIT FAILURE: You approved a ${diameter.toFixed(1)}" limb! FEMA strictly mandates >= 2 inches diameter at the point of break. Twig trimming is non-reimbursable routine maintenance.`;
        setResultMessage(msg);
        onFailure(scenario.femaValue, msg);
      }
    } else {
      // Rejected
      if (!isEligible) {
        setResultState('success');
        const msg = `EXCELLENT DENIAL! Limb was only ${diameter.toFixed(1)}" (< 2.0"). You prevented fraudulent unit-rate contractor billing!`;
        setResultMessage(msg);
        onSuccess(scenario.femaValue, 'Ineligible Twig Rejected');
      } else {
        setResultState('failure');
        const msg = `MISTAKE: This ${diameter.toFixed(1)}" broken hanger was a bona fide safety hazard over public ROW. You mistakenly rejected an eligible tree cut.`;
        setResultMessage(msg);
        onFailure(scenario.femaValue * 0.4, msg);
      }
    }
  };

  // Mini-Game 3: Judge Leaner (Check lean > 30 deg and DBH > 6 in)
  const handleLeanerDecision = (approve: boolean) => {
    if (resultState !== 'idle') return;

    const lean = scenario.data.leanDegrees || 0;
    const dbh = scenario.data.dbhInches || 0;
    const isEligible = lean > 30 && dbh >= 6;

    if (approve) {
      if (isEligible) {
        setResultState('success');
        const msg = `ACCURATE HAZARD ASSESSMENT! Lean angle is ${lean}° (>30°) and DBH is ${dbh}" (>6"). Complete tree removal is FEMA-eligible.`;
        setResultMessage(msg);
        onSuccess(scenario.femaValue, 'Eligible Leaner Approved');
      } else {
        setResultState('failure');
        const msg = `DE-OBLIGATION PENALTY: You approved cutting a tree with only ${lean}° lean! FEMA PA policy requires >30° lean from vertical or split trunk. Contractor received $950 improper payment.`;
        setResultMessage(msg);
        onFailure(scenario.femaValue, msg);
      }
    } else {
      if (!isEligible) {
        setResultState('success');
        const msg = `SUPERB REJECTION: Tree lean was only ${lean}° (below 30° threshold). Prevented costly unnecessary tree felling.`;
        setResultMessage(msg);
        onSuccess(scenario.femaValue, 'Ineligible Leaner Rejected');
      } else {
        setResultState('failure');
        const msg = `ERROR: Tree is tilted ${lean}° over the roadway and poses an imminent threat. Rejection left a road hazard standing.`;
        setResultMessage(msg);
        onFailure(scenario.femaValue * 0.4, msg);
      }
    }
  };

  // Mini-Game 4: CSI Wood (Swipe Right: Storm Damage Eligible, Swipe Left: Rot Ineligible)
  const handleCSIDecision = (isStormDamageClaim: boolean) => {
    if (resultState !== 'idle') return;

    const actualStorm = scenario.data.isStormDamage;

    if (isStormDamageClaim === actualStorm) {
      setResultState('success');
      if (actualStorm) {
        const msg = `ARBORIST CONFIRMATION: Splintered heartwood and green vascular cambium prove acute storm trauma. Approved!`;
        setResultMessage(msg);
        onSuccess(scenario.femaValue, 'Storm Damage Confirmed');
      } else {
        const msg = `ARBORIST MASTER: Caught pre-existing wood decay / beetle rot! FEMA does not pay for deferred maintenance. Saved $5,500!`;
        setResultMessage(msg);
        onSuccess(scenario.femaValue, 'Pre-Existing Rot Rejected');
      }
    } else {
      setResultState('failure');
      const msg = actualStorm
        ? `MISTAKE: This was fresh storm-induced breakage, but you marked it as rot.`
        : `FRAUD AUDIT ALERT: You approved pre-existing dead wood with bracket fungus! FEMA PA auditors clawed back all funds.`;
      setResultMessage(msg);
      onFailure(scenario.femaValue, msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ROLE 3: LHS MONITOR
            </span>
            <span className="text-xs text-slate-400">Leaners, Hangers, &amp; Stumps</span>
          </div>
          <h2 className="text-xl font-bold font-['Chakra_Petch'] text-white mt-1">
            {scenario.title}
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            {scenario.description}
          </p>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 font-mono">
          <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-500 animate-bounce' : 'text-emerald-400'}`} />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Arborist Action Timer</div>
            <div className={`text-lg font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas on Left, Tool Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Arena */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/90 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                CANOPY &amp; TIMBER FIELD VIEW
              </span>
              <span className="text-amber-400">Public ROW Corridor</span>
            </div>

            {/* Interactive Canvas Rendering for each Mini-Game */}
            <div className="p-6 bg-slate-950 min-h-[320px] flex flex-col justify-center items-center relative overflow-hidden">
              {/* MINI-GAME 1: FIND HANGER */}
              {scenario.miniGame === 'find_hanger' && (
                <div className="w-full h-64 bg-emerald-950/40 rounded-xl border border-emerald-500/30 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#10b98122_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="text-center pointer-events-none z-0">
                    <TreePine className="w-32 h-32 text-emerald-600/30 mx-auto" />
                    <p className="text-xs text-slate-400 font-mono">SCAN DENSE CANOPY FOR HANGING FRACTURE</p>
                  </div>

                  {/* Clickable Targets */}
                  {scenario.data.targets?.map((tgt) => (
                    <button
                      key={tgt.id}
                      onClick={() => handleTapCanopyTarget(tgt)}
                      style={{
                        position: 'absolute',
                        left: `${tgt.x}%`,
                        top: `${tgt.y}%`,
                        width: `${tgt.radius * 2}px`,
                        height: `${tgt.radius * 2}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="rounded-full border-2 border-dashed border-amber-400/60 hover:border-amber-300 bg-amber-500/10 hover:bg-amber-500/30 flex items-center justify-center transition active:scale-95 group cursor-pointer"
                    >
                      <Search className="w-4 h-4 text-amber-300 group-hover:scale-125 transition" />
                    </button>
                  ))}
                </div>
              )}

              {/* MINI-GAME 2: MEASURE HANGER */}
              {scenario.miniGame === 'measure_hanger' && (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="w-full max-w-sm h-48 bg-slate-900 rounded-xl border-2 border-slate-700 relative flex items-center justify-center overflow-hidden">
                    {/* Branch Illustration */}
                    <div
                      className="bg-amber-800 rounded-md shadow-lg flex items-center justify-center text-xs font-mono text-amber-200 border border-amber-700"
                      style={{
                        width: `${(scenario.data.diameterInches || 2) * 35}px`,
                        height: '110px',
                      }}
                    >
                      <span className="font-bold text-sm bg-black/60 px-2 py-0.5 rounded">
                        Ø {scenario.data.diameterInches?.toFixed(1)}" Break
                      </span>
                    </div>

                    {/* Caliper Overlay */}
                    <div className="absolute inset-x-4 top-2 flex justify-between text-[11px] font-mono text-cyan-400 border-b border-cyan-500/50 pb-1">
                      <span>ELECTRONIC CALIPER:</span>
                      <span>{scenario.data.diameterInches?.toFixed(2)} INCHES</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-400 text-center">
                    FEMA Minimum Requirement: <strong className="text-white">&gt;= 2.00 inches</strong> at point of break.
                  </div>
                </div>
              )}

              {/* MINI-GAME 3: JUDGE LEANER */}
              {scenario.miniGame === 'judge_leaner' && (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="w-full max-w-sm h-52 bg-slate-900 rounded-xl border-2 border-slate-700 relative flex items-end justify-center overflow-hidden p-4">
                    {/* Ground line */}
                    <div className="absolute bottom-4 inset-x-0 border-b-2 border-emerald-600"></div>

                    {/* Leaning Tree Trunk */}
                    <div
                      className="w-10 bg-amber-900 border-2 border-amber-700 rounded-t origin-bottom transition-transform shadow-xl flex items-center justify-center text-xs font-mono text-amber-200"
                      style={{
                        height: '140px',
                        transform: `rotate(${scenario.data.leanDegrees || 25}deg)`,
                      }}
                    >
                      <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold">
                        DBH: {scenario.data.dbhInches}"
                      </span>
                    </div>

                    {/* Angle Protractor Badge */}
                    <div className="absolute top-3 left-4 bg-slate-950/90 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
                      <div className="text-[10px] text-slate-400">TILT ANGLE (FROM VERTICAL)</div>
                      <div className="text-lg font-bold text-cyan-400">{scenario.data.leanDegrees}°</div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-400 text-center">
                    FEMA Leaner Criteria: <strong className="text-white">&gt; 30° lean</strong> from vertical AND <strong className="text-white">&gt; 6" DBH</strong>.
                  </div>
                </div>
              )}

              {/* MINI-GAME 4: CSI WOOD */}
              {scenario.miniGame === 'csi_wood' && (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="w-full max-w-sm h-52 bg-slate-900 rounded-xl border-2 border-slate-700 relative flex items-center justify-center p-4">
                    {scenario.data.isStormDamage ? (
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-3xl">
                          🪵
                        </div>
                        <div className="text-xs font-mono text-emerald-300 font-bold uppercase">
                          Splintered Fresh Heartwood Fracture
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xs font-mono">
                          Acute wind-shear tensile break. Green vascular cambium active. Zero fungal decay.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mx-auto text-3xl">
                          🍄
                        </div>
                        <div className="text-xs font-mono text-rose-300 font-bold uppercase">
                          Bracket Fungus &amp; Wood Borer Decay
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xs font-mono">
                          Pre-existing hollow core rot. Tree died months prior to hurricane impact.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-mono text-slate-400 text-center">
                    FEMA Mandate: <strong className="text-white">Deferred maintenance is NEVER eligible</strong>. Only direct disaster impacts qualify.
                  </div>
                </div>
              )}
            </div>

            {/* Crew Pressure Audio Feed */}
            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-start gap-3 text-xs">
              <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 font-mono">
                <strong className="text-emerald-300 font-semibold">TREE CUTTING CONTRACTOR CREW:</strong>
                <p className="mt-0.5 italic text-slate-200">"{scenario.crewPressureText}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Arborist Decision Console */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-bold text-emerald-400">
                LHS FIELD AUDIT DISPATCH
              </span>
              <span className="text-[10px] font-mono text-slate-400">USACE SPEC CAT A</span>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-semibold block mb-1">HAZARD CRITERIA SUMMARY:</span>
                {scenario.hazardDescription}
              </div>

              {/* Action Buttons for Mini-Games */}
              {scenario.miniGame === 'measure_hanger' && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                    Monitor Verdict on Hanger Cut:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleMeasureDecision(false)}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      REJECT (Under 2")
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMeasureDecision(true)}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      APPROVE CUT (&gt;= 2")
                    </button>
                  </div>
                </div>
              )}

              {scenario.miniGame === 'judge_leaner' && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                    Monitor Verdict on Tree Felling:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleLeanerDecision(false)}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      REJECT (Under 30°)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLeanerDecision(true)}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      APPROVE TAKEDOWN (&gt;30°)
                    </button>
                  </div>
                </div>
              )}

              {scenario.miniGame === 'csi_wood' && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                    CSI Forensic Timber Determination:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleCSIDecision(false)}
                      className="py-3 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Bug className="w-4 h-4 text-rose-400" />
                      PRE-EXISTING ROT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCSIDecision(true)}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      STORM DAMAGE
                    </button>
                  </div>
                </div>
              )}

              {scenario.miniGame === 'find_hanger' && (
                <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                  Tap directly on the broken hanging branch inside the canopy to verify location!
                </div>
              )}
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
                  {resultState === 'success' ? 'LHS AUDIT APPROVED' : 'FEMA ARBORIST VIOLATION'}
                </h3>
                <p className="text-sm text-slate-200 max-w-md mb-6 leading-relaxed">
                  {resultMessage}
                </p>
                <button
                  onClick={onNextScenario}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl font-['Chakra_Petch'] tracking-wide transition shadow-lg shadow-emerald-500/20"
                >
                  NEXT TREE CREW DISPATCH →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
