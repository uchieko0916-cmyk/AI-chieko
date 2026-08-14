"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import {
  credentialsAuthProvider,
  createSession,
  destroySession,
  hashPassword,
  requireParent,
} from "../auth";
import { getLessonById } from "../lesson";

export type ActionState = { error?: string } | undefined;

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  const result = await credentialsAuthProvider.login({ email, password });
  if (!result || result.role !== "parent") {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  await createSession(result.id, "parent");
  redirect("/home");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

// 年齢のみ分かっている体験申込者向けに、生年月日を概算する。
// 入会時に管理画面で正しい生年月日へ修正する想定。
function approxBirthdayFromAge(ageInput: string) {
  const age = Number.parseInt(ageInput, 10);
  const year = new Date().getFullYear() - (Number.isFinite(age) ? age : 4);
  return new Date(year, 0, 1);
}

export async function submitTrialReservationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const childName = String(formData.get("childName") || "").trim();
  const childAge = String(formData.get("childAge") || "").trim();
  const parentName = String(formData.get("parentName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const classId = String(formData.get("classId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  const note = String(formData.get("note") || "").trim();
  const allergyNote = String(formData.get("allergyNote") || "").trim();

  if (!childName || !childAge || !parentName || !phone || !classId || !lessonId) {
    return { error: "必須項目（＊）をすべて入力してください" };
  }

  const lesson = await getLessonById(lessonId);
  if (!lesson) return { error: "選択したレッスンが見つかりませんでした" };
  if (lesson.remaining <= 0) {
    return { error: "このレッスンは満席になりました。別の日時を選択してください" };
  }

  let user = email ? await db.user.findUnique({ where: { email } }) : null;
  if (!user) {
    user = await db.user.create({
      data: {
        name: parentName,
        email: email || undefined,
        phone,
        passwordHash: await hashPassword(randomUUID()),
        role: "parent",
      },
    });
  }

  const child = await db.child.create({
    data: {
      userId: user.id,
      name: childName,
      birthday: approxBirthdayFromAge(childAge),
      note: allergyNote || undefined,
    },
  });

  const reservation = await db.reservation.create({
    data: {
      userId: user.id,
      childId: child.id,
      lessonId: lesson.id,
      type: "trial",
      status: "confirmed",
      note: note || undefined,
    },
  });

  await db.attendance.create({ data: { reservationId: reservation.id } });

  redirect(`/trial/complete?id=${reservation.id}`);
}

export async function reserveLessonAction(formData: FormData) {
  const user = await requireParent();
  const lessonId = String(formData.get("lessonId") || "");
  const childId = String(formData.get("childId") || "");
  if (!lessonId || !childId) redirect(`/lessons/${lessonId}?error=1`);

  const child = await db.child.findUnique({ where: { id: childId } });
  if (!child || child.userId !== user.id) redirect(`/lessons/${lessonId}?error=1`);

  const lesson = await getLessonById(lessonId, childId);
  if (!lesson || lesson.myReservation) redirect(`/lessons/${lessonId}?error=1`);
  if (lesson.remaining <= 0) redirect(`/lessons/${lessonId}?error=full`);

  const reservation = await db.reservation.create({
    data: { userId: user.id, childId, lessonId, type: "regular", status: "confirmed" },
  });
  await db.attendance.create({ data: { reservationId: reservation.id } });

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/lessons");
  revalidatePath("/home");
  redirect(`/lessons/${lessonId}?reserved=1`);
}

export async function cancelReservationAction(formData: FormData) {
  const user = await requireParent();
  const reservationId = String(formData.get("reservationId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  const reservation = await db.reservation.findUnique({ where: { id: reservationId } });
  if (reservation && reservation.userId === user.id) {
    await db.reservation.update({ where: { id: reservationId }, data: { status: "cancelled" } });
  }
  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/lessons");
  revalidatePath("/home");
  redirect(`/lessons/${lessonId}?cancelled=1`);
}

export async function setAttendanceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireParent();
  const reservationId = String(formData.get("reservationId") || "");
  const status = String(formData.get("status") || "");
  const reason = String(formData.get("reason") || "").trim();

  if (!reservationId || (status !== "present" && status !== "absent")) {
    return { error: "出席・欠席のいずれかを選択してください" };
  }

  const reservation = await db.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation || reservation.userId !== user.id) {
    return { error: "対象の予約が見つかりませんでした" };
  }

  await db.attendance.update({
    where: { reservationId },
    data: {
      status,
      absenceReason: status === "absent" ? reason || null : null,
      recordedAt: new Date(),
    },
  });

  if (status === "absent") {
    await db.makeup.create({
      data: {
        childId: reservation.childId,
        sourceLessonId: reservation.lessonId,
        status: "available",
      },
    });
  }

  revalidatePath("/home");
  revalidatePath("/attendance");
  revalidatePath("/makeup");
  redirect("/home?attendance=done");
}

export async function bookMakeupAction(formData: FormData) {
  const user = await requireParent();
  const makeupId = String(formData.get("makeupId") || "");
  const targetLessonId = String(formData.get("targetLessonId") || "");
  if (!makeupId || !targetLessonId) redirect("/makeup?error=1");

  const makeup = await db.makeup.findUnique({
    where: { id: makeupId },
    include: { child: true },
  });
  if (!makeup || makeup.status !== "available" || makeup.child.userId !== user.id) {
    redirect("/makeup?error=1");
  }

  const lesson = await getLessonById(targetLessonId);
  if (!lesson || lesson.remaining <= 0) redirect("/makeup?error=full");

  const reservation = await db.reservation.create({
    data: {
      userId: user.id,
      childId: makeup!.childId,
      lessonId: targetLessonId,
      type: "makeup",
      status: "confirmed",
    },
  });
  await db.attendance.create({ data: { reservationId: reservation.id } });
  await db.makeup.update({
    where: { id: makeupId },
    data: { targetLessonId, status: "used" },
  });

  revalidatePath("/makeup");
  revalidatePath("/mypage");
  redirect("/makeup?booked=1");
}
