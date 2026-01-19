
export interface AnalysisResult {
  videoId: string;
  text: string;
  timestamp: number;
}

export interface InsuranceReport {
  liabilityEstimate: string;
  impactZones: string[];
  weatherConditions: string;
  roadSurface: string;
  metadata: {
    makeModel: string;
    licensePlate: string;
  };
}

export interface GroundingLink {
  title: string;
  uri: string;
}

// Interface for video generation results from Veo
export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  status: 'completed' | 'failed' | 'processing';
  config: {
    resolution: '720p' | '1080p';
    aspectRatio: '16:9' | '9:16';
  };
}
