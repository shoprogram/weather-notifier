// import axios from 'axios';

// const API_KEY = process.env.REACT_APP_YAHOO_API_KEY!;
// const BASE_URL = 'https://map.yahooapis.jp/weather/V1/place';

// export const getWeather = async (lat: number, lon: number) => {
//   try {
//     const response = await axios.get(BASE_URL, {
//       params: {
//         appid: API_KEY,
//         coordinates: '139.732293,35.663613',
//         output: 'json',
//       },
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//     return response.data;
//   }catch(err) {
//     console.log('これ!!!!!!!!!!!!' + err)
//   }
// };

// import axios from 'axios';

// const BASE_URL = 'http://localhost:4000/weather';

// export const getWeather = async (lat: number, lon: number) => {
//   try {
//     const response = await axios.get(BASE_URL, {
//       params: {
//         lat,
//         lon,
//       },
//     });
//     console.log(response.data)
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching weather data:', error);
//     throw error;
//   }
// };

"use strict";

import { GeocoderResponse } from "../types/geocoderResponseType";
import { WeatherResponse } from "../types/weatherResponseType";
// import fs from 'browserify-fs';

// const fs = require("fs");
// const qs = require("querystring");
// const fetch = require('node-fetch') // window.fetch 互換 Fetch API

// アプリケーションID
const APPID = process.env.REACT_APP_YAHOO_API_KEY!;

type Location = {
  address: string;
  lat: string;
  lon: string;
  bbox: string;
};

// テキストにマッチした住所情報を取得する
async function getAddressLocation(text: string) {
  // URLを組み立てる
  const params = new URLSearchParams({
    appid: APPID, // アプリケーションID
    query: text, // 検索文字列
    al: "2", // 市区町村レベルの住所を検索
    exclude_seireishi: "false", // 検索対象から政令指定都市レコードを除外するか
    results: "1", // 検索結果を1件以内に設定
    output: "json", // レスポンスをJSONにする
  }).toString();
  const url = "/api/geocode/V1/geoCoder?" + params;
  console.log(`Request URL: ${url}`);

  // Yahoo!ジオコーダAPIをコールする
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response:", errorText);
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  console.log(res);
  const responseText = await res.text();
  console.log('Response text:', responseText);
  // const responseText = JSON.parse(a)
  const json: GeocoderResponse = await res.json();

  // 住所情報を取得する
  if (json.Feature && json.Feature.length != 0) {
    // ヒットした1つめの住所を使う
    let name = json.Feature[0].Name;
    let ll = json.Feature[0].Geometry.Coordinates.split(",");
    let bbox = json.Feature[0].Geometry.BoundingBox;
    return { address: name, lat: ll[1], lon: ll[0], bbox: bbox };
  } else {
    throw "住所にヒットしなかった";
  }
}

// 住所に紐ついた緯度経度とバウンディングボックスの4点の緯度経度をつなげた文字列を返す
// function getCoordinatesFromBoundingBox(location = '139.732293,35.663613') {
//   let p = location.bbox.split(' ')
//   let ll0 = p[0].split(',')
//   let ll1 = p[1].split(',')
//   let c =
//     location.lon + ',' + location.lat + ' ' +
//     ll0[0] + ',' + ll0[1] + ' ' +
//     ll1[0] + ',' + ll0[1] + ' ' +
//     ll0[0] + ',' + ll1[1] + ' ' +
//     ll1[0] + ',' + ll1[1]
//   return c
// }

// 降水情報を取得する
async function getWeatherInfo(location: Location): Promise<WeatherResponse> {
  // 雨の強さを取得したい緯度経度(10点まで可)を指定
  // フォーマット: 経度,緯度 経度,緯度 経度,緯度 経度,緯度 ...
  // 経度・緯度の順番でコンマ区切り
  // 経度・緯度毎に半角スペース区切り
  // const coordinates = getCoordinatesFromBoundingBox(location)

  // URLを組み立てる
  let params = new URLSearchParams({
    coordinates: location.toString(),
    appid: APPID, // アプリケーションID
    output: "json", // レスポンスをJSONにする
  }).toString();
  const url = "/api/weather/V1/place?" + params;

  // 気象情報APIをコールする
  const res = await fetch(url);
  if (!res.ok) {
    throw res;
  }
  const json: WeatherResponse = await res.json();
  console.log(JSON.stringify(json, null, "  "));
  return json;
}

// 降水情報をテキストに変換する
function getWeatherText(weather: WeatherResponse, location: Location) {
  let rain = false; // 雨が降るか否か
  // 1箇所でも雨が降る場所があるか
  for (let feature of weather.Feature) {
    for (let w of feature.Property.WeatherList.Weather) {
      if (w.Rainfall > 0) {
        // 降水強度が0より大きいか
        rain = true;
        break;
      }
    }
  }
  if (rain) {
    return location.address + "では、1時間以内に雨が降りそうです。";
  } else {
    return location.address + "では、1時間以内には雨が降らないようです。";
  }
}

// 地図画像を取得する
async function getMapImage(location: Location) {
  // URLを組み立てる
  let params = new URLSearchParams({
    width: "800",
    height: "600",
    lat: location.lat,
    lon: location.lon,
    z: "12", // ズームレベル
    overlay: "type:rainfall", // 現在時刻の雨雲レーダーを表示
    style: "base:monotone", // モノトーンスタイル
    appid: APPID, // アプリケーションID
  }).toString();
  const url = "/api/map/V1/static?" + params;

  // Yahoo!スタティックマップAPIをコールする
  const res = await fetch(url);
  if (!res.ok) {
    throw res;
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function getWeather() {
  try {
    // コマンドライン引数を取得
    const text =
      "%e6%9d%b1%e4%ba%ac%e9%83%bd%e6%b8%af%e5%8c%ba%e5%85%ad%e6%9c%ac%e6%9c%a8";

    // 住所情報を取得
    const location = await getAddressLocation(text);
    console.log("Location: " + location);

    // 降水情報を取得
    const weather = await getWeatherInfo(location);

    // 降水情報をテキストに変換
    const weatherText = getWeatherText(weather, location);
    console.log("Message: " + weatherText);

    // 地図画像を取得
    const mapImage = await getMapImage(location);

    // 地図画像データをファイルに出力
    return mapImage;
  } catch (err) {
    console.error(err);
  }
}
