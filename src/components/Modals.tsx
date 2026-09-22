import React from 'react';
import {
  X,
  Award,
  TrendingUp,
  ShieldCheck,
  Scale,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Badge, LeaderboardEntry } from '../types';

interface ModalsProps {
  badgesOpen: boolean;
  onCloseBadges: () => void;
  badges: Badge[];
  leaderboardOpen: boolean;
  onCloseLeaderboard: () => void;
  leaderboard: LeaderboardEntry[];
  complianceOpen: boolean;
  onCloseCompliance: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  badgesOpen,
  onCloseBadges,
  badges,
  leaderboardOpen,
  onCloseLeaderboard,
  leaderboard,
  complianceOpen,
  onCloseCompliance,
}) => {
  return (
    <>
      {/* 1. BADGES MODAL */}
      {badgesOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={onCloseBadges}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <h3 className="text-xl font-bold font-['Chakra_Petch'] text-white">
                  Field Career Badges
                </h3>
                <p className="text-xs text-slate-400">
                  Earn accredited FEMA Public Assistance monitor recognitions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border transition ${
                    b.unlocked
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-800/40 border-slate-700/60 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0">{b.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-100 font-['Chakra_Petch']">
                          {b.name}
                        </h4>
                        {b.unlocked ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {b.progress}/{b.target}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {b.description}
                      </p>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (b.progress / b.target) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. LEADERBOARD MODAL */}
      {leaderboardOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={onCloseLeaderboard}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
                📊
              </div>
              <div>
                <h3 className="text-xl font-bold font-['Chakra_Petch'] text-white">
                  Global Debris Auditor Rankings
                </h3>
                <p className="text-xs text-slate-400">
                  Track top frontline monitors protecting taxpayer disaster funds
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 font-mono text-xs">
              <div className="grid grid-cols-12 p-3 bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Auditor / Role</div>
                <div className="col-span-3 text-right">Taxpayer Saved</div>
                <div className="col-span-3 text-right">Accuracy</div>
              </div>

              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-12 p-3 items-center transition ${
                    entry.isPlayer
                      ? 'bg-amber-500/20 text-amber-200 border-l-4 border-l-amber-400'
                      : 'hover:bg-slate-800/30 text-slate-200'
                  }`}
                >
                  <div className="col-span-1 text-center font-bold text-slate-400">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                  </div>
                  <div className="col-span-5">
                    <div className="font-bold flex items-center gap-1.5">
                      {entry.name}
                      {entry.isPlayer && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{entry.roleTitle}</div>
                  </div>
                  <div className="col-span-3 text-right font-bold text-emerald-400">
                    ${entry.taxpayerSaved.toLocaleString()}
                  </div>
                  <div className="col-span-3 text-right font-semibold">
                    {entry.accuracy}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. FEMA COMPLIANCE & BEST PRACTICE GUIDE MODAL */}
      {complianceOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={onCloseCompliance}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
                ⚖️
              </div>
              <div>
                <h3 className="text-xl font-bold font-['Chakra_Petch'] text-white">
                  FEMA PA Compliance Guide &amp; Best Practices
                </h3>
                <p className="text-xs text-slate-400">
                  Regulatory framework: 44 CFR § 206.224 &amp; FEMA Debris Monitoring Guide (PAPPG)
                </p>
              </div>
            </div>

            {/* Warning Callout Box */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm font-['Chakra_Petch']">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                ⚠️ FEMA COMPLIANCE WARNING:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                If it isn't documented, FEMA won't reimburse it! Every role requires absolute adherence to the rules. A hanger is not eligible just because it is broken; it must be <strong>2 inches at the break</strong> AND threaten improved property or public ROW. A leaner must lean &gt;30 degrees or have a split trunk with &gt;6" DBH. Crossing onto private property without an executed ROE triggers immediate audit clawbacks and fraud investigations.
              </p>
            </div>

            {/* Best Practice Callout Box */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm font-['Chakra_Petch']">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                💡 BEST PRACTICE: Segregation of Duties &amp; Conflict of Interest Prevention
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                The <strong>Debris Monitoring Firm</strong> and the <strong>Debris Removal/Hauling Contractor</strong> MUST be separate entities procured under distinct contracts. The crew will pressure you to move faster, approve heavier loads, and cut more trees because they are paid per unit or volume. <strong>You are the shield for the taxpayer.</strong> Rely on ADMS hard-stops (mandatory photos, GPS waypoints, automated deduction calculations) to remove human error and withstand contractor pressure.
              </p>
            </div>

            {/* Matrix of Roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 font-mono">1. Collection Monitor</h4>
                <p className="text-slate-300">
                  Filters waste streams, blocks PPDR yard grabs unless ROE exists, prevents mixing municipal trash into disaster C&amp;D.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400 font-mono">2. Disposal Tower Monitor</h4>
                <p className="text-slate-300">
                  Inspects top-down bed volume from scaffolding. Slashes loads "hauling air", flags artificial water weight, and denies ghost trucks.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-emerald-400 font-mono">3. LHS Tree Monitor</h4>
                <p className="text-slate-300">
                  Enforces 2" caliper rule on hangers, 30° / 6" DBH rule on leaners, and forensic CSI swipe check to stop paying for deferred pre-existing rot.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-cyan-400 font-mono">4. Truck Certifier</h4>
                <p className="text-slate-300">
                  Bans illegal frameless dump trailers (USACE safety rule), calculates cubic yardage, and accurately deducts dog houses and wheel wells.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
