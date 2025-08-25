# Apple Music Desktop for Linux &nbsp;<img src="./src/extra/Logo.png" width="48">

A native desktop application for Linux that allows you to access Apple Music from your desktop using Electron and TypeScript.

## Features

- **Native webview**: Access Apple Music directly from the application
- **Linux support**: Optimized for Linux systems
- **TypeScript**: Fully typed and maintainable code

## Installation

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn or bun
- Linux system (tested on Ubuntu, Debian, Arch)

### Installation steps

1. **Clone the repository**
   ```bash
   git clone <your-repository>
   cd apple-music-desktop-linux
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   yarn install
   # or
   npm install
   ```

3. **Build the project**
   ```bash
   bun run build
   ```

4. **Run the application**
   ```bash
   bun start
   ```

## Available scripts

- `bun run build` - Build the TypeScript project
- `bun run watch` - Build in watch mode
- `bun start` - Build and run the application
- `bun run dev` - Development mode with auto-reload
- `bun run package` - Package the application for distribution
- `bun run dist` - Create the final distribution
- `bun run fix-sandbox` - Fix Electron sandbox permissions

### Adding functionality

The `src/renderer.ts` file contains all the client-side logic. You can add:

- New controls
- Custom events
- External API integration

## Project structure

```
src/
├── main.ts          # Main Electron process
├── preload.ts       # Secure preload script
├── renderer.ts      # Client-side logic
├── index.html       # Main interface
└── styles.css       # Application styles
```

## Development configuration

### TypeScript

The project uses TypeScript 5.0+ with strict configuration. The configuration is in `tsconfig.json`.

### Electron

- Version: 28.0+
- Security configuration enabled
- Webview support enabled

### Build

- Compilation to JavaScript ES2020
- Source map generation
- Type declarations

## Packaging

To create a distributable package:

```bash
bun run package
```

This will create an AppImage file in the `dist-electron/` folder.

## Troubleshooting

### The application doesn't start

1. Verify that Node.js is installed correctly
2. Run `bun install` to install dependencies
3. Verify that the build is successful with `bun run build`

### The webview doesn't load

1. Check your internet connection
2. Make sure Apple Music is available in your region
3. Check the developer console for errors

### Linux permission issues

If you have permission problems when running:

```bash
chmod +x dist-electron/*.AppImage
```

### Electron sandbox permissions

If you encounter sandbox permission issues:

```bash
bun run fix-sandbox
```

## Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is under the GPL-3.0 License. See the `LICENSE` file for more details.

## Acknowledgments

- Electron team for the framework
- Apple for Apple Music
- Open source developer community

## Support

If you have problems or questions:

1. Check existing issues
2. Create a new issue with problem details
3. Include your system information and steps to reproduce

---

**Note**: This application is not officially affiliated with Apple Inc. It's an open source project for the Linux community.
