export interface WeatherResponse {
  ResultInfo: ResultInfo;
  Feature: WeatherFeature[];
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

interface WeatherFeature {
  Id: string;
  Name: string;
  Geometry: Geometry;
  Property: WeatherProperty;
}

interface Geometry {
  Type: string;
  Coordinates: string;
}

interface WeatherProperty {
  WeatherList: WeatherList;
  WeatherAreaCode: string;
}

interface WeatherList {
  Weather: Weather[];
}

interface Weather {
  Type: string;
  Date: string;
  Rainfall: number;
}

