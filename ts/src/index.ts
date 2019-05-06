export interface ShellResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}

export type KubectlOutput = ShellResult | undefined;

export * from './dictionary';
export * from './errorable';
export { asTableLines, parseTabular, parseTableLines, TableLines } from './table';
