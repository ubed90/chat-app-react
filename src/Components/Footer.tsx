const Footer = () => {
  return (
    <footer className="bg-base-100 border-t-[1px] border-primary py-2 px-6 flex items-center justify-center">
      <div className="footer-text flex flex-col text-center">
        <h2 className="text-xl md:text-2xl">
          Created with ❤️ by -{' '}
          <a
            href="https://ubedshaikh.netlify.app/"
            className="hover:text-accent hover:underline underline-offset-1 transition-all duration-300"
            target="_blank"
          >
            @theUNNOTICED
          </a>
        </h2>
        <p className="text-lg">
          &copy; {new Date().getFullYear()} - All Rights Reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer