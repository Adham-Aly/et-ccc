import type { Metadata } from "next";
import { NotFoundPage } from "@/components/layout/NotFoundPage";
import { ui } from "@/components/ui/ui-strings";

export const metadata: Metadata = { title: ui().notFound.title };

export default function NotFound() {
  return <NotFoundPage />;
}
