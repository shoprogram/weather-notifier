import { GeocoderResponse } from "../types/geocoderResponseType";
import { WeatherResponse } from "../types/weatherResponseType";
import geocoderMock from "../mock/geocode-sample.json"

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
  // const params = new URLSearchParams({
  //   appid: APPID,
  //   query: text,
  //   al: "2",
  //   exclude_seireishi: "false",
  //   results: "1",
  //   output: "json",
  // }).toString();
  // const url = "/api/geocode/V1/geoCoder?" + params;

  // Yahoo!ジオコーダAPIをコールする
  // const res = await fetch(url);
  // if (!res.ok) {
  //   throw new Error(`HTTP error! status: ${res.status}`);
  // }
  // TODO 外部API取得の実装で詰まっているため、一次的にmockを使用
  const json: GeocoderResponse = geocoderMock;
  // const json: GeocoderResponse = await res.json();

  // 住所情報を取得する
  if (json.Feature && json.Feature.length !== 0) {
    // ヒットした1つめの住所を使う
    let name = json.Feature[0].Name;
    let ll = json.Feature[0].Geometry.Coordinates.split(",");
    let bbox = json.Feature[0].Geometry.BoundingBox;
    return { address: name, lat: ll[1], lon: ll[0], bbox: bbox };
  } else {
    throw new Error("住所にヒットしませんでした");
  }
}

// 降水情報を取得する
async function getWeatherInfo(location: Location): Promise<WeatherResponse> {
  // URLを組み立てる
  let params = new URLSearchParams({
    coordinates: location.toString(),
    appid: APPID,
    output: "json",
  }).toString();
  const url = "/api/weather/V1/place?" + params;

  // 気象情報APIをコールする
  const res = await fetch(url);
  if (!res.ok) {
    throw res;
  }
  const json: WeatherResponse = await res.json();
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
  let params = new URLSearchParams({
    width: "800",
    height: "600",
    lat: location.lat,
    lon: location.lon,
    z: "12",
    overlay: "type:rainfall",
    style: "base:monotone",
    appid: APPID,
  }).toString();
  const url = "/api/map/V1/static?" + params;

  // Yahoo!スタティックマップAPIをコールする
  const res = await fetch(url);
  if (!res.ok) {
    throw res;
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * 気象・地理情報取得
 */
export async function getWeather() {
  try {
    // コマンドライン引数を取得
    // TODO text情報を可変・クライアントから取得する
    const text =
      "%e6%9d%b1%e4%ba%ac%e9%83%bd%e6%b8%af%e5%8c%ba%e5%85%ad%e6%9c%ac%e6%9c%a8";

    // 住所情報を取得
    const location = await getAddressLocation(text);
    console.log(location)

    // 降水情報を取得
    const weather = await getWeatherInfo(location);

    // 降水情報をテキストに変換
    const weatherText = getWeatherText(weather, location);

    // 地図画像を取得
    const mapImage = await getMapImage(location);

    // 地図画像データ,降水情報返却
    return { mapImage, weatherText };
  } catch (err) {
    console.error(err);
  }
}
