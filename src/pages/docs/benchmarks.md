---
layout: ../../layouts/Docs.astro
title: "Benchmarks"
description: "Comparisons with Wine and Soda, the controlled ClassiCube results and reproduction commands."
---
Raven is compared here with Wine 11.0 and Soda 11.0-32-experimental, on the same machine and the same programs.

## The machine

| Component | Value |
| --- | --- |
| CPU | Intel Core i7-13700H (14 cores, 20 threads, up to 5.0 GHz); 8 logical CPUs available to the benchmark environment |
| Memory | 31 GiB |
| Kernel | Linux 7.2.11 |
| Userland | Ubuntu 26.04.1 LTS |
| Graphics | Mesa 26.0.8 lavapipe (software Vulkan), two rendering threads |
| Display | labwc 0.9.3, headless, one isolated instance per run |

These results describe this software Vulkan configuration. Hardware GPU performance has not been established by these benchmarks.

## How the runs were made

The charts show reported medians for the workloads below. The supplied CLI runner initialises reference prefixes and copies them for measured trials; the application runner performs an unmeasured warm-up. Other runners have their own prefix setup, so a single prefix rule does not describe the whole suite. A run that did not finish is shown as "did not run", never as zero.

The start-up, application and Direct3D charts retain their earlier measurements. ClassiCube uses the controlled comparison below, with its raw FPS samples and Raven binary SHA-256 in the downloadable data. Results from different workloads were measured in separate sessions.

## Start-up, a database query and Direct3D 11

![Process completion time](/assets/benchmarks/benchmark-cli.svg)

A program that exits at once, a SQLite query over eight million rows, and a Direct3D 11 triangle checked pixel by pixel. Raven starts a process in 0.04 seconds, against 3.7 seconds for Wine 11 and 0.71 for Soda, and finishes the query in 1.6 seconds against 5.3 and 2.3. The Soda Direct3D 11 run did not finish within its 600-second limit. SQLite measures the entire launched command, including process start-up; it does not isolate query computation time.

## Application windows

![Time until the main window appears](/assets/benchmarks/benchmark-apps.svg)

The time from launch to the main window of Notepad++ and of the ClassiCube launcher.

## Direct3D 11 frame rate

![Direct3D 11 presentation rate](/assets/benchmarks/benchmark-frames.svg)

2,000 frames presented at 256 by 256 pixels: 2,392 frames per second on Raven, 1,818 on Wine 11 and 1,683 on Soda.

## ClassiCube

![ClassiCube frame rate](/assets/benchmarks/benchmark-games.svg)

Four alternating rounds on the same machine, with all samples retained:

| Runtime | Median FPS | Samples (FPS) |
| --- | ---: | --- |
| Raven | 71.5 | 72, 73, 54, 71 |
| Wine 11.0 | 63.0 | 65, 68, 61, 61 |
| Soda 11.0-32 exp. | 63.0 | 64, 64, 61, 62 |

Raven uses its default execution mode. The controlled workload uses ClassiCube 1.3.8 built for Direct3D 11, seed 1, a 128 by 64 by 128 world, a 640 by 480 window and view distance 128. It counts frames during seconds 5 through 15 after world load. These results replace the earlier series, whose scene configuration was not verified against its retained samples.

The downloadable data includes these raw FPS samples, the configuration and the measured Raven binary SHA-256. The supplied runner groups trials by runtime; use separate one-trial runs to alternate runtimes.

## Run them yourself

Run these commands from the Raven repository after building the runtime and test fixtures. Replace the absolute input paths with your own files. The scripts use positional arguments, not `--help`.

Use a dedicated work directory: the CLI, frame and game runners delete their `WORKDIR` before starting. Run the scripts one at a time; the graphical runners share compositor socket names. They expect `labwc`, `wlrctl`, the Wine tools and the software Vulkan driver at `/usr/share/vulkan/icd.d/lvp_icd.json`. A different environment needs corresponding runner changes.

```sh
RAVEN="$PWD/build/native/raven"
TESTDATA="$PWD/build/testdata"
DXVK="$HOME/.local/share/raven-components/graphics/dxvk/pe64"
WINE="/absolute/path/to/wine/bin/wine"
WINESERVER="/absolute/path/to/wine/bin/wineserver"
CHROME="/absolute/path/to/Chrome/Application"
CLASSICUBE="/absolute/path/to/ClassiCube.exe"
GAME_EXE="/absolute/path/to/controlled-classicube/ClassiCube.exe"
GAME_DIR="/absolute/path/to/classicube-assets"
BENCH_WORK="$HOME/artifacts/raven-benchmark-runs"
mkdir -p "$BENCH_WORK"

x86_64-w64-mingw32-gcc -nostdlib -Wl,-e,entry \
  -o "$BENCH_WORK/startup.exe" testdata/benchmark/startup.c -lkernel32

python3 scripts/benchmark-wine.py \
  "$RAVEN" "$WINE" "$TESTDATA" "$DXVK" \
  "$BENCH_WORK/startup.exe" "$BENCH_WORK/cli-wine" 3 startup sqlite d3d11

RAVEN_BENCH_WINE="$WINE" RAVEN_BENCH_WINESERVER="$WINESERVER" \
  python3 scripts/benchmark-apps.py \
  "$RAVEN" "$TESTDATA" "$CHROME" "$CLASSICUBE" "$DXVK" \
  "$BENCH_WORK/apps-wine" 3 'notepad++' classicube

python3 scripts/benchmark-frames.py \
  "$RAVEN" "$WINE" "$TESTDATA" "$DXVK" "$BENCH_WORK/frames-wine" 3

python3 scripts/benchmark-classicube.py \
  "$RAVEN" "$WINE" "$GAME_EXE" "$GAME_DIR" "$DXVK" \
  "$BENCH_WORK/classicube-wine" 4
```

`TESTDATA` must contain `sqlite3.exe`, `npp/notepad++.exe`, `d3d11/triangle.exe` and `d3d11/present_rate.exe`. `DXVK` must contain `d3d11.dll`, `dxgi.dll` and `d3d10core.dll`. The application command selects Notepad++ and the ordinary ClassiCube launcher; Chrome's positional directory argument is still required but is not measured by that selection.

For `GAME_EXE`, use ClassiCube source revision `33891a4e7e586941240261bc911312f228be57d3`. Normalise `src/Game.c` and `src/Server.c` to LF, apply Raven's `testdata/classicube/benchmark.patch`, then build in that checkout with:

```sh
make windows CC=x86_64-w64-mingw32-gcc \
  'CFLAGS+=-DCC_GFX_BACKEND=CC_GFX_BACKEND_D3D11 -DCC_BENCH_FPS' -j2
```

Supply the `texpacks` and `audio` directories separately under `GAME_DIR`. The game runner accepts a sample only after a successful exit, positive FPS and a `bench_config.txt` containing `1 128 64 128 640 480`.

To compare with Soda, set `WINE` and `WINESERVER` to its binaries and repeat with new `*-soda` work directories. Keep each `samples.json`, the game configuration records, binary and asset hashes, `git rev-parse HEAD`, Wine/Soda versions and the machine configuration with your results. Never reuse a work directory containing evidence you want to retain.

The [aggregate chart values](/assets/benchmarks/benchmarks.json), including CPU time and memory, are available separately. That aggregate is preliminary and does not replace per-run evidence.
