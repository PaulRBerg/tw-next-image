## Contributing

### Prerequisites

- [Node.js](https://nodejs.org) (v20+)
- [Bun](https://bun.sh) (package manager)
- [Just](https://github.com/casey/just) (command runner)
- [Ni](https://github.com/antfu-collective/ni) (package manager resolver)

### Setup

```bash
git clone https://github.com/PaulRBerg/tw-next-image.git
cd tw-next-image
bun install
bun setup
```

### Available Commands

```bash
just --list                 # Show all available commands
just build                  # Build the TypeScript package
just test                   # Run test suite
```

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `just test` to verify tests pass
5. Run `na biome lint` to check for lint errors
6. Submit a pull request
