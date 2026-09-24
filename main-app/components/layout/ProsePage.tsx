import type { ProsePageProps } from "@/components/layout/props";
import { SiteFrame } from "./SiteFrame";
import type { Section } from "./SiteHeader";
import { h1Class } from "./type-styles";

function ProsePage({ title, lede, body, section }: ProsePageProps & { section: Section }) {
  return (
    <SiteFrame current={section}>
      <header className="max-w-(--measure)">
        <h1 className={h1Class}>{title}</h1>
        {lede ? (
          <p className="mt-4 text-body text-ink-2 leading-(--text-body--line-height)">{lede}</p>
        ) : null}
      </header>
      <div className="prose-sheet mt-8">{body}</div>
    </SiteFrame>
  );
}

/** /start: how practice works, what the CCC is (no setup content, C21). */
export function StartPage(props: ProsePageProps) {
  return <ProsePage {...props} section="start" />;
}

/** /about: credits, CEMC attribution, judge acknowledgements, "this app is free". */
export function AboutPage(props: ProsePageProps) {
  return <ProsePage {...props} section="about" />;
}
