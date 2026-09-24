// /dev/design: the design lead's component-state gallery (preview only, 404 in production, like
// /dev/viz). Sample problems come from the registry through W1's view builders (judgeUrl()).
import type { Metadata } from "next";
import { DesignGallery } from "@/components/layout/DesignGallery";
import type { CourseNav } from "@/components/layout/props";
import { getCourse } from "@/lib/content/course";
import { notFoundOutsideDevPreview } from "@/lib/content/dev-guard";
import { resolvePracticeItem } from "@/lib/content/registry";

export const metadata: Metadata = { title: "Design gallery", robots: { index: false } };

export default function DesignGalleryPage() {
  notFoundOutsideDevPreview();
  const practice = [
    resolvePracticeItem("ccc23s1", { note: "Practice with 2D grids." }),
    resolvePracticeItem("ccc22j4", { note: "Practice with pairs and sets." }),
    resolvePracticeItem("ccc19s1", {
      note: "More practice with 2D grids.",
      why: "An older problem on the same topic, for after the WMOJ ones.",
    }),
  ];
  const { stages } = getCourse();
  const stage = stages.find((s) => s.id === "s4") ?? stages[0];
  const courseNav: CourseNav = {
    stages,
    currentStageId: stage?.id ?? "",
    currentModuleId: stage?.modules[2]?.id ?? "",
  };
  return <DesignGallery practice={practice} courseNav={courseNav} />;
}
