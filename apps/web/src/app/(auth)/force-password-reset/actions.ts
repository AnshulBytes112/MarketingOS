"use server";

import { requireAuth } from "@abge/auth";
import { prisma } from "@abge/database";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function resetPassword(newPassword: string) {
  const session = await requireAuth({ allowForcePasswordReset: true, allowSuspended: true });

  if (!session.mustChangePassword) {
    throw new Error("Password reset not required.");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  });

  // We could invalidate all sessions except the current one here,
  // but just updating the user is enough since mustChangePassword is false now.
  
  revalidatePath("/", "layout");
  
  return { success: true };
}
