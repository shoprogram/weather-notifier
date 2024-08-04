export interface GeocoderResponse {
  ResultInfo: ResultInfo;
  Feature: Feature[];
}

interface ResultInfo {
  Count: number;
  Total: number;
  Start: number;
  Status: number;
  Latency: number;
  Description: string;
  Copyright: string;
}

interface Feature {
  Id: string;
  Name: string;
  Geometry: Geometry;
  Category: string[];
  Description: string;
  Style: Style;
}

interface Geometry {
  Type: string;
  Coordinates: string;
  BoundingBox: string;
}

interface Style {
  LineStyle?: LineStyle;
  PolygonStyle?: PolygonStyle;
}

interface LineStyle {
  color: string;
}

interface PolygonStyle {
  color: string;
}
