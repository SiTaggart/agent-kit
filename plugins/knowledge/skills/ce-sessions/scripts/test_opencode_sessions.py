#!/usr/bin/env python3

import json
import pathlib
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest


SCRIPTS = pathlib.Path(__file__).parent
OPENCODE = SCRIPTS / "opencode-sessions.py"
SKELETON = SCRIPTS / "extract-skeleton.py"


class OpenCodeSessionsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.directory = pathlib.Path(self.temporary_directory.name)
        self.database_path = self.directory / "opencode.db"
        self.now = int(time.time() * 1000)

        with sqlite3.connect(self.database_path) as database:
            database.executescript(
                """
                CREATE TABLE session (
                  id TEXT PRIMARY KEY,
                  parent_id TEXT,
                  directory TEXT NOT NULL,
                  title TEXT NOT NULL,
                  time_created INTEGER NOT NULL,
                  time_updated INTEGER NOT NULL
                );
                CREATE TABLE message (
                  id TEXT PRIMARY KEY,
                  session_id TEXT NOT NULL,
                  time_created INTEGER NOT NULL,
                  data TEXT NOT NULL
                );
                CREATE TABLE part (
                  id TEXT PRIMARY KEY,
                  message_id TEXT NOT NULL,
                  session_id TEXT NOT NULL,
                  time_created INTEGER NOT NULL,
                  data TEXT NOT NULL
                );
                """
            )
            database.executemany(
                "INSERT INTO session VALUES (?, ?, ?, ?, ?, ?)",
                [
                    ("root", None, "/work/spade", "Root", self.now, self.now),
                    ("child", "root", "/work/spade", "Child", self.now, self.now),
                    ("empty", None, "/work/spade", "Empty", self.now, self.now),
                ],
            )
            database.executemany(
                "INSERT INTO message VALUES (?, ?, ?, ?)",
                [
                    ("user", "root", self.now, json.dumps({"role": "user"})),
                    (
                        "assistant",
                        "root",
                        self.now + 1,
                        json.dumps({"role": "assistant"}),
                    ),
                    (
                        "child-user",
                        "child",
                        self.now + 2,
                        json.dumps({"role": "user"}),
                    ),
                ],
            )
            database.executemany(
                "INSERT INTO part VALUES (?, ?, ?, ?, ?)",
                [
                    self.part(
                        "user-text",
                        "user",
                        "root",
                        0,
                        {"type": "text", "text": "Please apply the correction pattern."},
                    ),
                    self.part(
                        "assistant-text",
                        "assistant",
                        "root",
                        1,
                        {"type": "text", "text": "I will update the owning guidance now."},
                    ),
                    self.part(
                        "reasoning",
                        "assistant",
                        "root",
                        2,
                        {"type": "reasoning", "text": "SECRET_REASONING"},
                    ),
                    self.part(
                        "tool",
                        "assistant",
                        "root",
                        3,
                        {
                            "type": "tool",
                            "tool": "edit",
                            "state": {
                                "status": "completed",
                                "input": {
                                    "filePath": "/work/spade/AGENTS.md",
                                    "command": "SECRET_COMMAND",
                                },
                                "output": "SECRET_TOOL_OUTPUT",
                            },
                        },
                    ),
                    self.part(
                        "child-text",
                        "child-user",
                        "child",
                        4,
                        {"type": "text", "text": "Worker follow-up."},
                    ),
                ],
            )

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def part(
        self,
        part_id: str,
        message_id: str,
        session_id: str,
        offset: int,
        data: dict,
    ) -> tuple:
        return (
            part_id,
            message_id,
            session_id,
            self.now + offset,
            json.dumps(data),
        )

    def run_adapter(self, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(OPENCODE),
                "--db",
                str(self.database_path),
                *arguments,
            ],
            check=True,
            capture_output=True,
            text=True,
        )

    def test_inventory_uses_dialogue_text_and_preserves_lineage(self) -> None:
        result = self.run_adapter(
            "inventory",
            "--days",
            "7",
            "--keyword",
            "correction,SECRET_REASONING",
        )
        rows = [json.loads(line) for line in result.stdout.splitlines()]

        self.assertEqual(
            rows[0],
            {
                "platform": "opencode",
                "session": "root",
                "parent_session": None,
                "cwd": "/work/spade",
                "title": "Root",
                "ts": rows[0]["ts"],
                "last_ts": rows[0]["last_ts"],
                "keyword_matches": {"correction": 1, "SECRET_REASONING": 0},
                "match_count": 1,
            },
        )
        self.assertEqual(
            rows[-1],
            {
                "_meta": True,
                "files_processed": 2,
                "parse_errors": 0,
                "files_matched": 1,
            },
        )

    def test_export_and_skeleton_exclude_private_session_data(self) -> None:
        exported = self.run_adapter("export", "root")
        skeleton = subprocess.run(
            [sys.executable, str(SKELETON)],
            input=exported.stdout,
            check=True,
            capture_output=True,
            text=True,
        ).stdout

        self.assertIn("[user] Please apply the correction pattern.", skeleton)
        self.assertIn("[assistant] I will update the owning guidance now.", skeleton)
        self.assertIn("[tool] edit /work/spade/AGENTS.md -> completed", skeleton)
        self.assertNotIn("SECRET_REASONING", skeleton)
        self.assertNotIn("SECRET_COMMAND", skeleton)
        self.assertNotIn("SECRET_TOOL_OUTPUT", skeleton)


if __name__ == "__main__":
    unittest.main()
