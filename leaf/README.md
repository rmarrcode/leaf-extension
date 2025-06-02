# Leaf - Remote Jupyter Notebook Extension

This VS Code extension allows you to run Jupyter notebooks on remote servers via SSH. It integrates with VS Code's Jupyter extension to provide a seamless experience for running notebooks on remote machines.

## Features

- Configure multiple remote servers for Jupyter execution
- Secure SSH connection using private key authentication
- Seamless integration with VS Code's Jupyter interface
- Support for Python kernels on remote servers

## Prerequisites

- VS Code with Jupyter extension installed
- Python and Jupyter installed on remote servers
- SSH access to remote servers
- SSH private key for authentication

## Installation

1. Install the extension from the VS Code marketplace
2. Install required system dependencies:
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install libssh-dev
   
   # On macOS
   brew install libssh
   ```

## Configuration

1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run "Configure Remote Server" command
3. Enter the following information:
   - Server name (for display purposes)
   - SSH host
   - SSH port (default: 22)
   - SSH username
   - Path to SSH private key file

## Usage

1. Open a Jupyter notebook in VS Code
2. Click the kernel selector in the top right corner
3. Select a remote server from the list
4. Run notebook cells as usual - they will execute on the remote server

## Development

### Building from Source

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the native module:
   ```bash
   npm run build:native
   ```
4. Compile TypeScript:
   ```bash
   npm run compile
   ```

### Debugging

1. Open the project in VS Code
2. Press F5 to start debugging
3. A new VS Code window will open with the extension loaded

## Requirements

- VS Code 1.100.0 or higher
- Node.js 16.x or higher
- Python 3.x on remote servers
- Jupyter installed on remote servers

## Known Issues

- Currently only supports Python kernels
- Requires manual installation of Jupyter on remote servers
- SSH key must be in a supported format (RSA, ECDSA, or Ed25519)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
