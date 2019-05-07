import { Dictionary } from "./dictionary";
import { KubectlOutput } from ".";
import { Errorable, failed } from "./errorable";

const KUBECTL_OUTPUT_COLUMN_SEPARATOR = /\s+/g;

/**
 * Provides a line-oriented view of tabular kubectl output.
 */
export interface TableLines {
    readonly header: string;
    readonly body: string[];
}

/**
 * Parses tabular kubectl output into an array of objects.  Each non-header row
 * is mapped to an object in the output, and each object has a property per column,
 * named as the lower-cased column header.
 * @param output The result of invoking kubectl via the shell.
 * @returns If kubectl ran successfully and produced tabular output, a success value
 * containing an array of objects for the non-header rows.  If kubectl did not run
 * successfully, a failure value.
 */
export function parseTabular(output: KubectlOutput): Errorable<Dictionary<string>[]> {
    const table = asTableLines(output);
    if (failed(table)) {
        return table;
    }

    const parsed = parseTableLines(table.result, KUBECTL_OUTPUT_COLUMN_SEPARATOR);
    return { succeeded: true, result: parsed };
}

/**
 * Parses tabular kubectl output into an array of lines.  The first row is mapped
 * as a header, and the remaining rows as a body array.
 * @param output The result of invoking kubectl via the shell.
 * @returns If kubectl ran successfully and produced tabular output, a success value
 * containing an object with header (string) and body (array of string) properties.
 * If kubectl ran successfully but produced no output, header is the empty string and
 * body the empty array. If kubectl did not run successfully, a failure value.
 */
export function asTableLines(output: KubectlOutput): Errorable<TableLines> {
    if (!output) {
        return { succeeded: false, reason: 'failed-to-run', error: 'Unable to run kubectl' };
    }

    if (output.code === 0) {
        const lines = output.stdout.split('\n');
        const header = lines.shift();
        if (!header) {
            return { succeeded: true, result: { header: '', body: [] } };
        }
        const body = lines.filter((l) => l.length > 0);
        return { succeeded: true, result: { header, body } };
    }

    return { succeeded: false, reason: 'kubectl-error', error: output.stderr };
}

function parseTableLines(table: TableLines, columnSeparator: RegExp): Dictionary<string>[] {
    if (table.header.length === 0 || table.body.length === 0) {
        return [];
    }
    const columnHeaders = table.header.toLowerCase().replace(columnSeparator, '|').split('|');
    return table.body.map((line) => parseLine(line, columnHeaders, columnSeparator));
}

function parseLine(line: string, columnHeaders: string[], columnSeparator: RegExp) {
    const lineInfoObject = Dictionary.of<string>();
    const bits = line.replace(columnSeparator, '|').split('|');
    bits.forEach((columnValue, index) => {
        lineInfoObject[columnHeaders[index].trim()] = columnValue.trim();
    });
    return lineInfoObject;
}
