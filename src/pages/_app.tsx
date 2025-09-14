// pages/_app.tsx (Next.js App component)
import type { AppProps } from "next/app";
import Head from "next/head";
// import "../styles/globals.css";
import "../globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AwaChapter Portal</title>
        <meta name="description" content="From memory to keepsakes" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
