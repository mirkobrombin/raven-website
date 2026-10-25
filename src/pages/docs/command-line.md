---
layout: ../../layouts/Docs.astro
title: "Command-line reference"
description: "The launcher, the inspection modes and the prefix commands."
---
The examples run from the source folder with Raven built in `build/native/raven`.

## Run a program

```text
raven --run-process --execution=native [--timeout-ms=N] [--desktop=wayland] [--stdio=inherit] program.exe [library.dll ...] [-- argument ...]
```

| Option | Meaning |
| --- | --- |
| `--run-process` | Start a Windows process |
| `--execution=native` | Run its code directly on the CPU |
| `--timeout-ms=N` | How long it may run, 1 to 86400000 ms; 5000 by default |
| `--desktop=wayland` | Show its windows on your Wayland desktop |
| `--stdio=inherit` | Connect it to your terminal |
| `library.dll` | Extra libraries to load with the program |
| `--` | Everything after it goes to the program |

The options come in the order above. Quote paths with spaces:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=600000 --desktop=wayland --stdio=inherit \
  "/path/to/My App.exe" -- "argument with spaces"
```

## Inspect an executable

```sh
build/native/raven --inspect program.exe
build/native/raven --inspect-imports program.exe
build/native/raven --inspect-exports library.dll
build/native/raven --inspect-delay-imports program.exe
build/native/raven --inspect-resources program.exe
```

They print the headers, the imported and exported functions, the delay-loaded libraries and the resources of a PE file. `--inspect-imports` is the quickest way to see what a program needs.

## Loader modes

```text
raven --map-image program.exe [base-address]
raven --dump-image program.exe [base-address]
raven --bind-imports program.exe library.dll ...
raven --run-entry --execution=native program.exe
raven --run-modules --execution=native program.exe library.dll ...
```

These lower-level modes are for working on Raven itself; applications use `--run-process`.

## Snapshots

```text
raven --snapshot-prefix [label]
raven --list-snapshots
raven --restore-prefix [snapshot-name]
```

They act on the prefix in `RAVEN_PREFIX`, or the default one. Without a name, `--restore-prefix` restores the newest snapshot. See [prefixes and snapshots](/docs/prefixes/).

## Settings and installation tools

The desktop and installer components provide `control.exe`, `regedit.exe`, `msiexec.exe`, `regsvr32.exe`, `dism.exe` and `fondue.exe`. Launch them through `--run-process` with the application's `RAVEN_PREFIX`; their arguments follow `--`, just like any other Windows program.

The [built-in tools guide](/docs/prefixes/#built-in-tools) covers their purpose and launch commands, including .NET Framework 3.5 feature installation from a local package.

## Environment

| Variable | Role |
| --- | --- |
| `RAVEN_PREFIX` | The prefix to use |
| `HOME` | Where the default prefix lives |
| `WAYLAND_DISPLAY` | Your Wayland session |
| `XDG_RUNTIME_DIR` | Your session's runtime folder |
| `RAVEN_TESTDATA_DIR` | Where tests keep generated and downloaded programs |
