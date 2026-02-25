
export interface KeywordData {
  term: string;
  volume: string; // Estimated label (e.g. "High", "Medium", "1.2k")
  kd: number; // 0-100
  language: 'English' | 'French' | 'MSA' | 'Darija' | 'Transliterated' | 'Mixed';
  intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
  currentRankLeader: string;
}

export interface KeywordCluster {
  name: string; // Hub Name
  description: string; // Brief description of the cluster
  primaryIntent: string; // Dominant intent of the hub
  businessRelevance: number; // 0-5 Score
  keywords: KeywordData[];
  totalVolumeEst: string;
}

export interface ContentRecommendation {
  title: string;
  type: 'Blog' | 'Landing Page' | 'Guide' | 'Technical';
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  aiAnswer: string; // 40-60 word direct answer block optimized for AI citation
  outline: string[]; // Strategic bullet points
  score: {
    depth: number;
    eeat: number;
    techSpeed: number;
  };
}

export interface DiscoveryKeyword {
  term: string;
  intent: string;
  searchTrend: string; // e.g., "Rising", "Stable", "Seasonal"
  painPoint: string;
  funnelStage: 'Awareness' | 'Consideration' | 'Conversion' | 'Retention';
}

export interface CommunityDiscussion {
  platform: 'Reddit' | 'Quora' | 'Other';
  topic: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Controversial';
  snippet: string;
}

export interface DeepDiscoveryData {
  painPoints: string[]; // Maps to "Content Gaps"
  peopleAlsoAsk: string[]; // Maps to "People Also Ask"
  discussions: CommunityDiscussion[];
  matrix: DiscoveryKeyword[];
}

export interface SeoAnalysisResult {
  executiveSummary: string;
  clusters: KeywordCluster[];
  recommendations: ContentRecommendation[];
  deepDiscovery: DeepDiscoveryData;
  sources: { title: string; uri: string }[];
}

export interface CompetitorPage {
  url: string;
  title: string;
  contentDepth: number; // 0-5
  eeat: number; // 0-5
  techSpeed: number; // 0-5
  estRefDomains: number;
  domainAuthority: number; // 0-100
  onPageScore: number; // 0-5
}

export interface CompetitorAnalysisResult {
  keyword: string;
  kdScore: number; // 0-100
  competitors: CompetitorPage[];
  gaps: {
    information: string[];
    structural: string[];
    monetization: string;
  };
  strategyNarrative: string;
  summary: string;
  tldr: string;
}

export interface ToolCallResponse {
    functionResponses: {
        id: string;
        name: string;
        response: object;
    }[];
}