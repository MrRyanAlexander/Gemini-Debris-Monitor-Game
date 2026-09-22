export type DebrisType = 'Vegetative' | 'C&D' | 'HHW' | 'White Goods' | 'Ineligible Garbage';

export type RoleId = 'collection' | 'disposal' | 'lhs' | 'certifier';

export interface CareerStats {
  trucksProcessed: number;
  fraudPrevented: number;
  taxpayerDollarsSaved: number;
  costOverrun: number; // Penalty when making compliance mistakes
  reputation: number; // 0 - 100%
  experiencePoints: number;
  level: number;
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  roleTitle: string;
  taxpayerSaved: number;
  accuracy: number;
  badgesCount: number;
  isPlayer?: boolean;
}

// Collection Monitor Types
export interface CollectionScenario {
  id: string;
  truckPlacard: string;
  capacityCY: number;
  streetAddress: string;
  isPublicROW: boolean; // false = PPDR private property trap!
  hasROE: boolean; // Right-of-Entry executed
  pileVisual: string;
  primaryDebris: DebrisType;
  contamination: DebrisType | null; // e.g. C&D mixed into Vegetative or Garbage
  driverBribeOrPressure: string;
  timeLimitSec: number;
  value: number;
}

// Disposal Monitor Types
export interface DisposalScenario {
  id: string;
  ticketBarcode: string;
  truckPlacard: string;
  declaredDebris: DebrisType;
  originVerified: boolean; // if false: Ghost Truck!
  actualDebrisType: DebrisType;
  actualFillLevel: number; // e.g. 85%
  isHaulingAir: boolean; // hollow center
  isWaterWeight: boolean; // soaked C&D to fake weight
  driverClaimPercent: number;
  driverDialogue: string;
  truckBedVisual: {
    texture: 'logs_leaves' | 'concrete_drywall' | 'appliances' | 'chemical_drums' | 'mixed_trash';
    hasHollowPockets: boolean;
    hasWaterPuddles: boolean;
    apparentFill: number;
    trueFill: number;
  };
  timeLimitSec: number;
  value: number;
}

// LHS Monitor Types
export type LHSMiniGameType = 'find_hanger' | 'measure_hanger' | 'judge_leaner' | 'csi_wood';

export interface LHSScenario {
  id: string;
  miniGame: LHSMiniGameType;
  title: string;
  description: string;
  hazardDescription: string;
  data: {
    // For find hanger
    targets?: { x: number; y: number; radius: number; isHanger: boolean; id: string }[];
    // For measure hanger
    diameterInches?: number; // >= 2 inches at break required
    overPublicROW?: boolean;
    threatensImprovedProperty?: boolean;
    // For judge leaner
    leanDegrees?: number; // > 30 degrees from vertical required
    dbhInches?: number; // > 6 inches DBH required
    onPrivateProperty?: boolean;
    hasROE?: boolean;
    // For CSI wood
    damageType?: 'snapped_fresh_heartwood' | 'storm_uprooted' | 'beetle_borer_rot' | 'decaying_bracket_fungus' | 'dead_deferred_limbs';
    isStormDamage?: boolean; // Fresh storm vs deferred rot
  };
  crewPressureText: string;
  timeLimitSec: number;
  femaValue: number;
}

// Truck Certifier Types
export type RigType = 'Self-Loader (Grapple)' | 'Pup Trailer' | 'Bucket Truck' | 'Round Bottom' | 'Box Truck' | 'Frameless Dump Trailer';

export interface CertifierScenario {
  id: string;
  rigType: RigType;
  isFramelessDump: boolean; // Strict USACE Safety Ban!
  dimensions: {
    lengthFeet: number;
    widthFeet: number;
    heightFeet: number;
  };
  features: {
    sideboardsValid: boolean; // solid/secure additions
    sideboardsHeightInches: number;
    hasDogHouse: boolean; // front hydraulic cover deduction
    dogHouseCY: number;
    hasWheelWells: boolean; // wheel well intruding into bed deduction
    wheelWellsCY: number;
    hasChamferedTailgate: boolean; // sloped tailgate deduction
    chamferedCY: number;
  };
  licensePlate: string;
  contractorName: string;
  baseCubicYards: number;
  netCertifiedCubicYards: number;
}
