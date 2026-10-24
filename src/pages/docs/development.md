---
layout: ../../layouts/Docs.astro
title: "Development and licenses"
description: "Find your way around the source, run the tests and contribute."
---
Raven is written in C++20 and lives in `native/`. The `cmd/`, `pkg/` and `internal/` folders hold its first implementation, in Go; new work goes into `native/`.

## Source layout

| Path | What it contains |
| --- | --- |
| `native/main.cpp` | The launcher |
| `native/nt` | NT services: processes, threads, objects, files, the registry, prefixes and snapshots |
| `native/cpu` | The supervised guest process |
| `native/graphics` | Vulkan bridge, Wayland presentation and drawing |
| `native/upstream` | Components from other projects, each with its notices |
| `scripts` | Provisioning, test programs, benchmarks and application checks |
| `docs` | Benchmark charts and measurements |

## Build and test

```sh
cmake -S . -B build -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build build -j2
ctest --test-dir build --output-on-failure -j1
```

`ctest --test-dir build -N` lists the tests, and `-R PATTERN` runs a subset. Which tests exist depends on the components your build found.

## Historical test result

On October 23, 2026, the recorded CTest run passed 276 of 284 tests, with eight failures and no skipped tests. This is a historical result, not a claim about the current build.

| Field | Recorded configuration |
| --- | --- |
| Publication revision associated with the audit | `21fa2aa2284c8cce9f3b9ae811ee65fcd5134fbf` |
| Build | `RelWithDebInfo`, `RAVEN_SANITIZERS=OFF`, two build workers |
| Test command | `ctest --test-dir build --output-on-failure -j1` |
| Components | Font-enabled CPU Skia, Liberation fonts with qualified font-hash cache overrides, libpng, Wayland tools, 32/64-bit DXVK, 64-bit vkd3d-proton, installer and common-control components, RTL and certificate roots |
| Additional inputs | .NET Framework 3.5 and 4.8, XNA, Visual C++ redistributables and Minesweeper supplied separately |
| Tested runtime SHA-256 | `8fa0aadace441e65471350de3c0eaf52d3bfa5c3af95b933d154c65b1b0fe197` |

The revision identifies the publication associated with that audit. The retained result does not establish an exact clean-checkout source revision for the tested binary; the font cache overrides were part of the test configuration. Do not use this count as a prediction for another revision or configuration.

The failures were `native_cpu_contracts`, `native_compatible_bitmap_contract`, `native_memory_contract`, `native_d3d12_present_gpu`, `native_d3d12_fullscreen_gpu`, `native_d3d11_present_gpu`, `native_d3d11_fullscreen_gpu` and `native_x86_d3d11_present_gpu`. The last five reported `isolated compositor did not start`; that error alone does not establish a hardware GPU requirement.

## Programs supplied separately

Some tests use software Raven cannot redistribute. Point these variables at your own copies: `RAVEN_MINESWEEPER`, `RAVEN_NETFX_INSTALLER`, `RAVEN_NETFX35_PACKAGE`, `RAVEN_XNA_INSTALLER` and `RAVEN_REDIST_DIRECTORY`; the Go checks also read `RAVEN_NOTEPAD` and `RAVEN_DXBALL`. Tests whose input is missing are skipped.

## Contributing

The most useful contribution is one program that does not work, the command that shows it and what you expected. A small test program that reproduces the same behaviour is even better. For window and drawing changes, include a screenshot.

## Licenses

Raven's own code is under the MIT License. The components in `native/upstream` and the files derived from them keep their own licenses and notices (GPL, LGPL, BSD, libpng, Unicode and Skia), and a build that includes them follows those terms too. The bitmap font from Go Mono carries the Bigelow & Holmes notice. The website font has its license in `/fonts/LICENSE.txt`.
