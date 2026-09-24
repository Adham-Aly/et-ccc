// app/page.tsx — thin data wiring (brief §7); markup/presentation is HomePage (W2).
import { HomePage } from "@/components/layout";
import { getCourse, getFirstLesson, getLessonOrder } from "@/lib/content/course";

export default function Page() {
  const { stages } = getCourse();
  return <HomePage stages={stages} firstLesson={getFirstLesson()} lessonOrder={getLessonOrder()} />;
}
