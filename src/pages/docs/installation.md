---
layout: ../../layouts/Docs.astro
title: "Installation"
description: "Build Raven from source on Linux x86_64."
---
Raven is built from source for now. Prebuilt releases are on the way.

## Requirements

| Requirement | Used for |
| --- | --- |
| Linux x86_64 | The host Raven runs on |
| CMake 3.20 or later | Build configuration |
| A C++20 compiler | The runtime |
| Python 3.11 or later | Provisioning and test scripts |
| Git and an internet connection | The source and the pinned test downloads |
| x86_64 and i686 MinGW-w64 | Windows test programs in both widths |

Package names change from one distribution to another; install the compiler and development headers your distribution provides. Both MinGW-w64 toolchains are needed, even on a 64-bit host, because the tests cover 32 and 64-bit programs.

## Get the source

```sh
git clone https://github.com/mirkobrombin/raven.git
cd raven
```

## Build

```sh
cmake -S . -B build -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build build -j2
```

The first configuration downloads pinned releases of Notepad++, SQLite and BusyBox for the tests and checks their SHA-256 hashes. The runtime ends up in `build/native/raven`; there is nothing to install system-wide, and the rest of this documentation uses that path.

## Desktop and graphics

Graphical programs need Wayland and the development files of the graphics stack: Wayland, xkbcommon, pixman, FreeType and Vulkan. The tested setup adds libpng 1.6.59, a font-enabled CPU build of Skia, Liberation fonts, DXVK and vkd3d-proton.

The basic build does not include the guest controls, installer libraries or text-layout component. Prepare those before following the first-application guide. Their build tools must be on `PATH`: Clang, `widl`, Bison, `patch`, and the MinGW-w64 compilers and resource compilers for both architectures.

Run these commands from the Raven source directory:

```sh
export RAVEN_COMPONENTS_DIR="$HOME/.local/share/raven-components"
python3 scripts/provision-controls.py --output "$RAVEN_COMPONENTS_DIR/controls64" --arch x64
python3 scripts/provision-controls.py --output "$RAVEN_COMPONENTS_DIR/controls32" --arch x86
python3 scripts/provision-installer.py --output "$RAVEN_COMPONENTS_DIR/installer64" --arch x64
python3 scripts/provision-installer.py --output "$RAVEN_COMPONENTS_DIR/installer32" --arch x86
python3 scripts/provision-text.py --output "$RAVEN_COMPONENTS_DIR/text"
python3 scripts/provision-rtl.py --output "$RAVEN_COMPONENTS_DIR/rtl"
python3 scripts/provision-roots.py --output "$RAVEN_COMPONENTS_DIR/roots"
```

Then configure their paths and rebuild. The build copies the selected guest components beside the runtime, with the 32-bit components in its `x86` directory:

```sh
cmake -S . -B build -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DRAVEN_CONTROLS_COMPONENT_DIR="$RAVEN_COMPONENTS_DIR/controls64" \
  -DRAVEN_CONTROLS32_COMPONENT_DIR="$RAVEN_COMPONENTS_DIR/controls32" \
  -DRAVEN_INSTALLER_COMPONENT_DIR="$RAVEN_COMPONENTS_DIR/installer64" \
  -DRAVEN_INSTALLER32_COMPONENT_DIR="$RAVEN_COMPONENTS_DIR/installer32" \
  -DRAVEN_TEXT_COMPONENT_PATH="$RAVEN_COMPONENTS_DIR/text/raven-text.dll" \
  -DRAVEN_RTL_COMPONENT_PATH="$RAVEN_COMPONENTS_DIR/rtl/raven-rtl.dll" \
  -DRAVEN_ROOT_CERTIFICATE_DIRECTORY="$RAVEN_COMPONENTS_DIR/roots"
cmake --build build -j2
```

Skia and its qualified fonts are separate inputs: these scripts do not build or download them. To enable that text-rendering path, supply all three of `RAVEN_SKIA_SOURCE`, `RAVEN_SKIA_LIBRARY` and `RAVEN_FONT_DIRECTORY` in the same CMake configuration. The library must be a font-enabled CPU build compatible with the supplied source. This remains a manual part of the setup.

Graphics DLLs and the pinned libpng build have their own provisioning scripts:

```sh
python3 scripts/provision-graphics.py --help
python3 scripts/provision-libpng.py --help
```

The scripts check their pinned inputs. `provision-libpng.py` prints the `PNG_LIBRARY_RELEASE` and `PNG_PNG_INCLUDE_DIR` arguments to add to CMake. The [graphics page](/docs/graphics/#get-the-components) covers DXVK and vkd3d-proton, including the runtime DLL path needed when launching an application. CMake enables what it finds; omitted components leave their features and tests unavailable.

## Component variables

| CMake variable | Points to |
| --- | --- |
| `RAVEN_DXVK_PE64_DIR` | 64-bit DXVK DLLs |
| `RAVEN_DXVK_PE32_DIR` | 32-bit DXVK DLLs |
| `RAVEN_VKD3D_PE64_DIR` | 64-bit vkd3d-proton DLLs |
| `RAVEN_SKIA_SOURCE` | The pinned Skia source |
| `RAVEN_SKIA_LIBRARY` | The font-enabled CPU Skia library |
| `RAVEN_FONT_DIRECTORY` | The Liberation fonts |
| `RAVEN_ROOT_CERTIFICATE_DIRECTORY` | Certificates from `provision-roots.py` |
| `RAVEN_INSTALLER_COMPONENT_DIR` | 64-bit installer components |
| `RAVEN_INSTALLER32_COMPONENT_DIR` | 32-bit installer components |
| `RAVEN_CONTROLS_COMPONENT_DIR` | 64-bit common controls |
| `RAVEN_CONTROLS32_COMPONENT_DIR` | 32-bit common controls |
| `RAVEN_TEXT_COMPONENT_PATH` | The text layout component |
| `RAVEN_RTL_COMPONENT_PATH` | The RTL component |

The Skia and font variables go together: CMake requires the source headers and library to exist and checks the font hashes. It does not verify a Skia source revision or library hash.

## Run the tests

```sh
ctest --test-dir build --output-on-failure -j1
```

The October 23, 2026 audit recorded 276 passes and eight failures out of 284 tests. Its publication reference was `21fa2aa2284c8cce9f3b9ae811ee65fcd5134fbf`; it used `RelWithDebInfo`, sanitizers disabled, the provisioned graphics, text and installer components, supplied test applications, qualified font-hash cache overrides and serial CTest execution. The [historical result and tested binary hash](/docs/development/#historical-test-result) describe the configuration and the limits of its revision record. This is not a result for the current build: run CTest on your own checkout.

## Update

Pull the new source, then run the configure and build commands again. Take a [prefix snapshot](/docs/prefixes/) before trying a new build on an application you care about.

Next: [your first application](/docs/quick-start/).
