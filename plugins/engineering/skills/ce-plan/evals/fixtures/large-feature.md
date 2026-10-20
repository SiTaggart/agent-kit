# Repository fixture: scheduled team reports

This is a frozen synthetic repository. The following facts supply the relevant
inspected source context. Do not infer anything about a production system.

The product already has saved report definitions, a report renderer, a job
queue, workspace membership checks, a mail transport, and a timezone-aware
scheduler. Saved reports have stable IDs. The renderer resolves current data
when the job runs. It can render HTML and CSV from the same result. Workspace
membership is checked at request time today. Reports can include sensitive
workspace data. Job delivery is at-least-once, and queued jobs can outlive a
membership change. The mail provider returns a delivery ID on acceptance but
can time out after accepting a request. It does not promise exactly-once mail.
The scheduler stores an IANA timezone and a local wall-clock schedule. It
already calculates future instants across daylight-saving changes. Report
editing has separate permissions from report viewing. The UI has a settings
page, a reusable recipient picker, and standard loading/error feedback.

User request: Create a plan for scheduled team report subscriptions. The
accepted feature includes all of the following, rather than a smaller pilot:

- Report editors can create, edit, pause, resume, and delete a subscription for
  a saved report. Report viewers cannot manage subscriptions.
- Each subscription supports daily or weekly delivery, a local time, an IANA
  timezone, and a choice of HTML summary, CSV attachment, or both. Weekly
  subscriptions allow choosing a weekday.
- Recipients must be current members of the same workspace. Editors select
  recipients explicitly; do not infer a recipient list from all members.
- Keep delivery at the selected local wall-clock time across daylight-saving
  changes, using the existing scheduler's treatment of missing/repeated times.
- Resolve report data when delivery runs, using the saved report's current
  definition. If the report no longer exists, stop future deliveries and make
  the reason visible to an editor.
- Recheck recipient membership when delivering. A recipient removed from the
  workspace after scheduling must not receive workspace data.
- Avoid sending duplicate reports when the queue redelivers a job. Distinguish
  a provider-confirmed acceptance from a timeout with unknown acceptance;
  do not promise an exactly-once provider guarantee that the provider lacks.
- Show an editor the active schedule, selected recipients, next scheduled
  delivery, most recent attempt, and delivery failure reason. A subscription
  can exist before its first delivery, so the UI must represent that state.
- An editor can send a preview to themselves without changing the schedule or
  the recipient list. Preview uses the same rendering as scheduled delivery.
- Pause prevents new scheduled deliveries. Deleting a subscription must prevent
  a previously queued job from sending it. Running jobs need to respect that
  cancellation boundary before calling the mail provider.
- A bad recipient or render failure must not silently disable the subscription.
  Record the attempt and provide enough context for an editor to correct it.
- Preserve the existing saved report behavior and mail transport contract.
  The feature must use existing workspace permissions and scheduler semantics.

Include all useful context and technical direction needed to plan this whole
feature. Planning only; save the plan. This fixture supplies the source
context; do not implement or inspect other repositories.
