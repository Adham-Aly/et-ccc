#!/usr/bin/env python3
"""tools/pycheck/ast-features.py — the Python-feature half of G-PREREQ (plan §7).

Parses one committed .py file with the standard-library `ast` module (never executes it) and
prints a JSON object naming which of a known set of Python features it uses. Run under PyPy 3.8
(`.tooling/bin/pypy38`, the same interpreter the CCC grader uses) so a feature that requires a
newer Python is caught by G-PY-38 (tools/pycheck/check-python.ts) before it ever gets here.

Usage: pypy38 ast-features.py path/to/example.py
Output: {"features": ["for-loop", "print-call", ...]}  (sorted, de-duplicated)

Each feature id here is matched against content/concepts.yaml's own `id` field by
scripts/gates/content-check.ts (G-PREREQ) — a concept with no matcher below is simply not checked
yet; add a visit_* case here and a concepts.yaml entry with the same id together, as P5 introduces
new features.
"""
import ast
import json
import sys


class FeatureVisitor(ast.NodeVisitor):
    def __init__(self):
        self.found = set()
        self._func_name_stack = []

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id == "print":
                self.found.add("print-call")
            if self._func_name_stack and node.func.id == self._func_name_stack[-1]:
                self.found.add("recursion")
        self.generic_visit(node)

    def visit_For(self, node):
        self.found.add("for-loop")
        self.generic_visit(node)

    def visit_While(self, node):
        self.found.add("while-loop")
        self.generic_visit(node)

    def visit_List(self, node):
        self.found.add("list-literal")
        self.generic_visit(node)

    def visit_ListComp(self, node):
        self.found.add("list-comprehension")
        self.generic_visit(node)

    def visit_Dict(self, node):
        self.found.add("dict-literal")
        self.generic_visit(node)

    def visit_Set(self, node):
        self.found.add("set-literal")
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        self.found.add("function-def")
        self._func_name_stack.append(node.name)
        self.generic_visit(node)
        self._func_name_stack.pop()

    def visit_Try(self, node):
        self.found.add("try-except")
        self.generic_visit(node)

    def visit_JoinedStr(self, node):  # f-strings
        self.found.add("f-string")
        self.generic_visit(node)

    def visit_NamedExpr(self, node):  # walrus operator, := (3.8+)
        self.found.add("walrus")
        self.generic_visit(node)

    def visit_Lambda(self, node):
        self.found.add("lambda")
        self.generic_visit(node)


def main():
    if len(sys.argv) != 2:
        print("usage: ast-features.py <path/to/file.py>", file=sys.stderr)
        sys.exit(2)
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        source = f.read()
    tree = ast.parse(source, filename=path)
    visitor = FeatureVisitor()
    visitor.visit(tree)
    print(json.dumps({"features": sorted(visitor.found)}))


if __name__ == "__main__":
    main()
