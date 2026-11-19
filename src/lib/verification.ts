import { prisma } from './prisma'

export type CodeType = 'EMAIL' | 'PASSWORD_RESET'

export const CODE_TTL_MS = 10 * 60 * 1000 // 10 minutes
export const RESEND_COOLDOWN_MS = 60_000 // 60 seconds

/**
 * Issues a fresh 6-digit code for an email address, replacing any previous
 * code of the same type. Returns null when a code was issued within the
 * resend cooldown window so callers can rate-limit.
 */
export async function issueEmailCode(email: string, type: CodeType): Promise<string | null> {
  const recent = await prisma.verificationToken.findFirst({
    where: { email, type, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
  })
  if (recent) return null

  await prisma.verificationToken.deleteMany({ where: { email, type } })

  // `token` is globally unique in the schema, so retry on the rare collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const taken = await prisma.verificationToken.findUnique({ where: { token: code } })
    if (taken) continue
    await prisma.verificationToken.create({
      data: { email, token: code, type, expires: new Date(Date.now() + CODE_TTL_MS) },
    })
    return code
  }
  throw new Error('Could not generate a unique verification code')
}

export type CodeCheck =
  | { ok: true; tokenId: string }
  | { ok: false; reason: 'invalid' | 'expired' }

/** Looks up a code for an email without consuming it. */
export async function checkEmailCode(email: string, code: string, type: CodeType): Promise<CodeCheck> {
  const token = await prisma.verificationToken.findFirst({
    where: { email, token: code.trim(), type },
  })
  if (!token) return { ok: false, reason: 'invalid' }
  if (token.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: token.id } })
    return { ok: false, reason: 'expired' }
  }
  return { ok: true, tokenId: token.id }
}
