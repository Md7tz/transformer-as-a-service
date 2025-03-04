import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth";
import Layout from "@/components/Layout";

export default function App({ Component, pageProps }: AppProps<{
    session: Session;
}>) {
    return (
        <SessionProvider session={pageProps.session}>
            <Layout view="playground" >
                <Component {...pageProps} />
            </Layout >
        </SessionProvider>
    )
}