"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import {
  credentialsAuthProvider,
  createSession,
  destroySession,
  hashPassword,
  requireAdmin,
} from "../auth";

export type ActionState = { error?: string } | undefined;

export async function adminLoginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "メールアドレスとパスワードを入力してください" };

  const result = await credentialsAuthProvider.login({ email, password });
  if (!result || result.role !== "admin") {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  await createSession(result.id, "admin");
  redirect("/admin/dashboard");
}

export async function adminLogoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// --- クラス --------------------------------------------------------------

export async function createClassAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const teacher = String(formData.get("teacher") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const capacity = Number.parseInt(String(formData.get("capacity") || ""), 10);
  if (!name || !teacher || !location || !Number.isFinite(capacity)) {
    redirect("/admin/classes?error=1");
  }
  await db.class.create({ data: { name, teacher, location, capacity } });
  revalidatePath("/admin/classes");
  redirect("/admin/classes?created=1");
}

export async function updateClassAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const teacher = String(formData.get("teacher") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const capacity = Number.parseInt(String(formData.get("capacity") || ""), 10);
  if (!id) redirect("/admin/classes?error=1");
  await db.class.update({
    where: { id },
    data: { name, teacher, location, capacity },
  });
  revalidatePath("/admin/classes");
  redirect("/admin/classes?updated=1");
}

// --- レッスン --------------------------------------------------------------

export async function createLessonAction(formData: FormData) {
  await requireAdmin();
  const classId = String(formData.get("classId") || "");
  const date = String(formData.get("date") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const capacityRaw = String(formData.get("capacity") || "").trim();
  if (!classId || !date || !startTime || !endTime) redirect("/admin/lessons?error=1");

  await db.lesson.create({
    data: {
      classId,
      date: new Date(date),
      startTime,
      endTime,
      capacity: capacityRaw ? Number.parseInt(capacityRaw, 10) : null,
    },
  });
  revalidatePath("/admin/lessons");
  revalidatePath("/lessons");
  redirect("/admin/lessons?created=1");
}

export async function updateLessonStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || (status !== "scheduled" && status !== "cancelled")) redirect("/admin/lessons?error=1");
  await db.lesson.update({ where: { id }, data: { status } });
  revalidatePath("/admin/lessons");
  revalidatePath("/lessons");
  redirect("/admin/lessons?updated=1");
}

// --- 会員（保護者） ---------------------------------------------------------

export async function createMemberAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "").trim();
  if (!name || !email || !phone || !password) redirect("/admin/members?error=1");

  await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "parent",
    },
  });
  revalidatePath("/admin/members");
  redirect("/admin/members?created=1");
}

// --- 子ども ----------------------------------------------------------------

export async function createChildAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const birthday = String(formData.get("birthday") || "");
  const grade = String(formData.get("grade") || "").trim();
  const classId = String(formData.get("classId") || "");
  const note = String(formData.get("note") || "").trim();
  if (!userId || !name || !birthday) redirect("/admin/children?error=1");

  await db.child.create({
    data: {
      userId,
      name,
      birthday: new Date(birthday),
      grade: grade || undefined,
      classId: classId || undefined,
      note: note || undefined,
    },
  });
  revalidatePath("/admin/children");
  redirect("/admin/children?created=1");
}

// --- お知らせ ---------------------------------------------------------------

export async function createNoticeAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const important = formData.get("important") === "on";
  if (!title || !body) redirect("/admin/notices?error=1");

  await db.notice.create({ data: { title, body, important, publishedAt: new Date() } });
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/home");
  redirect("/admin/notices?created=1");
}

export async function deleteNoticeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await db.notice.delete({ where: { id } });
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  redirect("/admin/notices?deleted=1");
}

// --- 出欠 --------------------------------------------------------------------

export async function adminSetAttendanceAction(formData: FormData) {
  await requireAdmin();
  const reservationId = String(formData.get("reservationId") || "");
  const statusRaw = String(formData.get("status") || "");
  const lessonId = String(formData.get("lessonId") || "");
  const backTo = lessonId ? `/admin/attendance?lessonId=${lessonId}` : "/admin/attendance?x=1";
  const withParam = (suffix: string) => `${backTo}&${suffix}`;

  if (!reservationId || (statusRaw !== "present" && statusRaw !== "absent" && statusRaw !== "pending")) {
    redirect(withParam("error=1"));
  }
  const status = statusRaw;

  const reservation = await db.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) redirect(withParam("error=1"));

  await db.attendance.update({
    where: { reservationId },
    data: { status, recordedAt: new Date() },
  });

  if (status === "absent") {
    const existing = await db.makeup.findFirst({
      where: { childId: reservation!.childId, sourceLessonId: reservation!.lessonId },
    });
    if (!existing) {
      await db.makeup.create({
        data: {
          childId: reservation!.childId,
          sourceLessonId: reservation!.lessonId,
          status: "available",
        },
      });
    }
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");
  redirect(withParam("updated=1"));
}

// --- 振替 --------------------------------------------------------------------

export async function expireMakeupAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await db.makeup.update({ where: { id }, data: { status: "expired" } });
  revalidatePath("/admin/makeups");
  redirect("/admin/makeups?updated=1");
}
