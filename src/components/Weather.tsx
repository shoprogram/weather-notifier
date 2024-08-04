import React, { useState, useEffect } from 'react';
import { getWeather } from '../api/weatherApi';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';

interface WeatherProps {
  lat: number;
  lon: number;
}

const Weather: React.FC<WeatherProps> = ({ lat, lon }) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeather();
        setWeather(data);
        setLoading(false);
      } catch (error) {
        setError('天気データの取得に失敗しました。');
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{weather}</Typography>
        {/* <Typography variant="h5">Weather Information</Typography>
        <Typography variant="h6">{weather.Feature[0].Property.WeatherList.Weather[0].Type}</Typography>
        <Typography variant="body1">{`降水確率: ${weather.Feature[0].Property.WeatherList.Weather[0].Temperature}°C`}</Typography> */}
      </CardContent>
    </Card>
  );
};

export default Weather;
