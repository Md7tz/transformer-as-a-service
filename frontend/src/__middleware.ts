import withAuth from "next-auth/middleware"

export default withAuth({
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
} as any)