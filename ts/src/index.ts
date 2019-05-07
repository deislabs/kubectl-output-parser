/**
 * The result of invoking an external program via the shell.
 */
export interface ShellResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}

/**
 * The result of invoking the kubectl program via the shell.
 * This is undefined if creating the kubectl process failed.
 */
export type KubectlOutput = ShellResult | undefined;

export * from './dictionary';
export * from './errorable';
export { asTableLines, parseTabular, TableLines } from './table';
export { parseJSON, parseJSONCollection, KubernetesList } from './json';
