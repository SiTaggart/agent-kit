#!/usr/bin/env python3
"""Inventory and safely export OpenCode sessions from its local SQLite store."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import sqlite3


DEFAULT_DB = pathlib.Path.home() / ".local" / "share" / "opencode" / "opencode.db"
SAFE_TARGET_KEYS = ("filePath", "path", "workdir")


def connect_read_only(path: pathlib.Path) -> sqlite3.Connection:
    connection = sqlite3.connect(f"{path.resolve().as_uri()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    return connection


def iso_timestamp(milliseconds: int) -> str:
    return dt.datetime.fromtimestamp(milliseconds / 1000, tz=dt.timezone.utc).isoformat()


def load_json(value: str) -> dict:
    try:
        parsed = json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return {}
    return parsed if isinstance(parsed, dict) else {}


def dialogue_text(connection: sqlite3.Connection, session_id: str) -> str:
    rows = connection.execute(
        """
        SELECT p.data
        FROM part AS p
        JOIN message AS m ON m.id = p.message_id
        WHERE p.session_id = ?
          AND json_extract(m.data, '$.role') IN ('user', 'assistant')
          AND json_extract(p.data, '$.type') = 'text'
        ORDER BY p.time_created, p.id
        """,
        (session_id,),
    )
    return "\n".join(
        text
        for row in rows
        if isinstance(text := load_json(row["data"]).get("text"), str)
    )


def inventory(args: argparse.Namespace) -> None:
    since = int(
        (dt.datetime.now(tz=dt.timezone.utc) - dt.timedelta(days=args.days)).timestamp()
        * 1000
    )
    keywords = [keyword for keyword in (args.keyword or "").split(",") if keyword]
    processed = 0
    matched = 0

    with connect_read_only(args.db) as connection:
        rows = connection.execute(
            """
            SELECT s.id, s.parent_id, s.directory, s.title,
                   s.time_created, s.time_updated
            FROM session AS s
            WHERE s.time_updated >= ?
              AND EXISTS (
                  SELECT 1
                  FROM message AS m
                  WHERE m.session_id = s.id
                    AND json_extract(m.data, '$.role') = 'user'
              )
            ORDER BY s.time_updated DESC, s.id
            """,
            (since,),
        ).fetchall()

        for row in rows:
            if args.cwd_filter and args.cwd_filter not in row["directory"]:
                continue
            processed += 1
            result = {
                "platform": "opencode",
                "session": row["id"],
                "parent_session": row["parent_id"],
                "cwd": row["directory"],
                "title": row["title"],
                "ts": iso_timestamp(row["time_created"]),
                "last_ts": iso_timestamp(row["time_updated"]),
            }
            if keywords:
                text = dialogue_text(connection, row["id"]).lower()
                keyword_matches = {
                    keyword: text.count(keyword.lower()) for keyword in keywords
                }
                result["keyword_matches"] = keyword_matches
                result["match_count"] = sum(keyword_matches.values())
                if result["match_count"] == 0:
                    continue
                matched += 1
            print(json.dumps(result))

    meta = {"_meta": True, "files_processed": processed, "parse_errors": 0}
    if keywords:
        meta["files_matched"] = matched
    print(json.dumps(meta))


def safe_tool_part(part: dict) -> dict:
    state = part.get("state") if isinstance(part.get("state"), dict) else {}
    tool_input = state.get("input") if isinstance(state.get("input"), dict) else {}
    target = next(
        (
            tool_input[key][:200]
            for key in SAFE_TARGET_KEYS
            if isinstance(tool_input.get(key), str)
        ),
        "",
    )
    return {
        "type": "tool",
        "name": part.get("tool", "unknown"),
        "target": target,
        "status": state.get("status", ""),
    }


def export_session(args: argparse.Namespace) -> None:
    with connect_read_only(args.db) as connection:
        session = connection.execute(
            """
            SELECT id, parent_id, directory, time_created, time_updated
            FROM session
            WHERE id = ?
            """,
            (args.session_id,),
        ).fetchone()
        if session is None:
            raise SystemExit(f"OpenCode session not found: {args.session_id}")

        messages = []
        message_rows = connection.execute(
            """
            SELECT id, time_created, data
            FROM message
            WHERE session_id = ?
            ORDER BY time_created, id
            """,
            (args.session_id,),
        ).fetchall()
        for message_row in message_rows:
            role = load_json(message_row["data"]).get("role")
            if role not in ("user", "assistant"):
                continue
            parts = []
            part_rows = connection.execute(
                """
                SELECT data
                FROM part
                WHERE message_id = ?
                ORDER BY time_created, id
                """,
                (message_row["id"],),
            )
            for part_row in part_rows:
                part = load_json(part_row["data"])
                if part.get("type") == "text" and isinstance(part.get("text"), str):
                    parts.append({"type": "text", "text": part["text"]})
                elif part.get("type") == "tool":
                    parts.append(safe_tool_part(part))
            if parts:
                messages.append(
                    {
                        "role": role,
                        "ts": iso_timestamp(message_row["time_created"]),
                        "parts": parts,
                    }
                )

    print(
        json.dumps(
            {
                "platform": "opencode",
                "session": session["id"],
                "parent_session": session["parent_id"],
                "cwd": session["directory"],
                "ts": iso_timestamp(session["time_created"]),
                "last_ts": iso_timestamp(session["time_updated"]),
                "messages": messages,
            }
        )
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=pathlib.Path, default=DEFAULT_DB)
    subparsers = parser.add_subparsers(dest="command", required=True)

    inventory_parser = subparsers.add_parser("inventory")
    inventory_parser.add_argument("--days", type=int, default=7)
    inventory_parser.add_argument("--cwd-filter")
    inventory_parser.add_argument("--keyword")

    export_parser = subparsers.add_parser("export")
    export_parser.add_argument("session_id")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.command == "inventory":
        inventory(args)
    else:
        export_session(args)


if __name__ == "__main__":
    main()
