# ce-plan evaluations

`evals.json` retains the output-mode regression suite: argument/config/default
precedence, inactive comments, pipeline Markdown, unknown values, and literal
conventional-commit prefixes. Run it in a scratch repository with each declared
config. See `grader.md` for grading and limits.

`plans.json` contains instruction-following smoke tests with supplied synthetic
context. The fixtures already select the relevant capabilities and hazards.
Give a fresh planning agent the skill and one fixture, without the grading
expectations. Inspect the saved plan against the rubric. Assess simple work,
consequential architecture, concrete migration constraints, larger features,
unresolved scope, and legacy revision.
Assess coverage of the supplied fixture. Do not reward brevity, a particular heading
set, a word quota, or the absence of useful detail.

Keep generated reports under `.ai/evals/`. Record which cases actually ran,
what artifacts were inspected, and what remains untested. Fixtures establish
use of supplied context. They do not test discovery of project context,
completeness against a real repository, or architectural feasibility.
