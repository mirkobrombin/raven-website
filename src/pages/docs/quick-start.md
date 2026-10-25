---
layout: ../../layouts/Docs.astro
title: "Your first application"
description: "Pick a prefix, run an installer and start the program it installs."
---
## Pick a prefix

Complete the [desktop component setup](/docs/installation/#desktop-and-graphics) first. Direct3D applications also need the [graphics DLLs and runtime path](/docs/graphics/#get-the-components).

Give the application a prefix of its own:

```sh
export RAVEN_PREFIX="$HOME/.local/share/raven/my-first-app"
```

Raven creates the Windows folders the first time it opens the prefix. Keep the same value for everything you do with that application.

The [prefix guide](/docs/prefixes/) explains what is stored there and how to open Raven's settings panel or use the included installation tools.

## Install it

Run the vendor's installer the way you would on Windows:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=600000 --desktop=wayland /path/to/setup.exe
```

Raven attempts an automatic snapshot for recognised installers. Create a manual snapshot when you need a guaranteed checkpoint: run `build/native/raven --snapshot-prefix before-install` first, check that it succeeds and confirm the checkpoint with `build/native/raven --list-snapshots`. Installer detection and snapshot creation can fail; do not assume a [rollback point](/docs/prefixes/) exists.

## Start it

The installed program is under `drive_c/Program Files` (or `Program Files (x86)` for 32-bit software) inside the prefix:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=600000 --desktop=wayland \
  "$RAVEN_PREFIX/drive_c/Program Files/App/app.exe"
```

`--timeout-ms` is how long Raven lets the program run, in milliseconds; the example gives it ten minutes. Without it the limit is five seconds, which suits quick tests and little else.

## Console programs

Connect a command-line tool to your terminal with `--stdio=inherit`:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=60000 --stdio=inherit /path/to/program.exe
```

## Pass arguments

Everything after `--` goes to the program:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=60000 --stdio=inherit /path/to/program.exe -- --version
```

The options before the program keep this order: timeout, desktop, stdio. The [command-line reference](/docs/command-line/) has the details.

## If it does not work

Keep the terminal output and see [troubleshooting](/docs/troubleshooting/). A report with the application version and the exact command is the quickest to fix.
