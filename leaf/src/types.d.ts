declare module 'ssh2' {
    export class Client {
        on(event: 'ready', listener: () => void): this;
        on(event: 'error', listener: (err: Error) => void): this;
        connect(config: {
            host: string;
            port: number;
            username: string;
            privateKey: Buffer;
        }): void;
        exec(command: string, callback: (err: Error | null, stream: Stream) => void): void;
        end(): void;
    }

    export interface Stream {
        on(event: 'data', listener: (data: Buffer) => void): this;
        on(event: 'close', listener: () => void): this;
    }
}

declare module 'node-pty' {
    export interface IPty {
        write(data: string): void;
        resize(columns: number, rows: number): void;
        kill(): void;
    }

    export function spawn(
        file: string,
        args: string[],
        options: {
            name?: string;
            cols?: number;
            rows?: number;
            cwd?: string;
            env?: { [key: string]: string };
        }
    ): IPty;
} 