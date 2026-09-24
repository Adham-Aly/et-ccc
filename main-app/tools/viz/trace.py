"""Record a line-by-line trace of a shown Python example (plan 4.11.1, CodeTrace data).

Runs under PyPy 3.8, standard library only. Usage (normally through `npm run gen:viz`):

    pypy38 tools/viz/trace.py < job.json

The job on standard input is {"example": path, "presets": [{"id", "label", "stdin"}],
"maxSteps": 200, "skip": [...], "notes": {...}}. The result (a `.trace.json` body without the
header fields gen-viz adds) is printed to standard output as JSON.

Each recorded step has: the line about to run (`l`), the event (`e`), the call stack with
each frame's variables (`st`), the heap objects created or changed since the previous step
(`h`, names -> objects model so aliasing is visible), the ids of objects that became
unreachable (`hd`), the text printed since the previous step (`o`), an exception text (`x`),
a return value (`r`) and an auto-written caption (`c`).
"""

import builtins
import io
import json
import sys
import traceback
import types

FILENAME = "<shown-example>"
RAW_EVENT_CAP = 20000
MAX_REPR = 60
MAX_ITEMS = 40
HIDDEN_FRAMES = ("<listcomp>", "<dictcomp>", "<setcomp>", "<genexpr>", "<lambda>")


class TraceError(Exception):
    pass


def short(text, limit=MAX_REPR):
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


class Heap:
    """Assigns stable small ids to objects in first-seen order and encodes values."""

    def __init__(self):
        self.ids = {}
        self.keep = []

    def ref(self, obj):
        key = id(obj)
        if key not in self.ids:
            self.ids[key] = len(self.ids) + 1
            self.keep.append(obj)  # keep alive so id() is never reused
        return self.ids[key]

    def encode(self, value, snapshot):
        """Return a value code: a repr string, or [ref] with the object added to snapshot."""
        if value is None or isinstance(value, (bool, int, float, complex)):
            return short(repr(value))
        if isinstance(value, str):
            return short(repr(value))
        if isinstance(value, (list, tuple, set, frozenset, dict, types.FunctionType)) or hasattr(value, "__dict__") and not isinstance(value, (type, types.ModuleType)):
            rid = self.ref(value)
            if rid not in snapshot:
                snapshot[rid] = None  # placeholder breaks cycles
                snapshot[rid] = self.encode_object(value, snapshot)
            return [rid]
        if isinstance(value, (types.BuiltinFunctionType, types.BuiltinMethodType)):
            return short("<built-in {}>".format(getattr(value, "__name__", "function")))
        return short(repr(value))

    def encode_object(self, value, snapshot):
        if isinstance(value, list):
            return {"t": "list", "v": [self.encode(v, snapshot) for v in value[:MAX_ITEMS]]}
        if isinstance(value, tuple):
            return {"t": "tuple", "v": [self.encode(v, snapshot) for v in value[:MAX_ITEMS]]}
        if isinstance(value, (set, frozenset)):
            return {"t": "set", "v": [self.encode(v, snapshot) for v in list(value)[:MAX_ITEMS]]}
        if isinstance(value, dict):
            items = list(value.items())[:MAX_ITEMS]
            return {"t": "dict", "v": [[self.encode(k, snapshot), self.encode(v, snapshot)] for k, v in items]}
        if isinstance(value, types.FunctionType):
            return {"t": "function", "n": value.__name__}
        attrs = [[k, self.encode(v, snapshot)] for k, v in list(vars(value).items())[:20]]
        return {"t": "object", "c": type(value).__name__, "v": attrs}


def frame_vars(frame, is_module):
    if is_module:
        names = []
        for name, value in frame.f_globals.items():
            if name.startswith("__") or isinstance(value, types.ModuleType):
                continue
            names.append((name, value))
        return names
    local = frame.f_locals
    order = [n for n in frame.f_code.co_varnames if n in local]
    order += [n for n in local if n not in order]
    return [(n, local[n]) for n in order if not n.startswith("__")]


class Tracer:
    def __init__(self, source_lines, max_steps, skip_rules, notes):
        self.lines = source_lines
        self.params = []
        self.max_steps = max_steps
        self.skip_rules = [dict(r, done=False) for r in skip_rules]
        self.notes = {int(k): v for k, v in notes.items()}
        self.noted = set()
        self.heap = Heap()
        self.steps = []
        self.prev_snapshot = {}
        self.prev_state = None
        self.internal_error = None
        self.out = None
        self.out_pos = 0
        self.raw_events = 0
        self.arrivals = {}
        self.skipping = None
        self.skipped = 0
        self.seen_exc = set()
        self.last_line = 1
        self.module_frame = None

    # ---- sys.settrace hooks -------------------------------------------------------------

    def safe_record(self, frame, event, arg):
        """record(), but a bug in the tracer itself fails the run instead of being reported as an
        error raised by the traced program."""
        try:
            self.record(frame, event, arg)
        except TraceError:
            raise
        except Exception as err:
            self.internal_error = traceback.format_exc()
            raise TraceError(f"internal tracer error: {err!r}") from err

    def global_trace(self, frame, event, arg):
        if frame.f_code.co_filename != FILENAME or frame.f_code.co_name in HIDDEN_FRAMES:
            return None
        if self.module_frame is None:
            self.module_frame = frame
        elif event == "call":
            self.safe_record(frame, "call", None)
        return self.local_trace

    def local_trace(self, frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None
        if event == "line":
            self.safe_record(frame, "line", None)
        elif event == "return" and frame is not self.module_frame:
            self.safe_record(frame, "return", arg)
        elif event == "exception":
            exc = arg[1]
            if id(exc) not in self.seen_exc:
                self.seen_exc.add(id(exc))
                self.heap.keep.append(exc)
                self.safe_record(frame, "exception", arg)
        return self.local_trace

    # ---- recording ----------------------------------------------------------------------

    def stack_of(self, frame):
        frames = []
        f = frame
        while f is not None and f.f_code.co_filename == FILENAME:
            frames.append(f)
            f = f.f_back
        frames.reverse()
        return frames

    def snapshot(self, frames):
        snap = {}
        stack = []
        params = []
        for f in frames:
            is_module = f is self.module_frame
            name = "<module>" if is_module else f.f_code.co_name
            values = [[n, self.heap.encode(v, snap)] for n, v in frame_vars(f, is_module)]
            stack.append({"f": name, "l": f.f_lineno, "v": values})
            params.append(() if is_module else f.f_code.co_varnames[: f.f_code.co_argcount])
        self.params = params
        return stack, snap

    def record(self, frame, event, arg):
        self.raw_events += 1
        if self.raw_events > RAW_EVENT_CAP:
            raise TraceError(f"more than {RAW_EVENT_CAP} trace events: shrink the preset input")
        line = frame.f_lineno
        if event == "line":
            self.arrivals[line] = self.arrivals.get(line, 0) + 1
            if self.skipping is None:
                for rule in self.skip_rules:
                    if not rule["done"] and rule["line"] == line and self.arrivals[line] > rule["keep"]:
                        rule["done"] = True
                        self.skipping = rule
                        self.skipped = 0
                        break
            elif line == self.skipping["to"]:
                rule = self.skipping
                self.skipping = None
                self.emit(frame, event, arg, skip_label=rule["label"])
                return
            if self.skipping is not None:
                self.skipped += 1
                return
        elif self.skipping is not None:
            self.skipped += 1
            return
        self.emit(frame, event, arg)

    def emit(self, frame, event, arg, skip_label=None, final=None):
        frames = self.stack_of(frame) if frame is not None else [self.module_frame]
        stack, snap = self.snapshot(frames)
        step = {"l": frame.f_lineno if frame is not None else self.last_line, "e": event, "st": stack}
        changed = {}
        for rid, obj in snap.items():
            if self.prev_snapshot.get(rid) != obj:
                changed[str(rid)] = obj
        if changed:
            step["h"] = changed
        gone = sorted(rid for rid in self.prev_snapshot if rid not in snap)
        if gone:
            step["hd"] = gone
        text = self.out.getvalue()
        if len(text) > self.out_pos:
            step["o"] = text[self.out_pos:]
            self.out_pos = len(text)
        if event == "return":
            step["r"] = self.heap.encode(arg, snap)
            if (
                isinstance(step["r"], list)
                and str(step["r"][0]) not in step.get("h", {})
                and self.prev_snapshot.get(step["r"][0]) is None
            ):
                step.setdefault("h", {})[str(step["r"][0])] = snap[step["r"][0]]
        if event == "exception":
            exc_type, exc = arg[0], arg[1]
            step["x"] = short(f"{exc_type.__name__}: {exc}", 200) if str(exc) else exc_type.__name__
        if final is not None:
            step.update(final)
        state = {
            "stack": stack,
            "heap": snap,
            "line": step["l"],
            "event": step["e"],
            "ret": step.get("r"),
            "params": list(self.params) if frame is not None else [()],
        }
        step["c"] = self.caption(self.prev_state, state, step, skip_label)
        if skip_label is not None:
            step["skipped"] = self.skipped
        if len(self.steps) >= self.max_steps:
            raise TraceError(
                f"more than {self.max_steps} steps: add a skip marker in the .trace.yaml or shrink the preset"
            )
        self.steps.append(step)
        self.prev_snapshot = snap
        self.prev_state = state
        if step["l"] > 0:
            self.last_line = step["l"]

    # ---- captions -----------------------------------------------------------------------

    def src(self, line):
        if 1 <= line <= len(self.lines):
            return self.lines[line - 1]
        return ""

    def show(self, code, heap):
        """Readable value for a caption."""
        if isinstance(code, list):
            obj = heap.get(code[0])
            if obj is None:
                return "an object"
            if obj["t"] in ("list", "tuple", "set"):
                inner = ", ".join(self.show(v, heap) for v in obj["v"][:8])
                if len(obj["v"]) > 8:
                    inner += ", …"
                if obj["t"] == "list":
                    return "[" + inner + "]"
                if obj["t"] == "tuple":
                    return "(" + inner + ("," if len(obj["v"]) == 1 else "") + ")"
                return "{" + inner + "}" if obj["v"] else "set()"
            if obj["t"] == "dict":
                inner = ", ".join(
                    f"{self.show(k, heap)}: {self.show(v, heap)}" for k, v in obj["v"][:6]
                )
                return "{" + inner + (", …" if len(obj["v"]) > 6 else "") + "}"
            if obj["t"] == "function":
                return "the function {}".format(obj["n"])
            return "a {} object".format(obj["c"])
        return code

    # Captions describe what the line that just ran did (plan 4.11.3: what changed and why).

    def caption(self, prev, cur, step, skip_label):
        line = cur["line"]
        heap = cur["heap"]
        if skip_label is not None:
            return f"{skip_label.rstrip('.')}. ({self.skipped} steps skipped; line {line} runs next.)"
        if prev is None:
            return f"Python starts at the top of the file. Line {line} runs first."
        top = cur["stack"][-1]
        ran = prev["line"]
        if step["e"] == "call":
            call_line = prev["stack"][-1]["l"]
            args = self.args(cur, len(cur["stack"]) - 1, heap)
            return "Line {} calls {}{}. A new frame for {} goes on top of the call stack.".format(
                call_line,
                as_code(top["f"]),
                (" with " + args) if args else "",
                as_code(top["f"]),
            )
        if step["e"] == "return":
            args = self.args(cur, len(cur["stack"]) - 1, heap)
            fn = as_code(top["f"])
            who = f"The call of {fn} with {args}" if args else f"The call of {fn}"
            text = "{} returns {}. Its frame leaves the call stack next.".format(who, self.val(step["r"], heap))
            if prev["event"] == "return" and len(prev["stack"]) == len(cur["stack"]) + 1:
                inner_args = self.args(prev, len(prev["stack"]) - 1, prev["heap"])
                text = "The call with {} handed back {}. {}".format(
                    inner_args or "no arguments",
                    self.val(prev_return(self, prev), prev["heap"]),
                    text,
                )
            return self.with_output(text, step, ran)
        if step["e"] == "exception":
            return "Line {} raises an error: {}.".format(line, as_code(step["x"]))
        if step["e"] == "end":
            ran = prev["stack"][0]["l"]
            if "x" in step:
                return self.with_output("The program stops because of the error {}.".format(as_code(step["x"])), step, ran)
            return self.with_output("The program has finished: no lines are left to run.", step, ran)
        if len(cur["stack"]) < len(prev["stack"]):
            where = "the main program" if top["f"] == "<module>" else as_code(top["f"] + "()")
            text = f"Back in {where}, line {top_line(prev)} finishes with the returned value."
            pieces = self.return_changes(prev, cur)
            if "o" in step:
                pieces.append("It prints {}.".format(self.printed(step["o"])))
            return " ".join([text] + pieces[:2])
        if prev["event"] == "call":
            return "{} starts running its body at line {}.".format(as_code(top["f"] + "()"), line)
        return self.add_note(self.describe_line(ran, line, prev, cur, step), ran)

    def val(self, value, heap):
        """A shown value as caption code, unless it is a phrase ("the function f", "a Foo object")."""
        text = self.show(value, heap)
        return text if text.startswith(("the function ", "a ")) else as_code(text)

    def args(self, state, index, heap):
        """The call's arguments: parameter names and their values in frame `index` of a state."""
        frame = state["stack"][index]
        names = state["params"][index]
        return ", ".join(as_code(f"{n} = {self.show(v, heap)}") for n, v in frame["v"] if n in names)

    def with_output(self, text, step, ran):
        if "o" in step:
            return f"Line {ran} runs: it prints {self.printed(step['o'])}. {text}"
        return text

    def add_note(self, text, line):
        note = self.notes.get(line)
        if note and line not in self.noted:
            self.noted.add(line)
            return text + " " + note
        return text

    def changes(self, prev, cur):
        """Variable changes in the top frame between two states (same frame)."""
        top = cur["stack"][-1]
        ptop = prev["stack"][-1]
        before = {n: v for n, v in ptop["v"]}
        out = []
        mutated = {}
        for name, value in top["v"]:
            if name not in before:
                out.append(("new", name, value))
            elif before[name] != value:
                out.append(("set", name, value, before[name]))
            elif isinstance(value, list) and prev["heap"].get(value[0]) != cur["heap"].get(value[0]):
                if value[0] not in mutated:
                    mutated[value[0]] = []
                    out.append(("mut", mutated[value[0]], value))
                mutated[value[0]].append(name)
        return out

    def return_changes(self, prev, cur):
        top = cur["stack"][-1]
        caller = prev["stack"][-2] if len(prev["stack"]) >= 2 else None
        before = {n: v for n, v in caller["v"]} if caller is not None else {}
        out = []
        for name, value in top["v"]:
            if name not in before:
                out.append("{} is created with the value {}.".format(as_code(name), self.val(value, cur["heap"])))
            elif before[name] != value:
                out.append("{} changes to {}.".format(as_code(name), self.val(value, cur["heap"])))
        return out

    def printed(self, text):
        lines = text.rstrip("\n").split("\n")
        if len(lines) == 1:
            return as_code(short(lines[0], 40)) if lines[0] else "an empty line"
        return f"{len(lines)} lines"

    def kind_of(self, value, heap):
        if isinstance(value, list):
            obj = heap.get(value[0])
            if obj is not None:
                return {"list": "list", "tuple": "tuple", "set": "set", "dict": "dictionary"}.get(obj["t"], "object")
        return "value"

    def describe_line(self, ran, nxt, prev, cur, step):
        heap = cur["heap"]
        code = self.src(ran).strip()
        pieces = []
        is_for = code.startswith("for ")
        for ch in self.changes(prev, cur)[:2]:
            if ch[0] == "new":
                if is_for:
                    pieces.append(f"the loop gives {as_code(ch[1])} its first value, {self.val(ch[2], heap)}.")
                elif isinstance(ch[2], list) and heap.get(ch[2][0], {}).get("t") == "function":
                    pieces.append(f"the name {as_code(ch[1])} now refers to a function.")
                else:
                    pieces.append(f"{as_code(ch[1])} is created with the value {self.val(ch[2], heap)}.")
            elif ch[0] == "set":
                if is_for:
                    pieces.append(f"the loop gives {as_code(ch[1])} its next value, {self.val(ch[2], heap)}.")
                else:
                    pieces.append(
                        "{} changes from {} to {}.".format(
                            as_code(ch[1]), self.val(ch[3], prev["heap"]), self.val(ch[2], heap)
                        )
                    )
            else:
                names = ch[1]
                kind = self.kind_of(ch[2], heap)
                if len(names) == 1:
                    who = f"the {kind} that {as_code(names[0])} refers to"
                else:
                    who = "the one {} that {} both refer to".format(kind, " and ".join(as_code(n) for n in names[:2]))
                pieces.append(f"{who} changes; it is now {self.val(ch[2], heap)}.")
        if "o" in step:
            pieces.append("it prints {}.".format(self.printed(step["o"])))
        if pieces:
            text = f"Line {ran} runs: {pieces[0]}"
            if len(pieces) > 1:
                text += " " + pieces[1][0].upper() + pieces[1][1:]
            return text
        if code.startswith(("if ", "elif ", "while ")):
            indent_ran = len(self.src(ran)) - len(self.src(ran).lstrip())
            indent_next = len(self.src(nxt)) - len(self.src(nxt).lstrip())
            truth = nxt > ran and indent_next > indent_ran
            if code.startswith("while "):
                return "Line {} checks the loop condition: it is {}, so {}.".format(
                    ran,
                    "true" if truth else "false",
                    "the loop body runs" if truth else "the loop ends",
                )
            return "Line {} checks the condition: it is {}, so line {} runs next.".format(
                ran,
                "true" if truth else "false",
                nxt,
            )
        if is_for:
            return f"Line {ran}: the loop has no values left, so it ends and line {nxt} runs next."
        if code.startswith("def "):
            return f"Line {ran} defines a function; its body runs only when it is called."
        return f"Line {ran} runs; line {nxt} is next."


def as_code(text):
    """Mark text as code in a caption (backticks; players render it in Mono). The caption markup
    has no escapes, so text that itself holds a backtick stays plain."""
    text = str(text)
    return text if "`" in text or not text else f"`{text}`"


def prev_return(tracer, state):
    """Return value recorded on a return step's state."""
    return state.get("ret", "None")


def top_line(state):
    """Line of the caller frame in a state whose top frame is returning."""
    if len(state["stack"]) >= 2:
        return state["stack"][-2]["l"]
    return state["line"]




def trace_preset(source, stdin_text, job):
    lines = source.split("\n")
    tracer = Tracer(lines, job.get("maxSteps", 200), job.get("skip", []), job.get("notes", {}))
    code = compile(source, FILENAME, "exec")
    globs = {"__name__": "__main__", "__builtins__": builtins}
    fake_in = io.StringIO(stdin_text)
    fake_out = io.StringIO()
    tracer.out = fake_out
    old_in, old_out = sys.stdin, sys.stdout
    sys.stdin, sys.stdout = fake_in, fake_out
    error = None
    try:
        sys.settrace(tracer.global_trace)
        try:
            exec(code, globs)  # noqa: S102 -- running the shown example is the tracer's whole job
        finally:
            sys.settrace(None)
    except TraceError:
        raise
    except BaseException as exc:  # noqa: BLE001 -- the shown example may raise on purpose (expectError)
        error = f"{type(exc).__name__}: {exc}" if str(exc) else type(exc).__name__
    finally:
        sys.stdin, sys.stdout = old_in, old_out
    if tracer.internal_error:
        # Even if the traced program caught the exception, a tracer bug fails the whole run.
        raise TraceError("internal tracer error:\n" + tracer.internal_error)
    final = {"x": short(error, 200)} if error else None
    tracer.module_frame_globals = globs
    tracer.emit_end(final)
    return tracer.steps


def _emit_end(self, final):
    """Final step: the global frame after the last line ran (module frame is gone)."""
    snap = {}
    values = [
        [n, self.heap.encode(v, snap)]
        for n, v in self.module_frame_globals.items()
        if not n.startswith("__") and not isinstance(v, types.ModuleType)
    ]
    # A normal end is on the module frame's own line (e.g. the print that called the last
    # function); an error ends where it was raised, the innermost line that ran.
    line = self.last_line
    prev_stack = self.prev_state["stack"] if self.prev_state else None
    if not final and prev_stack:
        line = prev_stack[0]["l"]
    stack = [{"f": "<module>", "l": line, "v": values}]
    step = {"l": line, "e": "end", "st": stack}
    changed = {str(r): o for r, o in snap.items() if self.prev_snapshot.get(r) != o}
    if changed:
        step["h"] = changed
    gone = sorted(r for r in self.prev_snapshot if r not in snap)
    if gone:
        step["hd"] = gone
    text = self.out.getvalue()
    if len(text) > self.out_pos:
        step["o"] = text[self.out_pos:]
        self.out_pos = len(text)
    if final:
        step.update(final)
    state = {"stack": stack, "heap": snap, "line": line, "event": "end", "params": [()]}
    step["c"] = self.caption(self.prev_state, state, step, None)
    if len(self.steps) >= self.max_steps:
        raise TraceError(f"more than {self.max_steps} steps: add a skip marker or shrink the preset")
    self.steps.append(step)


Tracer.emit_end = _emit_end


def main():
    job = json.loads(sys.stdin.read())
    real_stdout = sys.stdout
    with open(job["example"], "r", encoding="utf-8") as fh:
        source = fh.read()
    presets = []
    try:
        for preset in job["presets"]:
            steps = trace_preset(source, preset.get("stdin", ""), job)
            entry = {"id": preset["id"], "label": preset["label"], "steps": steps}
            if preset.get("stdin"):
                entry["stdin"] = preset["stdin"]
            presets.append(entry)
    except TraceError as err:
        sys.stderr.write(f"trace.py: {err}\n")
        return 1
    real_stdout.write(json.dumps({"code": source, "presets": presets}, ensure_ascii=False) + "\n")
    real_stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
