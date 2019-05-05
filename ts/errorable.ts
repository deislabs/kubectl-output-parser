export interface Succeeded<T> {
    readonly succeeded: true;
    readonly result: T;
}

export interface Failed {
    readonly succeeded: false;
    readonly reason: 'failed-to-run' | 'kubectl-error' | 'failed-to-parse';
    readonly error: string;
}

export type Errorable<T> = Succeeded<T> | Failed;

export function succeeded<T>(e: Errorable<T>): e is Succeeded<T> {
    return e.succeeded;
}

export function failed<T>(e: Errorable<T>): e is Failed {
    return !e.succeeded;
}
