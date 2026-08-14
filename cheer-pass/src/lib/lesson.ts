import type { Class, Lesson, Reservation } from "@prisma/client";
import { db } from "./db";
import { startOfToday } from "./format";

export type LessonWithCounts = Lesson & {
  class: Class;
  reservedCount: number;
  capacity: number;
  remaining: number;
  myReservation: Reservation | null;
};

function withCounts(
  lesson: Lesson & { class: Class; reservations: Reservation[] },
  childId?: string
): LessonWithCounts {
  const capacity = lesson.capacity ?? lesson.class.capacity;
  const reservedCount = lesson.reservations.length;
  const myReservation = childId
    ? (lesson.reservations.find((r) => r.childId === childId) ?? null)
    : null;
  return {
    ...lesson,
    class: lesson.class,
    capacity,
    reservedCount,
    remaining: Math.max(capacity - reservedCount, 0),
    myReservation,
  };
}

export async function getLessonsForMonth(year: number, month: number, childId?: string) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const lessons = await db.lesson.findMany({
    where: { date: { gte: start, lt: end } },
    include: { class: true, reservations: { where: { status: "confirmed" } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return lessons.map((l) => withCounts(l, childId));
}

export async function getUpcomingLessons(limit = 60) {
  const lessons = await db.lesson.findMany({
    where: { date: { gte: startOfToday() }, status: "scheduled" },
    include: { class: true, reservations: { where: { status: "confirmed" } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: limit,
  });
  return lessons.map((l) => withCounts(l));
}

export async function getLessonById(id: string, childId?: string) {
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { class: true, reservations: { where: { status: "confirmed" } } },
  });
  if (!lesson) return null;
  return withCounts(lesson, childId);
}

export async function getNextReservationForChild(childId: string) {
  return db.reservation.findFirst({
    where: {
      childId,
      status: "confirmed",
      type: { in: ["regular", "makeup"] },
      lesson: { date: { gte: startOfToday() }, status: "scheduled" },
    },
    include: { lesson: { include: { class: true } }, attendance: true },
    orderBy: { lesson: { date: "asc" } },
  });
}

export async function getMakeupCandidateLessons(childId: string) {
  const child = await db.child.findUnique({ where: { id: childId } });
  const lessons = await getUpcomingLessons();
  return lessons
    .filter((l) => !l.myReservation && l.remaining > 0)
    .filter((l) => (child?.classId ? l.classId === child.classId : true));
}
