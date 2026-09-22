import React from 'react';
import { ShieldAlert, Award, TrendingUp, AlertTriangle, DollarSign, Truck, Sparkles, Scale } from 'lucide-react';
import { CareerStats } from '../types';

interface HeaderProps {
  stats: CareerStats;
  activeRole: string;
  onOpenBadges: () => void;
  onOpenLeaderboard: () => void;
  onOpenComplianceDoc: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  activeRole,
  onOpenBadges,
  onOpenLeaderboard,
  onOpenComplianceDoc,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const overrunRisk = stats.costOverrun > 0;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* Upper ticker bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-300 font-mono">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold text-amber-200 uppercase tracking-wider">ADMS ACTIVE AUDIT LINK</span>
          <span className="text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">FEMA Public Assistance Grant (Category A: Debris Removal)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenComplianceDoc}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-200 underline font-semibold transition"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>FEMA PA Guidance Manual</span>
          </button>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Auditor Status: <strong className="text-emerald-400 font-bold">In Compliance</strong></span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
            <ShieldAlert className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold font-['Chakra_Petch'] tracking-wide text-white">
                THE DEBRIS MONITOR
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                V1.0 SIM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Taxpayer Shield • Segregation of Duties • 100% Debris Audit Precision
            </p>
          </div>
        </div>

        {/* HUD Metrics Cards */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs font-mono">
          {/* Taxpayer Saved */}
          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">Taxpayer Saved</div>
              <div className="text-emerald-400 font-bold text-sm">
                {formatCurrency(stats.taxpayerDollarsSaved)}
              </div>
            </div>
          </div>

          {/* Cost Overrun Meter */}
          <div
            className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 transition ${
              overrunRisk
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
            }`}
          >
            <div className={`p-1 rounded ${overrunRisk ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">FEMA De-Obligated</div>
              <div className={`font-bold text-sm ${overrunRisk ? 'text-rose-400 font-mono' : 'text-slate-400'}`}>
                {formatCurrency(stats.costOverrun)}
              </div>
            </div>
          </div>

          {/* Trucks / Operations Processed */}
          <div className="hidden sm:flex bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 items-center gap-2">
            <div className="p-1 rounded bg-blue-500/10 text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">Operations</div>
              <div className="text-white font-bold text-sm">
                {stats.trucksProcessed} <span className="text-[10px] text-slate-400">audits</span>
              </div>
            </div>
          </div>

          {/* Badges / Leaderboard modal triggers */}
          <button
            onClick={onOpenBadges}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-1.5 rounded-lg transition"
            title="View Earned Field Badges"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{stats.badges.length} Badges</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition"
            title="View Global Auditors Leaderboard"
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline font-semibold">Rankings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
