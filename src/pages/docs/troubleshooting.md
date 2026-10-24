---
layout: ../../layouts/Docs.astro
title: "Troubleshooting"
description: "What to check when a program does not start, and how to report it."
---
## The program closes after a few seconds

The launcher stops a program after five seconds unless you give it more time:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=600000 --desktop=wayland /path/to/application.exe
```

## No window appears

Check that the command has `--desktop=wayland` and that you run it from your desktop session:

```sh
printf '%s\n' "$WAYLAND_DISPLAY" "$XDG_RUNTIME_DIR"
```

If both are set, try one of the Direct3D test programs from the build to tell a graphics setup problem from a problem in the application.

## The file is not recognised

Some download pages save an HTML page under an `.exe` name. Check the file with:

```sh
build/native/raven --inspect /path/to/program.exe
```

and download it again from the vendor if it is not a PE file.

## The installer finishes but the program does not start

Start the installed program with the same `RAVEN_PREFIX` you installed it into. `build/native/raven --inspect-imports` shows the libraries and functions it needs; the first missing one Raven reports is the thing to mention in a bug report. Check the [compatibility page](/docs/compatibility/) for the same version.

## Text is missing or wrong

Note which program, window and text. If you added or moved fonts on the host after creating the prefix, a fresh prefix picks up the current ones.

## A prefix broke after an installation

Close its programs and list the available snapshots. If a checkpoint from before the installation exists, restore it by name. Automatic installer snapshots are attempted, so a checkpoint may be missing:

```sh
build/native/raven --list-snapshots
build/native/raven --restore-prefix SNAPSHOT_NAME
```

## A download fails while configuring

The build checks every pinned download against its hash. A failure usually means no network or an upstream file that changed; the error shows the address and the hash it expected.

## Report a problem

[Open an issue](https://github.com/mirkobrombin/raven/issues) with your Raven revision, distribution, kernel, graphics driver, the application and its version, the exact command, and the terminal output. For a window or drawing problem, add a screenshot.
