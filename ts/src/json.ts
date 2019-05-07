import { KubectlOutput, Errorable } from ".";
import { Dictionary } from "./dictionary";

export interface KubernetesList<T> {
    readonly apiVersion: string;
    readonly items: T[];
    readonly kind: "List";
    readonly metadata: Dictionary<string>;
}

export function parseJSON<T>(output: KubectlOutput): Errorable<T> {
    if (!output) {
        return { succeeded: false, reason: 'failed-to-run', error: 'Unable to run kubectl' };
    }

    if (output.code === 0) {
        if (!output.stdout || output.stdout.length === 0) {
            return { succeeded: false, reason: 'failed-to-parse', error: 'Kubectl returned empty JSON' };
        }
        const result = JSON.parse(output.stdout.trim()) as T;
        return { succeeded: true, result: result };
    }

    return { succeeded: false, reason: 'kubectl-error', error: output.stderr };
}

export function parseJSONCollection<T>(output: KubectlOutput): Errorable<KubernetesList<T>> {
    return parseJSON<KubernetesList<T>>(output);
}
