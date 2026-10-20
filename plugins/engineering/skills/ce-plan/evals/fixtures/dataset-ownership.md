# Repository fixture: dataset snapshots

This is a frozen synthetic system inspired by a dataset ownership problem. It
is not evidence about the current Termpower implementation. These facts are
supplied as inspected source context for this planning exercise.

There are two snapshot/freshness owners. The query cache owns ordinary dataset
snapshots and HTTP request status. A separate store owns SCED cases in compact
column storage and handles its own freshness tracking. Both use the shared
socket transport. A shared socket does not currently imply shared snapshot
ownership.

Request identity includes source, query parameters, date window, and access
scope. Requests that differ in those dimensions can run concurrently. Backend
requests and socket messages use the current wire shapes. The since cursor
refers to accepted snapshot state. Reconnect and in-flight HTTP completion can
overlap. A delayed response may arrive after the consumer changed identity.

SCED compact storage avoids expanding all rows into retained objects. Some
consumers read from query observers and some from the compact store. It has not
been established that one shared lifecycle implementation can publish to both
without temporary mismatches, extra copies, or different cleanup behavior.

A reviewer raised stale response publication, cursor advancement before accepted
snapshot publication, mismatched observer/store reads, and full-row expansion
as concrete hazards. They also suggested adding a stakeholder matrix, a
five-stage approval ladder, and a rollback appendix. None of those suggestions
has been accepted as a product requirement.

User request: Plan one dataset freshness authority while preserving request
identity, transport/backend contracts, and SCED compact column storage. A shared
lifecycle implementation is an idea, but feasibility is unproven. We want a
simpler resulting system. Planning only; save the plan. Use this supplied
context without inspecting the evolving plan in the other checkout.
