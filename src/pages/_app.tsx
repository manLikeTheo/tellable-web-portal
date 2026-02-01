// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { Playfair_Display, Inter } from "next/font/google";
import "@/globals.css";
import "@/styles/playback-animations.css";

// Load Playfair Display (serif)
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Load Inter (sans)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${playfair.variable} ${inter.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}

// // pages/_app.tsx (Next.js App component)
// import type { AppProps } from "next/app";
// import Head from "next/head";
// import "@/globals.css";
// import "@/styles/playback-animations.css";

// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <>
//       <Head>
//         <title>AwaChapter Portal</title>
//         <meta name="description" content="From memory to keepsakes" />
//         <meta
//           name="viewport"
//           content="width=device-width, initial-scale=1, maximum-scale=1"
//         />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <Component {...pageProps} />
//     </>
//   );
// }
