# GNU date rejects -r for an epoch. BSD date rejects -d @.
epoch_to_iso() {
	if date --version >/dev/null 2>&1; then
		date -d "@$1" '+%Y-%m-%d'
	else
		date -r "$1" '+%Y-%m-%d'
	fi
}
