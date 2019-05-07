import * as assert from 'assert';

import * as parser from '../src/index';
import { Failed, Succeeded } from '../src/errorable';
import { Dictionary } from '../src/dictionary';

const KUBECTL_SAMPLE_GET_RESULT =
`
NAME     FOO      BAR
foo      true     false
barbar   false    twice
`.trim();

describe('asTableLines', () => {
    it('should report failure if kubectl failed to run', () => {
        const result = parser.asTableLines(undefined);
        assert.equal(false, result.succeeded);
        assert.equal((<Failed>result).reason, 'failed-to-run');
    });
    it('should report failure and stderr if kubectl exited with non-zero code', () => {
        const result = parser.asTableLines({ code: 1, stdout: '', stderr: 'oh noes' });
        assert.equal(false, result.succeeded);
        assert.equal((<Failed>result).reason, 'kubectl-error');
        assert.equal((<Failed>result).error, 'oh noes');
    });
    it('should report nothing if kubectl exited with no output', () => {
        const result = parser.asTableLines({ code: 0, stdout: '', stderr: '' });
        assert.equal(true, result.succeeded);
        const tableLines = (<Succeeded<parser.TableLines>>result).result;
        assert.equal(tableLines.header, '');
        assert.equal(tableLines.body.length, 0);
    });
    it('should report nothing if kubectl exited with no resources found', () => {
        const result = parser.asTableLines({ code: 0, stdout: '', stderr: 'No resources found.' });
        assert.equal(true, result.succeeded);
        const tableLines = (<Succeeded<parser.TableLines>>result).result;
        assert.equal(tableLines.header, '');
        assert.equal(tableLines.body.length, 0);
    });
    it('should report lines if kubectl printed any', () => {
        const result = parser.asTableLines({ code: 0, stdout: KUBECTL_SAMPLE_GET_RESULT, stderr: '' });
        assert.equal(true, result.succeeded);
        const tableLines = (<Succeeded<parser.TableLines>>result).result;
        assert.equal(tableLines.header, 'NAME     FOO      BAR');
        assert.equal(tableLines.body.length, 2);
        assert.equal(tableLines.body[0], 'foo      true     false');
        assert.equal(tableLines.body[1], 'barbar   false    twice');
    });
});

describe('parseTabular', () => {
    it('should report failure if kubectl failed to run', () => {
        const result = parser.parseTabular(undefined);
        assert.equal(false, result.succeeded);
        assert.equal((<Failed>result).reason, 'failed-to-run');
    });
    it('should report failure and stderr if kubectl exited with non-zero code', () => {
        const result = parser.parseTabular({ code: 1, stdout: '', stderr: 'oh noes' });
        assert.equal(false, result.succeeded);
        assert.equal((<Failed>result).reason, 'kubectl-error');
        assert.equal((<Failed>result).error, 'oh noes');
    });
    it('should report nothing if kubectl exited with no output', () => {
        const result = parser.parseTabular({ code: 0, stdout: '', stderr: '' });
        assert.equal(true, result.succeeded);
        const objects = (<Succeeded<Dictionary<string>[]>>result).result;
        assert.equal(objects.length, 0);
    });
    it('should report nothing if kubectl exited with no resources found', () => {
        const result = parser.parseTabular({ code: 0, stdout: '', stderr: 'No resources found.' });
        assert.equal(true, result.succeeded);
        const objects = (<Succeeded<Dictionary<string>[]>>result).result;
        assert.equal(objects.length, 0);
    });
    it('should parse lines if kubectl printed any', () => {
        const result = parser.parseTabular({ code: 0, stdout: KUBECTL_SAMPLE_GET_RESULT, stderr: '' });
        assert.equal(true, result.succeeded);
        const objects = (<Succeeded<Dictionary<string>[]>>result).result;
        assert.equal(objects.length, 2);
        assert.equal(objects[0].name, 'foo');
        assert.equal(objects[0].foo, 'true');
        assert.equal(objects[0].bar, 'false');
        assert.equal(objects[1].name, 'barbar');
        assert.equal(objects[1].foo, 'false');
        assert.equal(objects[1].bar, 'twice');
    });
});
