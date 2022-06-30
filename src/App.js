import { ThemeProvider, createTheme } from "@mui/material";
import HomePage from "./components/HomePage";
import { SnackbarProvider } from "notistack";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <div id="app">
      <ThemeProvider theme={darkTheme}>
        <SnackbarProvider maxSnack={3}>
          <HomePage />
        </SnackbarProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
