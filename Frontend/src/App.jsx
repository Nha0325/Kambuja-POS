import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import AppRoutes from "./routes"

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

      <Toaster />
    </>
  );
}

export default App;
