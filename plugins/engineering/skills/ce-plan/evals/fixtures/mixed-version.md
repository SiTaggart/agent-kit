# Repository fixture: mixed-version storage

This is a frozen synthetic repository. These are its relevant source contracts.

Workers currently read job payloads with a required `customer_id` field. The
new field name is `account_id`. Storage retains jobs for seven days. Workers
can be offline for three days. Deployment updates workers gradually, so old
and new worker versions can read jobs written during the same deployment.
There is no guarantee that all old workers stop before new writes begin.

The current decoder rejects payloads without `customer_id`. There is no schema
version negotiation. The desired final shape uses only `account_id`. The user
has not selected an expansion/contraction design or an exact removal date.

User request: Plan the field rename without losing queued jobs or breaking old
workers. Planning only; save the plan. Use the supplied source context.
