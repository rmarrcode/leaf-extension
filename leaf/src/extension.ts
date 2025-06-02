// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Client } from 'ssh2';
import * as nodePty from 'node-pty';

interface RemoteServer {
	name: string;
	host: string;
	port: number;
	username: string;
	privateKeyPath: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('=== LEAF EXTENSION ACTIVATED ===');
	vscode.window.showInformationMessage('Leaf extension has been activated!', { modal: true });

	// Register the hello world command
	let helloWorldCommand = vscode.commands.registerCommand('leaf.helloWorld', () => {
		console.log('=== HELLO WORLD COMMAND TRIGGERED ===');
		vscode.window.showInformationMessage('Hello World from Leaf!');
	});

	// Register the configure server command
	let configureServerCommand = vscode.commands.registerCommand('leaf.configureServer', async () => {
		console.log('=== CONFIGURE SERVER COMMAND TRIGGERED ===');
		const serverName = await vscode.window.showInputBox({
			prompt: 'Enter server name',
			placeHolder: 'My Remote Server'
		});

		if (!serverName) return;

		const host = await vscode.window.showInputBox({
			prompt: 'Enter SSH host',
			placeHolder: 'example.com'
		});

		if (!host) return;

		const portStr = await vscode.window.showInputBox({
			prompt: 'Enter SSH port',
			placeHolder: '22'
		});

		if (!portStr) return;
		const port = parseInt(portStr);

		const username = await vscode.window.showInputBox({
			prompt: 'Enter SSH username',
			placeHolder: 'user'
		});

		if (!username) return;

		const privateKeyPath = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			filters: {
				'Private Keys': ['pem', 'key']
			}
		});

		if (!privateKeyPath || privateKeyPath.length === 0) return;

		const config = vscode.workspace.getConfiguration('leaf');
		const servers = config.get<RemoteServer[]>('remoteServers') || [];
		
		servers.push({
			name: serverName,
			host,
			port,
			username,
			privateKeyPath: privateKeyPath[0].fsPath
		});

		await config.update('remoteServers', servers, true);
		vscode.window.showInformationMessage(`Server ${serverName} configured successfully`);
	});

	// Register Jupyter kernel provider
	console.log('=== REGISTERING KERNEL PROVIDER ===');
	const kernelProvider = vscode.extensions.getExtension('ms-toolsai.jupyter')?.exports.registerKernelProvider({
		viewType: 'jupyter-notebook',
		onDidChangeKernels: new vscode.EventEmitter<void>().event
	}, {
		provideKernels: async (document: vscode.NotebookDocument) => {
			// Debug message when kernel selector is opened
			console.log('=== KERNEL SELECTOR OPENED ===');
			vscode.window.showInformationMessage('Kernel selector opened!', { modal: true });

			const config = vscode.workspace.getConfiguration('leaf');
			const servers = config.get<RemoteServer[]>('remoteServers') || [];
			
			console.log('Available servers:', JSON.stringify(servers, null, 2));

			const kernels = servers.map(server => ({
				id: `leaf-${server.name}`,
				label: `Remote: ${server.name}`,
				description: `Jupyter on ${server.host}`,
				executeHandler: async (cells: vscode.NotebookCell[]) => {
					console.log(`=== EXECUTING CELLS ON SERVER: ${server.name} ===`);
					for (const cell of cells) {
						await executeCellOnServer(cell, server);
					}
				}
			}));

			console.log('Registered kernels:', JSON.stringify(kernels.map(k => k.label), null, 2));
			return kernels;
		}
	});

	// Add all commands to subscriptions
	context.subscriptions.push(helloWorldCommand, configureServerCommand, kernelProvider);
}

async function executeCellOnServer(cell: vscode.NotebookCell, server: RemoteServer): Promise<void> {
	const client = new Client();
	
	return new Promise((resolve, reject) => {
		client.on('ready', () => {
			// Start Jupyter kernel on remote server
			const command = `jupyter kernel --kernel=python3`;
			client.exec(command, (err: Error | null, stream: any) => {
				if (err) {
					reject(err);
					return;
				}

				// Execute the cell content
				const cellCommand = `echo '${cell.document.getText()}' | jupyter console --existing`;
				client.exec(cellCommand, (err: Error | null, stream: any) => {
					if (err) {
						reject(err);
						return;
					}

					stream.on('data', (data: Buffer) => {
						// Update cell output
						const output = data.toString();
						const outputItem = new vscode.NotebookCellOutput([
							new vscode.NotebookCellOutputItem(
								Buffer.from(output),
								'text/plain'
							)
						]);
						const edit = new vscode.NotebookEdit(new vscode.NotebookRange(cell.index, cell.index + 1), [{
							kind: vscode.NotebookCellKind.Code,
							languageId: 'python',
							value: cell.document.getText(),
							outputs: [outputItem]
						}]);
						const workspaceEdit = new vscode.WorkspaceEdit();
						workspaceEdit.set(cell.document.uri, [edit]);
						vscode.workspace.applyEdit(workspaceEdit).then(() => {
							client.end();
							resolve();
						});
					});

					stream.on('close', () => {
						client.end();
						resolve();
					});
				});
			});
		});

		client.on('error', (err: Error) => {
			reject(err);
		});

		client.connect({
			host: server.host,
			port: server.port,
			username: server.username,
			privateKey: fs.readFileSync(server.privateKeyPath)
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('Leaf extension is now deactivated');
}
