import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        }),
        GithubProvider({
            clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
        })
    ],
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
    callbacks: {
        async signIn(user, account, profile) {
            let _user = user?.user
            let _provider = user?.account?.provider

            // console.log(_user)
            // console.log(_provider)
            // Call your API to create user at port 8000 endpoint /auth/callback
            const response = await fetch(process.env.NEXT_PUBLIC_API + "/auth/callback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // Pass any data you need to send to your API
                    user: _user,
                    provider: _provider,
                }),
            });

            // Handle the response from your API as needed
            const data = await response.json();

            // Return true to allow sign in, or false to prevent sign in
            return true;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
}

export default NextAuth(authOptions)

