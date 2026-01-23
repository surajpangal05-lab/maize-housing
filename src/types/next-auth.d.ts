import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    userType?: string
    isUmichEmail?: boolean
    emailVerified?: Date | null
    phoneVerified?: Date | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      userType: string
      isUmichEmail: boolean
      emailVerified: Date | null
      phoneVerified: Date | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    userType: string
    isUmichEmail: boolean
    emailVerified: Date | null
    phoneVerified: Date | null
  }
}

