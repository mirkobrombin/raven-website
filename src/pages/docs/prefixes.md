---
layout: ../../layouts/Docs.astro
title: "Prefixes and snapshots"
description: "Keep applications apart and bring a prefix back to any earlier state."
---
A prefix is the Windows installation an application sees: its `C:` drive, its system folders and its registry. Choose one with `RAVEN_PREFIX`; without it Raven uses `$HOME/.local/share/raven/default`.

## Create one

```sh
export RAVEN_PREFIX="$HOME/.local/share/raven/editor"
build/native/raven --snapshot-prefix clean
```

The `C:` drive is the `drive_c` folder, with `windows/system32`, `windows/syswow64`, `Program Files` and `Program Files (x86)` inside, as on Windows. Raven also links your host fonts into the Windows Fonts folder. Use an absolute path, and keep the variable set for everything you do with that application.

## Snapshots

```sh
build/native/raven --snapshot-prefix before-update
build/native/raven --list-snapshots
```

A snapshot's name is a timestamp followed by your label. Unchanged files are shared with earlier snapshots through hard links, so taking one is quick and cheap.

## Restore

The most recent snapshot:

```sh
build/native/raven --restore-prefix
```

A specific one, by the name `--list-snapshots` prints:

```sh
build/native/raven --restore-prefix SNAPSHOT_NAME
```

Close the applications using the prefix first. Raven saves the state it replaces as a new snapshot, so a restore can be undone too.

## Automatic snapshots before installers

Raven attempts a snapshot before running a recognised installer and retains up to ten automatic snapshots. Recognition and snapshot creation can fail. A child installer may rely on the outer installer's checkpoint, if one was created. Take a manual snapshot before an installation you need to undo, check that the command succeeds and confirm its name with `--list-snapshots` before proceeding.

## One prefix per application

Separate prefixes keep applications, and their redistributables, from affecting each other, and make a clean reproduction of a problem one command away.
