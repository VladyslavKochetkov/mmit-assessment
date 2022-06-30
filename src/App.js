import { ThemeProvider, createTheme } from "@mui/material";
import HomePage from "./components/HomePage";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <div id="app">
      <ThemeProvider theme={darkTheme}>
        <HomePage />
      </ThemeProvider>
    </div>
  );
}

export default App;
