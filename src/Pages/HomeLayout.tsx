import { Footer, Header } from "../Components"

const HomeLayout = () => {
  return (
    <main className="app-grid with-header">
      <Header />
      <div className="main-content"></div>
      <Footer />
    </main>
  )
}

export default HomeLayout