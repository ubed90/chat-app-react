import { Link, useRouteError } from 'react-router-dom';

const Error = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = useRouteError();

  console.log(error);

  if (error && error.status === 404) {
    return (
      <main className="grid min-h-screen place-items-center px-8">
        <div className="text-center">
          <p className="text-9xl font-semibold text-primary">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Page Not Found
          </h1>
          <p className="mt-6 text-lg leading-7">
            Sorry, We couldn't find the page you are looking for
          </p>
          <div className="mt-10">
            <Link to="/" className="btn btn-secondary">
              Go Back Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center px-8">
      <h4 className="text-center font-bold text-4xl">
        Sorry, We couldn't find the page you are looking for...
      </h4>
    </main>
  );
};

export default Error;
