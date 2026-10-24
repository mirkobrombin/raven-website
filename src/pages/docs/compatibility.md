---
layout: ../../layouts/Docs.astro
title: "Application compatibility"
description: "The applications tested so far, installed from their own installers."
---
Installer-based applications below were tested with the vendor's own installer in a fresh prefix; portable programs were launched directly. The table records which stages completed. Each stage that works earns 25 points: installation, start, main window, and a real workflow where one has been automated.

## Applications

| Application | Install | Start | Window | Workflow | Score |
| --- | --- | --- | --- | --- | --- |
| Notepad++ 8.7.1 (NSIS) | Yes | Yes | Yes | Editing | 100% |
| 7-Zip 24.09 (EXE installer) | Yes | Yes | Yes | Not automated yet | 75% |
| 7-Zip 24.09 (MSI) | Yes | Yes | Yes | Not automated yet | 75% |
| Audacity 3.6.4 (Inno Setup) | Yes | Yes | Yes | Not automated yet | 75% |
| KeePass 2.57 (Inno Setup, fresh prefix without .NET) | Yes | Yes | No (.NET missing) | Not automated yet | 50% |
| VLC 3.0.21 (NSIS) | Yes | No | No | Not automated yet | 25% |
| ClassiCube 1.3.8 | Portable | Yes | Yes | Singleplayer | 75% |
| Minesweeper | Portable | Yes | Yes | Gameplay | 75% |

Measured on October 23, 2026. **Tested Raven revision: not recorded for this table.** These entries remain provisional until the application results are tied to a source revision and retained run output; they must not be attributed to the older CTest audit. KeePass needs .NET Framework, which was absent from the fresh prefixes used for this matrix, so that window check stops at the missing runtime. VLC installs and its start-up is being worked on.

The Notepad++ workflow saves a file, closes and reopens it, appends to it, checks it was kept, copies text through the clipboard and switches theme.

### KeePass with .NET installed

An earlier run of KeePass 2.61 with .NET Framework 4.8 installed reached the main window and the update-check dialog. This is a separate version and prefix configuration from the fresh-prefix row above. A password database workflow has not been automated, and that earlier result has not been rerun on the current Raven revision.

## Frameworks and redistributables

These are installed with their official installers and tested on their own:

- .NET Framework 4.8: installation, console programs, WinForms and WPF windows.
- .NET Framework 3.5: enabled from its package as Windows does, with CLR 2.0 programs.
- Visual C++ 2005 to 2022, x86 and x64: each alone, all together in both orders, reinstalled, and old over new.
- DirectX June 2010, XNA Framework 4.0 and OpenAL.
- Windows Installer packages with custom actions and rollback, and side-by-side assemblies from WinSxS.
- 32 and 64-bit programs throughout.

## Try your own

Use a fresh prefix, run the installer, then start the program. If something fails, [troubleshooting](/docs/troubleshooting/) lists what to include in a report; the application version and the exact command are what matter most.
