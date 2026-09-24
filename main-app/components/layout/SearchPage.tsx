import { SearchPageClient } from "@/components/ui/SearchPageClient";
import { ui } from "@/components/ui/ui-strings";
import { SiteFrame } from "./SiteFrame";
import { h1Class } from "./type-styles";

/** /search: the same panel as the dialog, inside a sheet; reads ?q= on the client. */
export function SearchPage() {
  const s = ui().search;
  return (
    <SiteFrame current="search">
      <h1 className={h1Class}>{s.pageTitle}</h1>
      <div className="mt-6 flex min-h-[24rem] max-w-(--measure) flex-col rounded-box border border-rule bg-paper">
        <SearchPageClient labels={s} />
      </div>
    </SiteFrame>
  );
}
