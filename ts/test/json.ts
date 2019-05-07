import * as assert from 'assert';

import * as parser from '../src/index';
import { Failed, Succeeded } from '../src/errorable';

interface Kubewidget {
    readonly kind: string;
    readonly metadata: {
        readonly name: string;
        readonly namespace?: string;
    };
    readonly spec: {
        readonly count: number;
        readonly isThreaded: boolean;
        readonly model: string;
    };
}

const KUBEWIDGET_JSON = `
{
    "kind": "Widget",
    "metadata": {
        "name": "mywidget",
        "namespace": "myns"
    },
    "spec": {
        "count": 1789,
        "isThreaded": true,
        "model": "KW-3000"
    }
}
`;

const KUBEWIDGETS_COLLECTION_JSON = `
{
    "apiVersion": "fake",
    "kind": "List",
    "items": [
        ${KUBEWIDGET_JSON}
    ],
    "metadata": {}
}
`;

const NO_KUBEWIDGETS_JSON = `
{
    "apiVersion": "fake",
    "kind": "List",
    "items": [],
    "metadata": {}
}
`;

describe('parseJSON', () => {
    it('should report failure if kubectl failed to run', () => {
        const result = parser.parseJSON<Kubewidget>(undefined);
        assert.equal(false, result.succeeded);
        assert.equal((<Failed>result).reason, 'failed-to-run');
    });
    it('should report failure and stderr if kubectl exited with non-zero code', () => {
        const result = parser.parseJSON<Kubewidget>({ code: 1, stdout: '', stderr: 'oh noes' });
        assert.equal(false, result.succeeded);
        assert.equal((<Failed>result).reason, 'kubectl-error');
        assert.equal((<Failed>result).error, 'oh noes');
    });
    it('should report failure if kubectl exited with no output', () => {
        const result = parser.parseJSON<Kubewidget>({ code: 0, stdout: '', stderr: '' });
        assert.equal(false, result.succeeded);
        assert.equal((<Failed>result).reason, 'failed-to-parse');
    });
    it('should report lines if kubectl printed any', () => {
        const result = parser.parseJSON<Kubewidget>({ code: 0, stdout: KUBEWIDGET_JSON, stderr: '' });
        assert.equal(true, result.succeeded);
        const widget = (<Succeeded<Kubewidget>>result).result;
        assert.equal(widget.kind, 'Widget');
        assert.equal(widget.metadata.name, 'mywidget');
        assert.equal(widget.metadata.namespace, 'myns');
        assert.equal(widget.spec.count, 1789);
        assert.equal(widget.spec.isThreaded, true);
        assert.equal(widget.spec.model, 'KW-3000');
    });
});

describe('parseJSONCollection', () => {
    it('should return all the items', () => {
        const result = parser.parseJSONCollection<Kubewidget>({ code: 0, stdout: KUBEWIDGETS_COLLECTION_JSON, stderr: '' });
        assert.equal(true, result.succeeded);
        const widget = (<Succeeded<parser.KubernetesList<Kubewidget>>>result).result;
        assert.equal(widget.kind, 'List');
        assert.equal(widget.items.length, 1);
        assert.equal(widget.items[0].spec.count, 1789);
    });
    it('should return an empty list if no items', () => {
        const result = parser.parseJSONCollection<Kubewidget>({ code: 0, stdout: NO_KUBEWIDGETS_JSON, stderr: '' });
        assert.equal(true, result.succeeded);
        const widget = (<Succeeded<parser.KubernetesList<Kubewidget>>>result).result;
        assert.equal(widget.kind, 'List');
        assert.equal(widget.items.length, 0);
    });
});
