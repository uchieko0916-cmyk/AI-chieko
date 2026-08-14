import { db } from "./db";

export async function getPrimaryChild(userId: string) {
  return db.child.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { class: true },
  });
}
