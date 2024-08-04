import React from "react";
import Weather from "./components/Weather";
import { Container } from "@mui/material";

const App: React.FC = () => {
  return (
    <Container>
      <Weather lat={35.6895} lon={139.6917} /> {/* 東京の緯度経度 */}
    </Container>
  );
};

export default App;
