import { Callout } from "@/components/content/Callout";
import { CodeBlock, OutputPanel } from "@/components/content/CodeBlock";
import { Details } from "@/components/content/Details";
import { Practice } from "@/components/content/Practice";
import { ProblemLink } from "@/components/content/ProblemLink";
import { Term } from "@/components/content/Term";
import type { CourseNav, PracticeItemView } from "@/components/layout/props";
import { ComingSoon, DraftBadge, JudgeBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReadCell } from "@/components/ui/ReadCell";
import { IndexRow } from "./IndexRow";
import { SiteFrame } from "./SiteFrame";
import { TitleBlockStrip } from "./TitleBlock";
import { h1Class, h2Class, minorClass } from "./type-styles";

// Sample teaching code for the gallery (Python 3.8). Neutral placeholder content.
const SHORT = `name = input()
print("Hello, " + name)
`;

const LOOP = `n = int(input())
total = 0
for i in range(1, n + 1):
    total += i
print(total)
`;

const LONG = Array.from({ length: 104 }, (_, i) =>
  i === 0
    ? "values = []"
    : i === 103
      ? "print(len(values))"
      : `values.append(${i} * ${i})  # square of ${i}`,
).join("\n");

const WIDE = `def describe(points):
    return ", ".join("(" + str(x) + ", " + str(y) + ")" for x, y in points if x >= 0 and y >= 0)  # only the first quadrant
`;

const BAD = `command = input()
match command:
    case "stop":
        print("Stopping")
`;

const ERR = `numbers = [4, 8, 15]
print(numbers[3])
`;

const TRACEBACK = `Traceback (most recent call last):
  File "index_error.py", line 2, in <module>
    print(numbers[3])
IndexError: list index out of range
`;

// Mirrors DESIGN.md → Layout → Measure by block type.
const MEASURES: [string, string][] = [
  ["Paragraphs, lists, headings, block quotes", "Prose (42rem)"],
  ["Callouts, Details, Practice list", "Prose (42rem)"],
  ["Title-block strip, objectives, closing title block", "Prose (42rem)"],
  ["Code block with its Input / Output / Error panels", "Wide (48rem)"],
  ["Output panel alone", "Wide (48rem)"],
  ["Figures (diagrams, step-throughs, code traces)", "Wide (48rem)"],
  ["Tables, display math", "Wide (48rem)"],
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 border-rule border-t pt-6 first-of-type:mt-10 first-of-type:border-t-0 first-of-type:pt-0">
      <h2 className={h2Class}>{title}</h2>
      <div className="prose-sheet mt-6 [&>*+*]:mt-8!">{children}</div>
    </section>
  );
}

function State({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div data-exhibit="" data-wide="">
      <p className="mb-2 text-ink-3 text-label">{label}</p>
      {children}
    </div>
  );
}

export function DesignGallery({
  practice,
  courseNav,
}: {
  /** Resolved from the registry by the route (judgeUrl()), never typed here. */
  practice: PracticeItemView[];
  courseNav: CourseNav;
}) {
  const first = practice[0];
  const alias = practice.find((p) => p.problem.sameAs);
  return (
    <SiteFrame current="none" courseNav={courseNav}>
      <h1 className={h1Class}>Design gallery</h1>
      <p className="mt-3 max-w-(--measure) text-body text-ink-2">
        Every component in every state, for the pixel review and the visual baselines. Previews
        only.
      </p>
      <TitleBlockStrip
        cells={[
          { label: "Module", value: "M4.3" },
          { label: "Lesson", value: "2 of 3" },
          { label: "Reading time", value: "12 min" },
        ]}
        extra={<DraftBadge />}
      />

      <Block title="Prose">
        <div className="prose-sheet">
          <p>
            A <strong>variable</strong> is a name that points at a value. When Python runs{" "}
            <code>total = 0</code>, it creates the value and ties the name <em>total</em> to it. You
            can read more about <a href="/glossary">every term in the glossary</a>, or open a{" "}
            <Term
              id="variable"
              term="variable"
              definition="A name that refers to a value."
              glossaryHref="/glossary#variable"
            >
              variable
            </Term>{" "}
            to see its definition without leaving the page.
          </p>
          <ul>
            <li>Read the input first.</li>
            <li>Then count as you go.</li>
          </ul>
          <ol>
            <li>Read the sample.</li>
            <li>Work it by hand.</li>
          </ol>
          <table>
            <thead>
              <tr>
                <th>n</th>
                <th>Steps</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10</td>
                <td>100</td>
              </tr>
              <tr>
                <td>1000</td>
                <td>1000000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="Callouts">
        <Callout kind="note">
          <p>Python counts list positions from 0, so the first item is at index 0.</p>
        </Callout>
        <Callout kind="warning">
          <p>Reading past the end of a list stops the program with an IndexError.</p>
        </Callout>
        <Callout kind="grader-tip">
          <p>
            The grader compares your output line by line, so an extra space counts as a difference.
          </p>
        </Callout>
        <Callout kind="note" title="A custom title">
          <p>Authors may replace the label; the icon stays.</p>
        </Callout>
      </Block>

      <Block title="Details">
        <Details summary="Read the steps as text">
          <p className="text-body">Step 1: the loop starts with total at 0.</p>
        </Details>
      </Block>

      <Block title="Code blocks">
        <State label="Fenced, 2 lines (no numbers)">
          <CodeBlock code={SHORT} />
        </State>
        <State label="File, highlights, input and output, caption">
          <CodeBlock
            code={LOOP}
            filename="sum_to_n.py"
            highlight={[3, 4]}
            input={"5\n"}
            output={"15\n"}
            caption="The loop adds each number from 1 to n."
          />
        </State>
        <State label="Excerpt starting at line 12, empty output">
          <CodeBlock code={LOOP} filename="sum_to_n.py" startLine={12} output={""} />
        </State>
        <State label="Wide line (scrolls inside the block)">
          <CodeBlock code={WIDE} filename="describe.py" highlight={[2]} />
        </State>
        <State label="100+ lines (3rem gutter)">
          <CodeBlock code={LONG} filename="squares.py" highlight={[100]} />
        </State>
        <State label="bad38">
          <CodeBlock code={BAD} variant="bad38" />
        </State>
        <State label="expectError: traceback panel">
          <CodeBlock
            code={ERR}
            filename="index_error.py"
            error={{ type: "IndexError", traceback: TRACEBACK }}
          />
        </State>
        <State label="Output alone">
          <OutputPanel output={"Hello, Ada\n"} />
        </State>
      </Block>

      <Block title="Problem links and practice">
        {first ? (
          <p className="max-w-(--measure) text-body">
            Inline: <ProblemLink problem={first.problem} /> sits inside a sentence.
          </p>
        ) : null}
        {alias ? (
          <p className="max-w-(--measure) text-body">
            Crossover: <ProblemLink problem={alias.problem} />.
          </p>
        ) : null}
        <p className="flex gap-3">
          <JudgeBadge judge="wmoj" />
          <JudgeBadge judge="dmoj" />
        </p>
        <Practice items={practice} headingId="gallery-practice" />
      </Block>

      <Block title="Badges, buttons, read cells">
        <div className="flex flex-wrap items-center gap-4">
          <DraftBadge />
          <ComingSoon />
          <ReadCell read={false} />
          <ReadCell read />
          <ReadCell read={false} size="md" />
          <ReadCell read size="md" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </div>
      </Block>

      <Block title="Title-block strip (longest values)">
        <div className="max-w-(--measure)">
          <TitleBlockStrip
            cells={[
              { label: "Module", value: "M4.15" },
              { label: "Lesson", value: "12 of 12" },
              { label: "Reading time", value: "25 min" },
            ]}
            extra={<DraftBadge />}
          />
        </div>
      </Block>

      <Block title="Measure by block type">
        <table>
          <thead>
            <tr>
              <th>Block</th>
              <th>Measure</th>
            </tr>
          </thead>
          <tbody>
            {MEASURES.map(([block, measure]) => (
              <tr key={block}>
                <td>{block}</td>
                <td>{measure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      <Block title="Index rows">
        <div className="border-rule border-t">
          <IndexRow
            id="M4.3"
            title="Prefix sums"
            description="Add up ranges in one step."
            href="/learn"
            meta="3 lessons"
            marks={
              <>
                <ReadCell read />
                <ReadCell read />
                <ReadCell read={false} />
              </>
            }
          />
          <IndexRow
            id="M4.4"
            title="Difference arrays"
            href="/learn"
            meta="2 lessons"
            after={<DraftBadge />}
            marks={
              <>
                <ReadCell read={false} />
                <ReadCell read={false} />
              </>
            }
          />
          <IndexRow id="M4.5" title="Parity and invariants" muted after={<ComingSoon />} />
        </div>
      </Block>

      <Block title="Headings">
        <div className="prose-sheet">
          <h2>Section heading (H2)</h2>
          <p>Body text follows the heading.</p>
          <h3>Sub-section heading (H3)</h3>
          <p>Body text follows the heading.</p>
          <h4>Minor heading (H4)</h4>
          <p>Body text follows the heading.</p>
        </div>
        <p className={minorClass}>Minor style</p>
      </Block>
    </SiteFrame>
  );
}
