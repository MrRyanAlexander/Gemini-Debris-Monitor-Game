import React, { useState } from 'react';
import {
  RoleId,
  CareerStats,
  Badge,
  LeaderboardEntry,
} from './types';
import {
  INITIAL_BADGES,
  INITIAL_LEADERBOARD,
  COLLECTION_SCENARIOS,
  DISPOSAL_SCENARIOS,
  LHS_SCENARIOS,
  CERTIFIER_SCENARIOS,
} from './gameData';
import { Header } from './components/Header';
import { CollectionMonitor } from './components/CollectionMonitor';
import { DisposalTowerMonitor } from './components/DisposalTowerMonitor';
import { LHSMonitor } from './components/LHSMonitor';
import { TruckCertifier } from './components/TruckCertifier';
import { Modals } from './components/Modals';
import {
  Filter,
  Eye,
  TreePine,
  Calculator,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // Global Career Statistics
  const [stats, setStats] = useState<CareerStats>({
    trucksProcessed: 0,
    fraudPrevented: 0,
    taxpayerDollarsSaved: 0,
    costOverrun: 0,
    reputation: 100,
    experiencePoints: 0,
    level: 1,
    badges: [],
  });

  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  // Active Role Track
  const [activeRole, setActiveRole] = useState<RoleId>('collection');

  // Scenario Indices per role
  const [collectionIdx, setCollectionIdx] = useState(0);
  const [disposalIdx, setDisposalIdx] = useState(0);
  const [lhsIdx, setLhsIdx] = useState(0);
  const [certifierIdx, setCertifierIdx] = useState(0);

  // Modals state
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);

  // Check and unlock badges based on actions
  const checkBadgeProgress = (badgeId: string, increment: number = 1) => {
    setBadges((prevBadges) =>
      prevBadges.map((b) => {
        if (b.id === badgeId) {
          const newProgress = b.progress + increment;
          const unlocked = newProgress >= b.target;
          return {
            ...b,
            progress: newProgress,
            unlocked: b.unlocked || unlocked,
          };
        }
        return b;
      })
    );

    // Sync stats.badges
    setStats((prev) => {
      const targetBadge = badges.find((b) => b.id === badgeId);
      if (targetBadge && targetBadge.progress + increment >= targetBadge.target) {
        if (!prev.badges.includes(badgeId)) {
          return { ...prev, badges: [...prev.badges, badgeId] };
        }
      }
      return prev;
    });
  };

  // Handler for successful audit completion
  const handleSuccess = (valueSaved: number, note: string) => {
    setStats((prev) => {
      const newSaved = prev.taxpayerDollarsSaved + valueSaved;
      const newProcessed = prev.trucksProcessed + 1;
      const newFraud = prev.fraudPrevented + 1;

      // Update player on leaderboard
      setLeaderboard((prevLb) =>
        prevLb.map((entry) => {
          if (entry.isPlayer) {
            return {
              ...entry,
              taxpayerSaved: newSaved,
              accuracy: Math.min(100, Math.round((newFraud / Math.max(1, newProcessed)) * 100)),
            };
          }
          return entry;
        })
      );

      return {
        ...prev,
        taxpayerDollarsSaved: newSaved,
        trucksProcessed: newProcessed,
        fraudPrevented: newFraud,
        experiencePoints: prev.experiencePoints + 250,
      };
    });

    // Badge specific triggers
    if (note.includes('PPDR')) {
      checkBadgeProgress('trespass_denied');
    }
    if (note.includes('Hauling Air') || note.includes('Water Weight') || note.includes('Ghost')) {
      checkBadgeProgress('gatekeeper');
    }
    if (note.includes('Rot') || note.includes('Arborist')) {
      checkBadgeProgress('arborist_assassin');
    }
    if (note.includes('Certification') || note.includes('Dog House') || note.includes('Frameless')) {
      checkBadgeProgress('geometrician');
    }
    checkBadgeProgress('fema_auditor_shield');
  };

  // Handler for compliance infraction (Cost Overrun penalty)
  const handleFailure = (penaltyCost: number, reason: string) => {
    setStats((prev) => {
      const newOverrun = prev.costOverrun + penaltyCost;
      const newProcessed = prev.trucksProcessed + 1;

      setLeaderboard((prevLb) =>
        prevLb.map((entry) => {
          if (entry.isPlayer) {
            return {
              ...entry,
              accuracy: Math.max(50, Math.round((prev.fraudPrevented / newProcessed) * 100)),
            };
          }
          return entry;
        })
      );

      return {
        ...prev,
        costOverrun: newOverrun,
        trucksProcessed: newProcessed,
        reputation: Math.max(10, prev.reputation - 5),
      };
    });
  };

  // Cycle next scenario
  const handleNextCollection = () => {
    setCollectionIdx((prev) => (prev + 1) % COLLECTION_SCENARIOS.length);
  };
  const handleNextDisposal = () => {
    setDisposalIdx((prev) => (prev + 1) % DISPOSAL_SCENARIOS.length);
  };
  const handleNextLHS = () => {
    setLhsIdx((prev) => (prev + 1) % LHS_SCENARIOS.length);
  };
  const handleNextCertifier = () => {
    setCertifierIdx((prev) => (prev + 1) % CERTIFIER_SCENARIOS.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Upper Navigation & HUD */}
      <Header
        stats={stats}
        activeRole={activeRole}
        onOpenBadges={() => setBadgesOpen(true)}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onOpenComplianceDoc={() => setComplianceOpen(true)}
      />

      {/* Main Career Track Role Selector Tabs */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveRole('collection')}
            className={`py-3.5 px-4 text-xs font-mono font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition ${
              activeRole === 'collection'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>ROLE 1: COLLECTION (ORIGIN)</span>
          </button>

          <button
            onClick={() => setActiveRole('disposal')}
            className={`py-3.5 px-4 text-xs font-mono font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition ${
              activeRole === 'disposal'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>ROLE 2: DISPOSAL / TOWER</span>
          </button>

          <button
            onClick={() => setActiveRole('lhs')}
            className={`py-3.5 px-4 text-xs font-mono font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition ${
              activeRole === 'lhs'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <TreePine className="w-4 h-4" />
            <span>ROLE 3: LHS (TREES &amp; HANGERS)</span>
          </button>

          <button
            onClick={() => setActiveRole('certifier')}
            className={`py-3.5 px-4 text-xs font-mono font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition ${
              activeRole === 'certifier'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>ROLE 4: TRUCK CERTIFIER</span>
          </button>
        </div>
      </nav>

      {/* Main Simulation Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeRole === 'collection' && (
          <CollectionMonitor
            scenario={COLLECTION_SCENARIOS[collectionIdx]}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            onNextScenario={handleNextCollection}
          />
        )}

        {activeRole === 'disposal' && (
          <DisposalTowerMonitor
            scenario={DISPOSAL_SCENARIOS[disposalIdx]}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            onNextScenario={handleNextDisposal}
          />
        )}

        {activeRole === 'lhs' && (
          <LHSMonitor
            scenario={LHS_SCENARIOS[lhsIdx]}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            onNextScenario={handleNextLHS}
          />
        )}

        {activeRole === 'certifier' && (
          <TruckCertifier
            scenario={CERTIFIER_SCENARIOS[certifierIdx]}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            onNextScenario={handleNextCertifier}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>THE DEBRIS MONITOR (V1.0) • FEMA PA Debris Management Simulation</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Segregation of Duties Enforced: Independent Monitoring Architecture
          </span>
        </div>
      </footer>

      {/* Modals for Badges, Leaderboard, and Compliance Manual */}
      <Modals
        badgesOpen={badgesOpen}
        onCloseBadges={() => setBadgesOpen(false)}
        badges={badges}
        leaderboardOpen={leaderboardOpen}
        onCloseLeaderboard={() => setLeaderboardOpen(false)}
        leaderboard={leaderboard}
        complianceOpen={complianceOpen}
        onCloseCompliance={() => setComplianceOpen(false)}
      />
    </div>
  );
}
