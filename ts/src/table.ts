import { Dictionary } from "./dictionary";
import { KubectlOutput } from ".";
import { Errorable, failed } from "./errorable";

const KUBECTL_OUTPUT_COLUMN_SEPARATOR = /\s+/g;

export interface TableLines {
    readonly header: string;
    readonly body: string[];
}

export function asHeaderedLines(output: KubectlOutput): Errorable<TableLines> {
    if (!output) {
        return { succeeded: false, reason: 'failed-to-run', error: 'Unable to run kubectl' };
    }

    if (output.code === 0) {
        const lines = output.stdout.split('\n');
        if (lines.length === 0) {
            return { succeeded: true, result: { header: '', body: [] } };
        }
        const header = lines.shift()!;  // safe because we have dealt with the length === 0 case
        const body = lines.filter((l) => l.length > 0);
        return { succeeded: true, result: { header, body } };
    }

    return { succeeded: false, reason: 'kubectl-error', error: output.stderr };
}

export function parseHeaderedLines(output: KubectlOutput): Errorable<Dictionary<string>[]> {
    const table = asHeaderedLines(output);
    if (failed(table)) {
        return table;
    }

    const parsed = parseTable(table.result, KUBECTL_OUTPUT_COLUMN_SEPARATOR);
    return { succeeded: true, result: parsed };
}

export function parseTable(table: TableLines, columnSeparator: RegExp): Dictionary<string>[] {
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
