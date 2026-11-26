#!/bin/bash
# Installs the latest Archie Editor into /Applications and opens it.
#
#   curl -fsSL https://garrettsiegel.github.io/archie-app/install.sh | bash
#
# What it does, in order: downloads the newest release from GitHub, opens the
# disk image, copies "Archie Editor.app" into Applications (replacing an older
# copy), closes the disk image, deletes the download, and opens the app.
# Nothing else is changed on your Mac.
#
# Source: https://github.com/garrettsiegel/archie-app/blob/main/website/public/install.sh
set -euo pipefail
# Plain ASCII only, and ${braces} on every variable: macOS bash 3.2 can read
# bytes of a non-ASCII character as part of a variable name.
export LC_ALL=C

URL="https://github.com/garrettsiegel/archie-app/releases/latest/download/Archie-Editor.dmg"
APP="Archie Editor.app"
DEST="${ARCHIE_INSTALL_DIR:-/Applications}"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "Archie Editor is a Mac app; this installer only runs on macOS." >&2
  exit 1
fi

tmp="$(mktemp -d)"
mnt=""
cleanup() {
  if [ -n "${mnt}" ]; then hdiutil detach "${mnt}" -quiet || true; fi
  rm -rf "${tmp}"
}
trap cleanup EXIT

echo "Downloading Archie Editor..."
curl -fL --progress-bar -o "${tmp}/Archie-Editor.dmg" "${URL}"

echo "Installing into ${DEST}..."
mnt="$(hdiutil attach -nobrowse -readonly -noautoopen "${tmp}/Archie-Editor.dmg" 2>/dev/null | awk -F'\t' '/\/Volumes\// { print $NF; exit }')"
if [ -z "${mnt}" ] || [ ! -d "${mnt}/${APP}" ]; then
  echo "The download didn't contain ${APP}. Please try again, or download it from the website." >&2
  exit 1
fi

# Close a running copy so it can be replaced.
if [ "${DEST}" = "/Applications" ] && pgrep -x "Archie Editor" >/dev/null 2>&1; then
  osascript -e 'quit app "Archie Editor"' >/dev/null 2>&1 || true
  sleep 2
fi

# Applications usually needs no password; ask only when it does.
SUDO=""
if [ ! -w "${DEST}" ]; then
  echo "Your Mac password is needed to install into ${DEST}."
  SUDO="sudo"
fi
${SUDO} rm -rf "${DEST}/${APP}"
${SUDO} ditto "${mnt}/${APP}" "${DEST}/${APP}"

echo "Installed: ${DEST}/${APP}"
if [ -z "${ARCHIE_NO_OPEN:-}" ]; then
  open "${DEST}/${APP}"
fi
