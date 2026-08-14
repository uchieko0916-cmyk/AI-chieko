import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

function hash(password: string) {
  return bcrypt.hashSync(password, 10);
}

// 指定した曜日(0=日〜6=土)に最も近い当日以降の日付を返す
function nextWeekday(from: Date, weekday: number) {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("シードデータを投入します…");

  // 既存データを全消去（開発環境向け）
  await db.attendance.deleteMany();
  await db.makeup.deleteMany();
  await db.reservation.deleteMany();
  await db.lesson.deleteMany();
  await db.child.deleteMany();
  await db.class.deleteMany();
  await db.notice.deleteMany();
  await db.user.deleteMany();

  const admin = await db.user.create({
    data: {
      name: "教室管理者",
      email: "admin@cheer-pass.example",
      phone: "03-0000-0000",
      passwordHash: hash("admin1234"),
      role: "admin",
    },
  });

  const kids = await db.class.create({
    data: { name: "キッズ", teacher: "佐藤 愛", location: "第一スタジオ", capacity: 10 },
  });
  const junior = await db.class.create({
    data: { name: "ジュニア", teacher: "鈴木 舞", location: "第一スタジオ", capacity: 8 },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // キッズ: 毎週土曜 10:00-11:00 / ジュニア: 毎週日曜 13:00-14:15
  const kidsSaturdays = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((w) =>
    addDays(nextWeekday(today, 6), w * 7)
  );
  const juniorSundays = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((w) =>
    addDays(nextWeekday(today, 0), w * 7)
  );

  const kidsLessons = await Promise.all(
    kidsSaturdays.map((date) =>
      db.lesson.create({
        data: { classId: kids.id, date, startTime: "10:00", endTime: "11:00" },
      })
    )
  );
  const juniorLessons = await Promise.all(
    juniorSundays.map((date) =>
      db.lesson.create({
        data: { classId: junior.id, date, startTime: "13:00", endTime: "14:15" },
      })
    )
  );

  const pastKids = kidsLessons.filter((l) => l.date < today);
  const upcomingKids = kidsLessons.filter((l) => l.date >= today);
  const pastJunior = juniorLessons.filter((l) => l.date < today);
  const upcomingJunior = juniorLessons.filter((l) => l.date >= today);

  // --- 会員1: 山田家（キッズ・出席/欠席の履歴あり、振替1回発行済み） ---
  const yamada = await db.user.create({
    data: {
      name: "山田 美穂",
      email: "yamada@example.com",
      phone: "090-1111-2222",
      passwordHash: hash("password123"),
      role: "parent",
    },
  });
  const hana = await db.child.create({
    data: { userId: yamada.id, name: "山田 はな", birthday: new Date(2020, 3, 12), grade: "年中", classId: kids.id, note: "卵アレルギーがあります" },
  });

  // 2週前: 出席
  const yamadaPast1 = pastKids[pastKids.length - 1];
  const yamadaRes1 = await db.reservation.create({
    data: { userId: yamada.id, childId: hana.id, lessonId: yamadaPast1.id, type: "regular", status: "confirmed" },
  });
  await db.attendance.create({
    data: { reservationId: yamadaRes1.id, status: "present", recordedAt: yamadaPast1.date },
  });

  // 1週前: 欠席 → 振替1回発行（未使用）
  const yamadaPast2 = pastKids[pastKids.length - 2];
  const yamadaRes2 = await db.reservation.create({
    data: { userId: yamada.id, childId: hana.id, lessonId: yamadaPast2.id, type: "regular", status: "confirmed" },
  });
  await db.attendance.create({
    data: { reservationId: yamadaRes2.id, status: "absent", absenceReason: "発熱のため", recordedAt: yamadaPast2.date },
  });
  await db.makeup.create({
    data: { childId: hana.id, sourceLessonId: yamadaPast2.id, status: "available" },
  });

  // 次回レッスン: 出欠未回答
  const yamadaNext = upcomingKids[0];
  const yamadaRes3 = await db.reservation.create({
    data: { userId: yamada.id, childId: hana.id, lessonId: yamadaNext.id, type: "regular", status: "confirmed" },
  });
  await db.attendance.create({ data: { reservationId: yamadaRes3.id } });

  // --- 会員2: 田中家（ジュニア） ---
  const tanaka = await db.user.create({
    data: {
      name: "田中 さゆり",
      email: "tanaka@example.com",
      phone: "090-3333-4444",
      passwordHash: hash("password123"),
      role: "parent",
    },
  });
  const riku = await db.child.create({
    data: { userId: tanaka.id, name: "田中 りく", birthday: new Date(2017, 6, 2), grade: "小学2年", classId: junior.id },
  });

  const tanakaPast = pastJunior[pastJunior.length - 1];
  const tanakaRes1 = await db.reservation.create({
    data: { userId: tanaka.id, childId: riku.id, lessonId: tanakaPast.id, type: "regular", status: "confirmed" },
  });
  await db.attendance.create({
    data: { reservationId: tanakaRes1.id, status: "present", recordedAt: tanakaPast.date },
  });

  const tanakaNext = upcomingJunior[0];
  const tanakaRes2 = await db.reservation.create({
    data: { userId: tanaka.id, childId: riku.id, lessonId: tanakaNext.id, type: "regular", status: "confirmed" },
  });
  await db.attendance.create({ data: { reservationId: tanakaRes2.id } });

  // --- 会員3: 体験予約から興味を持った鈴木家 ---
  const suzuki = await db.user.create({
    data: {
      name: "鈴木 あい",
      email: "suzuki@example.com",
      phone: "090-5555-6666",
      passwordHash: hash("password123"),
      role: "parent",
    },
  });
  const mio = await db.child.create({
    data: { userId: suzuki.id, name: "鈴木 みお", birthday: new Date(2019, 10, 20), grade: "年長" },
  });
  const trialLesson = upcomingKids[1] ?? upcomingKids[0];
  const trialRes = await db.reservation.create({
    data: {
      userId: suzuki.id,
      childId: mio.id,
      lessonId: trialLesson.id,
      type: "trial",
      status: "confirmed",
      note: "見学のみ希望です",
    },
  });
  await db.attendance.create({ data: { reservationId: trialRes.id } });

  // --- お知らせ ---
  await db.notice.createMany({
    data: [
      {
        title: "8月29日のレッスンについて",
        body: "8月29日(土)のキッズクラスは、通常より30分早い9:30開始となります。お間違えのないようご注意ください。",
        important: false,
        publishedAt: addDays(today, -2),
      },
      {
        title: "発表会のお知らせ",
        body: "今年も12月に発表会を開催します。詳細な日程・会場は追ってご案内しますが、まずは候補日として12月20日(日)を予定しております。",
        important: true,
        publishedAt: addDays(today, -1),
      },
      {
        title: "会場変更のお知らせ",
        body: "設備点検のため、9月第1週のレッスンは第二スタジオでの開催となります。お間違えのないようお願いいたします。",
        important: true,
        publishedAt: today,
      },
      {
        title: "夏休みのお知らせ",
        body: "8月13日(木)〜8月16日(日)は教室夏季休業とさせていただきます。レッスンはございませんのでご了承ください。",
        important: false,
        publishedAt: addDays(today, -5),
      },
    ],
  });

  console.log("シード投入が完了しました。");
  console.log("---");
  console.log("管理者ログイン: admin@cheer-pass.example / admin1234");
  console.log("保護者ログイン例: yamada@example.com / password123");
  console.log(`(admin id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
