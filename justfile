# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"

# ---------------------------------------------------------------------------- #
#                                    RECIPES                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Build the project
@build:
    echo "🧹 Cleaning dist..."
    just clean
    echo "🔨 Compiling TypeScript..."
    just tsc-build
    echo "📦 Packing tarball..."
    npm pack --quiet
    echo "✅ Build complete"
alias b := build

# Clean the dist directory
@clean:
    nlx del-cli dist
    echo "Cleaned build files"

# Create an npm tarball (runs npm lifecycle scripts)
@pack:
    npm pack --silent

# Run tests
@test *args:
    na vitest run {{args}}
alias t := test

# Run tests with UI
@test-ui *args:
    na vitest --ui {{args}}
alias tui := test-ui

# Build with TypeScript CLI
@tsc-build:
    na tsc -p tsconfig.build.json

