import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { isUmichEmail } from './utils'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        // Update last active
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          userType: user.userType,
          isUmichEmail: user.isUmichEmail,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.userType = (user as { userType?: string }).userType
        token.isUmichEmail = (user as { isUmichEmail?: boolean }).isUmichEmail
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified
        token.phoneVerified = (user as { phoneVerified?: Date | null }).phoneVerified
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.userType = token.userType as string
        session.user.isUmichEmail = token.isUmichEmail as boolean
        session.user.emailVerified = token.emailVerified as Date | null
        session.user.phoneVerified = token.phoneVerified as Date | null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export async function registerUser(
  email: string,
  password: string,
  name: string,
  userType: 'STUDENT' | 'LANDLORD'
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('Email already registered')
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const isUmich = isUmichEmail(email)

  // Students must use .edu email
  if (userType === 'STUDENT' && !isUmich) {
    throw new Error('Students must register with a @umich.edu email address')
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      userType,
      isUmichEmail: isUmich,
    },
  })

  // Create verification token
  const token = Math.random().toString(36).substring(2, 8).toUpperCase()
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      email: user.email,
      token,
      type: 'EMAIL',
      expires,
    },
  })

  return { user, verificationToken: token }
}

export async function verifyEmail(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!verificationToken) {
    throw new Error('Invalid verification token')
  }

  if (verificationToken.expires < new Date()) {
    throw new Error('Verification token has expired')
  }

  if (verificationToken.type !== 'EMAIL') {
    throw new Error('Invalid token type')
  }

  await prisma.user.update({
    where: { id: verificationToken.userId! },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  })

  return verificationToken.user
}

export async function sendPhoneVerification(userId: string, phone: string) {
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date()
  expires.setMinutes(expires.getMinutes() + 10)

  await prisma.verificationToken.create({
    data: {
      userId,
      phone,
      token,
      type: 'PHONE',
      expires,
    },
  })

  // In production, send SMS via Twilio
  // For demo, we'll just return the code
  console.log(`Phone verification code for ${phone}: ${token}`)
  
  return token
}

export async function verifyPhone(userId: string, code: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      userId,
      token: code,
      type: 'PHONE',
    },
  })

  if (!verificationToken) {
    throw new Error('Invalid verification code')
  }

  if (verificationToken.expires < new Date()) {
    throw new Error('Verification code has expired')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      phone: verificationToken.phone,
      phoneVerified: new Date(),
    },
  })

  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  })

  return true
}

