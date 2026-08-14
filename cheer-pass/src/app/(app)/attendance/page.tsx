import { getCurrentUser } from "@/lib/auth";
import { getPrimaryChild } from "@/lib/child";
import { getNextReservationForChild } from "@/lib/lesson";
import { formatLessonWhen } from "@/lib/format";
import { Card } from "@/components/ui";
import { AttendanceForm } from "@/components/AttendanceForm";

export default async function AttendancePage() {
  const user = await getCurrentUser();
  const child = user ? await getPrimaryChild(user.id) : null;
  const reservation = child ? await getNextReservationForChild(child.id) : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold tracking-wide text-accent">ATTENDANCE</p>
        <h1 className="text-xl font-extrabold text-ink">出欠回答</h1>
      </div>

      {!reservation && (
        <Card>
          <p className="text-sm text-ink-soft">
            出欠を回答できる次回レッスンの予約がありません。まずはレッスンを予約してください。
          </p>
        </Card>
      )}

      {reservation && (
        <>
          <Card>
            <p className="mb-1 text-xs font-bold text-ink-soft">次回レッスン</p>
            <p className="text-lg font-extrabold text-ink">
              {formatLessonWhen(reservation.lesson.date, reservation.lesson.startTime, reservation.lesson.endTime)}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {reservation.lesson.class.name} ／ {reservation.lesson.class.location}
            </p>
          </Card>
          <AttendanceForm
            reservationId={reservation.id}
            currentStatus={reservation.attendance?.status ?? "pending"}
          />
        </>
      )}
    </div>
  );
}
