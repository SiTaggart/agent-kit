import unittest
from retry import retry

class RetryTests(unittest.TestCase):
    def test_first_attempt_success(self):
        self.assertEqual(retry(lambda: "ok", 3), "ok")

    def test_last_allowed_attempt_can_succeed(self):
        calls = []
        def operation():
            calls.append(1)
            if len(calls) < 3:
                raise ConnectionError("transient")
            return "recovered"
        self.assertEqual(retry(operation, 3), "recovered")
        self.assertEqual(len(calls), 3)

    def test_failure_exhausts_exact_budget(self):
        calls = []
        def operation():
            calls.append(1)
            raise ConnectionError("offline")
        with self.assertRaisesRegex(ConnectionError, "offline"):
            retry(operation, 3)
        self.assertEqual(len(calls), 3)

    def test_invalid_budget_never_calls_operation(self):
        calls = []
        with self.assertRaises(ValueError):
            retry(lambda: calls.append(1), 0)
        self.assertEqual(calls, [])

    def test_other_errors_do_not_retry(self):
        calls = []
        def operation():
            calls.append(1)
            raise RuntimeError("permanent")
        with self.assertRaisesRegex(RuntimeError, "permanent"):
            retry(operation, 3)
        self.assertEqual(len(calls), 1)

if __name__ == "__main__":
    unittest.main()
