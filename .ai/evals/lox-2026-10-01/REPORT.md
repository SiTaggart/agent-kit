# LOX side-by-side pilot

LOX is worth testing separately. This pilot does not support replacing the existing skills as a group.

## Results

- **PR descriptions:** both were accurate. LOX was shorter, but kept the unrun-test gap outside the copy-ready body. The existing skill included Testing in the body.
- **Planning:** both plans reused existing inspection behavior. LOX omitted documentation for the public flag. CEPlan included that work and stronger proof against write attempts, but timed out after saving its plan.
- **Simplicity:** LOX completed a grounded no-findings report. Thermo reached the time cap. This pair does not establish a quality winner.
- **Adversarial:** LOX surfaced one supported uninstall cleanup gap missed by the existing review, plus one rejected concurrency claim. Actual Codex runtime consequences remain unverified.
- **Auto review:** both workflows repaired the same retry bound. Each reproduced two failing tests, preserved the tests and contract, and finished with all five tests passing.

## Method and limits

Five paired tasks used `gpt-6.1-sol` with high reasoning, identical source inputs within each pair, fresh ephemeral sessions, and a five-minute cap. Eight runs completed a final handoff. One faulty setup attempt was excluded and rerun.

The baselines were Git `pr-description` 0.2.2 and Engineering 0.2.10: `ce-plan`, `ce-thermo-nuclear-code-quality-review`, and `ce-review` in quick mode. The auto baseline composed review, authorized fixes, `ce-quality-gate`, and a focused recheck. PStack and `ce-simplify-code` were not compared.

LOX used the [local adaptation](../../../plugins/lox/UPSTREAM.md) of upstream revision `7c71d80df75666fdbae9e712ac491aa86a21baed`.

Source fixtures were Agent Kit commit `646e2e144ccc521bbd711d0a4ea230fbcbbefef4` and its parent for PR descriptions, and `5875aaf54b4797a29650b4ed5274a7935f7912f2` and its parent for planning and reviews. The [retry fixture](fixtures/auto/README.md) supplies the auto-review contract and independent tests.

Memory, plugins, delegation, and ambient instruction loading were disabled. Isolation was incomplete: host role warnings appeared, and some checks could resolve enclosing dependencies. Write-requiring installer tests and the Codex parser were not exercised. Planning and risk claims received a separate source check; there was no blind grader.

One run per task and capped handoffs do not establish general quality, speed, or cost rankings. Raw run artifacts remain recoverable from commit `326a93e`; they are omitted from the retained tree.
