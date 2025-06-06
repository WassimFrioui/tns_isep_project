import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getNeo4jSession } from "@/lib/neo4j";
import { AuthOptions } from "next-auth";
import bcrypt from "bcryptjs"; 

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const session = getNeo4jSession("READ");

        try {
          const { email, password } = credentials ?? {};

          const result = await session.run(
            `
            MATCH (u:User { email: $email })
            RETURN u LIMIT 1
            `,
            { email }
          );

          const user = result.records[0]?.get("u")?.properties;

          
          const isValid =
            user &&
            typeof password === "string" &&
            typeof user.password === "string" &&
            await bcrypt.compare(password, user.password);

          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
            };
          }

          return null;
        } catch (err) {
          console.error("Erreur d'authentification", err);
          return null;
        } finally {
          await session.close();
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
