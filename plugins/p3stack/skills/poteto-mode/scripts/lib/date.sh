# GNU and BusyBox take -d @epoch. BSD date takes -r and rejects -d.
epoch_to_iso() {
	date -d "@$1" '+%Y-%m-%d' 2>/dev/null || date -r "$1" '+%Y-%m-%d'
}
