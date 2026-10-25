---
layout: ../../layouts/Docs.astro
title: "Introduction"
description: "Run Windows applications on Linux, and see what Raven does along the way."
---
Raven runs Windows programs on x86_64 Linux. The program's own code runs directly on your CPU, and Raven gives it the Windows it expects underneath: the kernel services, the registry, the file system, windows and input.

## Start here

1. [Build Raven](/docs/installation/) on your machine.
2. [Run your first application](/docs/quick-start/), or its installer.
3. Check the [compatibility results](/docs/compatibility/) to see what has been tested.

## How it works

Raven loads the .exe and its libraries into a supervised guest process. Some Windows functions run directly inside that process, in Raven's guest components or the libraries loaded by the application. They do not all require a trip through the supervisor.

Requests that need supervisor-managed services cross into Raven's runtime outside the guest process. That runtime manages processes, threads, handles, objects, files and registry state, and mediates access to host services. The guest cannot freely issue Linux system calls.

A virtual machine boots a guest operating system. Raven instead implements Windows interfaces through these guest components and supervisor services. Wine also implements Windows interfaces; the distinction here is how Raven divides that work and supervises the guest, rather than whether system libraries exist inside the application's process.

## Prefixes

Each application lives in a **prefix**: a directory with its own `C:` drive, system folders, registry and installed programs. Point `RAVEN_PREFIX` at one to use it. Separate prefixes keep applications from stepping on each other, and every prefix can be [snapshotted and restored](/docs/prefixes/) with one command.

Start with a new Raven prefix rather than reusing a Wine prefix. The [prefix guide](/docs/prefixes/) explains the runtime and stored state, and shows how to launch the [settings panel and installation tools](/docs/prefixes/#built-in-tools) supplied with Raven.

## Where Raven is today

Raven is young and moving fast. The [compatibility page](/docs/compatibility/) lists the applications tested so far, stage by stage, and the [benchmarks](/docs/benchmarks/) show how it compares with Wine. Linux x86_64 is the supported host; macOS is planned.

## More

The [command-line reference](/docs/command-line/) covers every launcher option, [graphics](/docs/graphics/) explains the Wayland and Direct3D path, and [troubleshooting](/docs/troubleshooting/) helps when something does not start.
