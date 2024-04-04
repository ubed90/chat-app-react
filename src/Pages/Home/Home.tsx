import Header from "./Header"
import landing from "../../assets/chats-up-landing.png";
import "./Home.scss";

const Home = () => {
  return (
    <main className="w-screen h-screen bg-[#14211d] overflow-hidden relative z-[1]">
      <Header />
      <section className="main flex flex-col md:flex-row gap-2 justify-center md:items-center h-full">
        <div className="main-left md:w-1/2">
          <h1 className="text-6xl font-bold text-gray-300">
            Chats<span className="italic text-[#1db8ab]">UP</span>
          </h1>
          <h3 className="text-3xl mt-4 font-thin max-w-xl text-gray-200 lg:max-w-max">
            <span className="text-[#1db8ab] font-bold">Fast</span> and{' '}
            <span className="text-[#1db8ab] font-bold">Lightweight</span> chat
            app for the web &#127758;.
          </h3>
          <a
            href="https://ubedshaikh.netlify.app/home"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md bg-[#1db8ab] border-none rounded-xl text-xl text-white mt-4 hover:bg-[#1db8ab] hover:bg-opacity-70"
          >
            Crafted by - @UbedShaikh
          </a>
        </div>
        <div className="main-right md:w-1/2">
          <img className="main-right-image" src={landing} alt="landing-image" />
        </div>
      </section>
      <div className="shapes w-full h-full absolute top-0 left-0">
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
      </div>
    </main>
  );
}

export default Home