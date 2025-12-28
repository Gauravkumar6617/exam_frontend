import AppRoutes from "./routes/AppRoutes"
import { Provider } from "react-redux"
import { store } from "./redux/store/store"
import { BrowserRouter } from "react-router-dom"
function App() {
  return (
    <>
    <Provider store={store}>
      <BrowserRouter>
      <AppRoutes/>
      </BrowserRouter>

    </Provider>
    </>
  )
}

export default App
