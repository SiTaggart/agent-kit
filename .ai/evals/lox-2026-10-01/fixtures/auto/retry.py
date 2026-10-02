def retry(operation, max_attempts):
    """Call operation at most max_attempts times after transient failure."""
    if max_attempts < 1:
        raise ValueError("max_attempts must be positive")
    for attempt in range(max_attempts - 1):
        try:
            return operation()
        except ConnectionError:
            if attempt == max_attempts - 1:
                raise
