import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/tokens";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { email, token, password } = parsed.data;
  const hashedToken = hashResetToken(token);

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: hashedToken } },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

  // One-time use — remove it immediately so the same link can't be replayed.
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: hashedToken } },
  });

  return NextResponse.json({ success: true });
}
