"use client";

import { useActionState, useState } from "react";
import { setAttendanceAction } from "@/lib/actions/parent";
import { Card, ErrorText, FieldLabel, SubmitButton, TextArea } from "@/components/ui";
import { CheckIcon, XIcon } from "@/components/icons";

export function AttendanceForm({
  reservationId,
  currentStatus,
}: {
  reservationId: string;
  currentStatus: "present" | "absent" | "pending";
}) {
  const [state, formAction] = useActionState(setAttendanceAction, undefined);
  const [status, setStatus] = useState<"present" | "absent">(
    currentStatus === "absent" ? "absent" : "present"
  );

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="reservationId" value={reservationId} />
        <input type="hidden" name="status" value={status} />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatus("present")}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 font-bold ${
              status === "present"
                ? "border-mint bg-mint-soft text-mint"
                : "border-line text-ink-soft"
            }`}
          >
            <CheckIcon className="h-6 w-6" />
            出席する
          </button>
          <button
            type="button"
            onClick={() => setStatus("absent")}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 font-bold ${
              status === "absent"
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-ink-soft"
            }`}
          >
            <XIcon className="h-6 w-6" />
            欠席する
          </button>
        </div>

        {status === "absent" && (
          <div>
            <FieldLabel>欠席理由（任意）</FieldLabel>
            <TextArea name="reason" rows={3} placeholder="例：体調不良のため" />
          </div>
        )}

        <ErrorText>{state?.error}</ErrorText>
        <SubmitButton>この内容で回答する</SubmitButton>
      </form>
    </Card>
  );
}
