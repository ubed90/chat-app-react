import { Outlet } from "react-router-dom"
import { Header } from "../Components"

const HomeLayout = () => {
  return (
    <main className="app-grid with-header">
      <Header />
      <Outlet />
      {/* <Footer /> */}
    </main>
  )
}

export default HomeLayout