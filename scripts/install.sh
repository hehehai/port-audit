#!/usr/bin/env sh
set -eu

REPO="hehehai/port-audit"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"
INSTALL_DIR="${PORT_AUDIT_INSTALL_DIR:-$HOME/.local/bin}"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
case "$OS" in
  darwin) PLATFORM="macos" ;;
  linux) PLATFORM="linux" ;;
  *)
    echo "Unsupported OS: ${OS}" >&2
    exit 1
    ;;
esac

TAG="$(curl -fsSL "$API_URL" | sed -n 's/  "tag_name": "\(.*\)",/\1/p')"
if [ -z "$TAG" ]; then
  echo "Failed to resolve latest release tag." >&2
  exit 1
fi

ASSET="port-audit-${TAG}-${PLATFORM}.tar.gz"
URL="https://github.com/${REPO}/releases/download/${TAG}/${ASSET}"

TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "Downloading ${URL}"
curl -fsSL "$URL" -o "$TMP_DIR/${ASSET}"
tar -xzf "$TMP_DIR/${ASSET}" -C "$TMP_DIR"

mkdir -p "$INSTALL_DIR"
install -m 0755 "$TMP_DIR/port" "$INSTALL_DIR/port"

echo "Installed to $INSTALL_DIR/port"
if ! echo "$PATH" | tr ':' '\n' | grep -qx "$INSTALL_DIR"; then
  echo "Add $INSTALL_DIR to PATH to use 'port' globally."
fi
