# Grade scannable UI text

Read the prompt, its case in `evals.json`, and the full runner response.
Judge the result by meaning and reader task, not by matching a model answer.

For each case, check these dimensions:

1. **Fidelity.** Every claim is supported. Status, uncertainty, negation,
   quantities, sentiment, and consequential conditions survive.
2. **Comparison.** Neighboring items use a useful common pattern. The details
   needed to distinguish them are visible early. Real differences remain.
3. **Interface contract.** IDs and any required tokens are intact. Width
   targets are respected where meaning allows. Visual checks are not invented.
4. **Scope.** The response completes only the requested work. It does not
   expand a task name into implementation or force UI patterns on prose.

For case 4, parse the JSON and compare its keys and the interpolation tokens
in each value with the input. For cases 1 and 2, count characters only as a
text check; actual layout remains unverified. For case 5, compare the result
with the original sentence after correcting the one typo.

Mark `pass` only when the case's expected behavior holds and no `must_not`
behavior occurs. Mark `fail` for a concrete violation and quote the evidence.
Use `inconclusive` for a missing or interrupted response, not to excuse a
meaning change. Out-of-scope case 5 needs only fidelity and scope checks.

Report one short verdict per case and any verification limits. An explicit
invocation cannot test automatic selection. Passing these cases does not prove
that the skill improves all UI text or that any layout is accessible.
