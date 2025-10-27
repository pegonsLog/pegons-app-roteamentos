export interface RouteWaypoint {
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface RouteRequest {
  origin: RouteWaypoint;
  destination: RouteWaypoint;
  intermediates?: RouteWaypoint[];
  travelMode?: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER';
  routingPreference?: 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL' | 'TRAFFIC_UNAWARE';
  computeAlternativeRoutes?: boolean;
  routeModifiers?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
  };
}

export interface RouteLeg {
  distanceMeters: number;
  duration: string;
  staticDuration: string;
  polyline: {
    encodedPolyline: string;
  };
  startLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  endLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  steps?: RouteStep[];
}

export interface RouteStep {
  distanceMeters: number;
  staticDuration: string;
  polyline: {
    encodedPolyline: string;
  };
  startLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  endLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  navigationInstruction?: {
    maneuver: string;
    instructions: string;
  };
}

export interface Route {
  distanceMeters: number;
  duration: string;
  staticDuration: string;
  polyline: {
    encodedPolyline: string;
  };
  legs: RouteLeg[];
  viewport: {
    low: {
      latitude: number;
      longitude: number;
    };
    high: {
      latitude: number;
      longitude: number;
    };
  };
  travelAdvisory?: {
    tollInfo?: {
      estimatedPrice: any[];
    };
    speedReadingIntervals?: any[];
    fuelConsumptionMicroliters?: number;
  };
  description?: string;
  warnings?: string[];
}

export interface RoutesResponse {
  routes: Route[];
}

export interface RouteCalculation {
  id?: string;
  origin: string;
  destination: string;
  intermediates?: string[];
  route: Route;
  createdAt?: Date;
}
