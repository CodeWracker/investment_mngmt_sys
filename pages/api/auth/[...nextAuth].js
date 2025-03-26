import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuário", type: "text", placeholder: "admin" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // Implementação simples para MVP:
        if (credentials.username === "admin" && credentials.password === "admin") {
          return { id: 1, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: 'SOME_SECRET', // Substitua por um segredo forte
  },
});
