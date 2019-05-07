import { KubectlOutput, Errorable } from ".";
import { Dictionary } from "./dictionary";

/**
 * Represents how kubectl -o json formats lists of resources.
 */
export interface KubernetesList<T> {
    /**
     * The Kubernetes API version.
     */
    readonly apiVersion: string;
    /**
     * The contents of the list.
     */
    readonly items: T[];
    /**
     * Identifies this object to the Kubernetes API as a list.
     */
    readonly kind: "List";
    /**
     * Contains additional data about the list.
     */
    readonly metadata: Dictionary<string>;
}

/**
 * Parses JSON kubectl output into an object.
 * @param output The result of invoking kubectl via the shell.
 * @returns If kubectl ran successfully and produced JSON output, a success value
 * containing the deserialised object.  If kubectl did not run
 * successfully, a failure value.
 */
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

/**
 * Parses JSON kubectl output into a Kubernetes list object.  You may use this if your
 * kubectl command requested a list of resources rather than a single resource.
 * @param output The result of invoking kubectl via the shell.
 * @returns If kubectl ran successfully and produced JSON output, a success value
 * containing the deserialised object.  If kubectl did not run
 * successfully, a failure value.
 */
export function parseJSONCollection<T>(output: KubectlOutput): Errorable<KubernetesList<T>> {
    return parseJSON<KubernetesList<T>>(output);
}
