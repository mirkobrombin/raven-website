---
layout: ../../layouts/Docs.astro
title: "Graphics and desktop"
description: "Windows through Wayland, Direct3D through Vulkan."
---
Raven draws application windows on your Wayland desktop and runs Direct3D on Vulkan: DXVK for Direct3D 8 to 11, vkd3d-proton for Direct3D 12.

## Open a window

```sh
build/native/raven --run-process --execution=native \
  --timeout-ms=600000 --desktop=wayland /path/to/application.exe
```

Run it from a terminal in your desktop session, so `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` point at it.

## Direct3D coverage

| API | Tested |
| --- | --- |
| Direct3D 8 and 9 | Presentation, including 32-bit programs |
| Direct3D 11 | Drawing, deferred contexts, every shader stage, textures, compute, MSAA and presentation through DXVK |
| Direct3D 12 | Devices, drawing, bundles, compute, textures, shader stages and ray tracing through vkd3d-proton |

## Get the components

The pinned DXVK and vkd3d-proton releases are listed in `native/graphics/backends.json`. The provisioning script downloads them, checks their hashes and extracts the DLLs:

```sh
python3 scripts/provision-graphics.py --destination "$HOME/.local/share/raven-components/graphics"
```

To enable the corresponding graphics tests, point CMake at them and rebuild:

```sh
cmake -S . -B build -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DRAVEN_DXVK_PE64_DIR="$HOME/.local/share/raven-components/graphics/dxvk/pe64" \
  -DRAVEN_DXVK_PE32_DIR="$HOME/.local/share/raven-components/graphics/dxvk/pe32" \
  -DRAVEN_VKD3D_PE64_DIR="$HOME/.local/share/raven-components/graphics/vkd3d-proton/pe64"
cmake --build build -j2
```

These CMake variables select DLLs for the tests. They do not install DXVK beside the runtime or set the DLL search path for applications.

For a 64-bit Direct3D 8, 9 or 11 application, set the runtime path in the terminal where you launch it:

```sh
export RAVEN_D3D_DIRECTORY="$HOME/.local/share/raven-components/graphics/dxvk/pe64"
build/native/raven --run-process --execution=native \
  --timeout-ms=600000 --desktop=wayland /path/to/application.exe
```

Use `graphics/dxvk/pe32` for a 32-bit application. The DLL architecture must match the program. `RAVEN_D3D_DIRECTORY` covers DXVK libraries; it does not select vkd3d-proton's Direct3D 12 DLLs. Those must be available to the application's DLL loader, for example beside its executable, together with the matching DXVK `dxgi.dll`.

These are the Windows-side DLLs; your Vulkan driver stays the one your distribution ships.

## Libraries a program ships

Graphics wrappers such as DXVK, dgVoodoo and ReShade, and ASI or plugin loaders, put their own copy of a system library beside the program's executable. For these names Raven loads the program's copy instead of its own:

| Library | Typical use |
| --- | --- |
| `d3d8.dll`, `d3d9.dll`, `d3d10core.dll`, `d3d11.dll`, `dxgi.dll`, `ddraw.dll` | Direct3D and DirectDraw wrappers, post-processing injectors |
| `dinput.dll`, `dinput8.dll` | Input wrappers and ASI loaders |
| `xinput1_3.dll`, `xinput1_4.dll` | Controller remappers |
| `winmm.dll`, `version.dll` | ASI and plugin loaders |

The copy must have the program's architecture: a 32-bit DLL for a 32-bit program. When it forwards to the system library, through `C:\Windows\System32\<name>`, `C:\Windows\SysWOW64\<name>` or a load restricted to the system directory, it reaches Raven's own implementation.

Any other system library a program ships, such as its own `dbghelp.dll` or `winhttp.dll`, is ignored and Raven's implementation answers. Copies an installer drops into the prefix's `System32` or `SysWOW64` folders are ignored too.

To load the program's copy of every system library it ships, set `RAVEN_PREFER_LOCAL_DLLS=1`:

```sh
RAVEN_PREFER_LOCAL_DLLS=1 build/native/raven --run-process --execution=native \
  --desktop=wayland /path/to/application.exe
```

The core libraries stay Raven's even then: `ntdll`, `kernel32`, `kernelbase`, `user32`, `gdi32`, `comctl32`, `advapi32`, `msvcrt`, `ucrtbase`, `ole32`, `oleaut32`, `combase`, `rpcrt4`, `shell32`, `shlwapi`, `setupapi` and `comdlg32`.

## Text

Text goes through FreeType and a CPU build of Skia, with the Liberation fonts standing in for Arial, Times New Roman and Courier New, and your host fonts as fallback. If you add fonts after a prefix was created, open a fresh prefix to pick them up.

## Performance

The [benchmarks page](/docs/benchmarks/) reports preliminary comparisons with Wine 11 and Soda on start-up and a Direct3D 11 frame test, with a ClassiCube comparison under review. Those measurements use Mesa's software Vulkan driver. Hardware GPU performance has not been established by these benchmarks.
