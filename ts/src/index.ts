export interface ShellResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}

export type KubectlOutput = ShellResult | undefined;

export * from './dictionary';
export * from './errorable';
export { asHeaderedLines, parseHeaderedLines, parseTable, TableLines } from './table';
