---
layout: ../../layouts/Docs.astro
title: "Prefixes and snapshots"
description: "Choose an application environment, use Raven's built-in tools and restore its saved state."
---
A prefix holds an application's Windows environment between runs: its drives, registry, settings and installed programs. Choose one with `RAVEN_PREFIX`; without it Raven uses `$HOME/.local/share/raven/default`.

The prefix is separate from the Linux runtime that runs the application. It does not boot Windows or contain a Windows kernel. Raven supplies the system services and loads its guest components alongside the application's libraries.

## What it contains

| Location | Contents |
| --- | --- |
| `drive_c/` | The application's `C:` drive |
| `drive_c/windows/system32/` | 64-bit system tools and files |
| `drive_c/windows/syswow64/` | 32-bit system tools and files |
| `drive_c/Program Files/` | The usual location for 64-bit applications |
| `drive_c/Program Files (x86)/` | The usual location for 32-bit applications |
| `drive_c/Users/` | Windows user folders |
| `registry.dat` | Raven's persistent registry data |

Raven creates the initial folders automatically. The Windows Fonts folder contains links to available host fonts. On process startup, the launcher copies the system tools available beside the runtime into the prefix and registers the supplied COM components when needed. Which components are available depends on your [build configuration](/docs/installation/#desktop-and-graphics).

## How it differs from a Wine prefix

Both projects use the word *prefix* for a directory that keeps an application's Windows environment separate. That shared term does not make their prefixes interchangeable.

Raven uses `RAVEN_PREFIX`, its own registry format and drive mapping, and its own loader and system components. A Wine prefix is prepared for Wine's runtime and configuration tools. Do not point Raven at an existing Wine prefix or use `wineboot`, `winecfg` or Winetricks to configure a Raven prefix. Create a new Raven prefix and run the application's installer through Raven.

Software that installs standard Windows dependencies can still use Windows installers inside Raven. Those installed packages belong to the selected prefix; switching prefixes also switches the installed dependencies.

## Create one

```sh
export RAVEN_PREFIX="$HOME/.local/share/raven/editor"
build/native/raven --snapshot-prefix clean
```

This creates the initial directories and saves a snapshot. System tools are prepared when you first run a process. Use an absolute prefix path, and keep the variable set for the installer, the installed program and any tools you run on its behalf. A new terminal needs the same `export` again.

For a single command, set the prefix inline:

```sh
RAVEN_PREFIX="$HOME/.local/share/raven/editor" \
  build/native/raven --run-process --execution=native \
  --timeout-ms=600000 --desktop=wayland /path/to/editor.exe
```

A prefix separates application state. It is not a separate Linux account or a file-access boundary: Raven also exposes the host filesystem through `Z:`. Snapshots cover the prefix, not files an application changes elsewhere.

## Built-in tools

With the [desktop and installer components](/docs/installation/#desktop-and-graphics) configured, the build places these programs beside `build/native/raven`. Run them through Raven with the same `RAVEN_PREFIX` as the application you want to manage.

| Program | Use |
| --- | --- |
| `control.exe` | Raven's settings panel: system information, personalization, installed applications and runtime options |
| `regedit.exe` | Import Windows `.reg` files into this prefix; the current implementation has no graphical registry browser |
| `msiexec.exe` | Install or remove Windows Installer packages |
| `regsvr32.exe` | Register a COM DLL in the prefix |
| `dism.exe` | Query or enable Raven's supported Windows features; currently `NetFx3` |
| `fondue.exe` | Ask for and install the supported .NET Framework 3.5 feature from a local package |

These are the implementations supplied by Raven and its open source components. Their names do not imply that every option of the Windows programs is implemented. A minimal build may omit them; check the component setup if an executable is missing.

### Open the settings panel

```sh
export RAVEN_PREFIX="$HOME/.local/share/raven/editor"
build/native/raven --run-process --execution=native \
  --timeout-ms=3600000 --desktop=wayland build/native/control.exe
```

Open a particular page by passing `System`, `Personalization`, `Apps` or `Raven` after `--`:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=3600000 --desktop=wayland build/native/control.exe -- Apps
```

The Apps page reads the prefix's installed-program registrations. The Raven page stores tracing and compatibility options in that prefix's registry. Restart an application to pick up changed runtime options; an explicitly set environment variable takes precedence over its registry setting.

### Import registry settings

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=60000 --stdio=inherit build/native/regedit.exe \
  -- /s 'Z:\path\to\settings.reg'
```

Use a Windows path for a guest program's file arguments. In this example, `Z:\path\to\settings.reg` refers to `/path/to/settings.reg` on Linux. Take a snapshot first if you need to undo an import.

### Install an MSI package

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=3600000 --desktop=wayland build/native/msiexec.exe \
  -- /i 'Z:\path\to\application.msi'
```

For a COM DLL that needs manual registration:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=60000 --stdio=inherit build/native/regsvr32.exe \
  -- 'C:\Program Files\App\component.dll'
```

Use the corresponding tool under `build/native/x86/` when registering a 32-bit DLL.

### Install application dependencies

Raven provides the integration for supported Windows features, not Microsoft's redistributable packages. Supply the package an application needs, such as a Visual C++ Redistributable or .NET Framework installer, and run it in that application's prefix using the [normal installer command](/docs/quick-start/#install-it).

For .NET Framework 3.5, the supplied DISM implementation accepts the full `dotnetfx35.exe` package or an extracted source directory:

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=60000 --stdio=inherit build/native/dism.exe \
  -- /Online /Get-Features

build/native/raven --run-process --execution=native \
  --timeout-ms=3600000 --stdio=inherit build/native/dism.exe \
  -- /Online /Enable-Feature /FeatureName:NetFx3 \
  '/Source:Z:\path\to\dotnetfx35.exe'
```

The graphical feature prompt is available through `fondue.exe -- /enable-feature:NetFx3`. It asks you to select a local package when no source is configured. This feature support does not install .NET Framework 4.x automatically or guarantee that every managed application works.

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
