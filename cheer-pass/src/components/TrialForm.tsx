"use client";

import { useActionState, useMemo, useState } from "react";
import { submitTrialReservationAction } from "@/lib/actions/parent";
import { Card, ErrorText, FieldLabel, Select, SubmitButton, TextArea, TextInput } from "@/components/ui";
import { formatLessonWhen } from "@/lib/format";

type ClassOption = { id: string; name: string; location: string };
type LessonOption = {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  remaining: number;
};

export function TrialForm({ classes, lessons }: { classes: ClassOption[]; lessons: LessonOption[] }) {
  const [state, formAction] = useActionState(submitTrialReservationAction, undefined);
  const [classId, setClassId] = useState("");

  const candidateLessons = useMemo(
    () => lessons.filter((l) => !classId || l.classId === classId),
    [lessons, classId]
  );

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <FieldLabel required>お子さまのお名前</FieldLabel>
          <TextInput name="childName" required placeholder="やまだ はな" />
        </div>
        <div>
          <FieldLabel required>年齢</FieldLabel>
          <TextInput name="childAge" required inputMode="numeric" placeholder="5" />
        </div>
        <div>
          <FieldLabel required>保護者のお名前</FieldLabel>
          <TextInput name="parentName" required placeholder="やまだ みほ" />
        </div>
        <div>
          <FieldLabel required>電話番号</FieldLabel>
          <TextInput name="phone" required inputMode="tel" placeholder="090-1234-5678" />
        </div>
        <div>
          <FieldLabel>メールアドレス</FieldLabel>
          <TextInput type="email" name="email" placeholder="example@mail.com" />
        </div>
        <div>
          <FieldLabel required>希望クラス</FieldLabel>
          <Select
            name="classId"
            required
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">選択してください</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}（{c.location}）
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel required>希望日</FieldLabel>
          <Select name="lessonId" required defaultValue="">
            <option value="">選択してください</option>
            {candidateLessons.map((l) => (
              <option key={l.id} value={l.id} disabled={l.remaining <= 0}>
                {formatLessonWhen(new Date(l.date), l.startTime, l.endTime)}
                {l.remaining <= 0 ? "（満席）" : `（残り${l.remaining}席）`}
              </option>
            ))}
          </Select>
          {classId && candidateLessons.length === 0 && (
            <p className="mt-1.5 text-xs text-ink-soft">このクラスの開催予定が見つかりませんでした。</p>
          )}
        </div>
        <div>
          <FieldLabel>アレルギー・配慮事項</FieldLabel>
          <TextArea name="allergyNote" rows={2} placeholder="例：卵アレルギーがあります" />
        </div>
        <div>
          <FieldLabel>その他コメント</FieldLabel>
          <TextArea name="note" rows={2} placeholder="ご質問やご要望があればご記入ください" />
        </div>

        <ErrorText>{state?.error}</ErrorText>
        <SubmitButton>この内容で予約する</SubmitButton>
      </form>
    </Card>
  );
}
