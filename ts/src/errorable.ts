/**
 * Represents a successful result of a function on kubectl output - that is, the function
 * successfully computed a value.
 */
export interface Succeeded<T> {
    /**
     * Identifies this as a successful result.
     */
    readonly succeeded: true;
    /**
     * The result value of the function.
     */
    readonly result: T;
}

/**
 * Represents a failed result of a function on kubectl output - that is, the function was
 * unable to compute a value, and this object describes why.
 */
export interface Failed {
    /**
     * Identifies this as a failed result.
     */
    readonly succeeded: false;
    /**
     * The reason for the failure.  This is a programmatic identifier which you
     * can use to create a meaningful error message.  Values are:
     *
     * 'failed-to-run': failed because the kubectl process was not created
     * 'kubectl-error': failed because kubectl encountered an error (returned a non-zero exit code)
     * 'failed-to-parse': failed because it could not parse kubectl's standard output
     */
    readonly reason: 'failed-to-run' | 'kubectl-error' | 'failed-to-parse';
    /**
     * If reason is 'kubectl-error', contains the stderr from kubectl.  Otherwise,
     * contains a default message for the reason.
     */
    readonly error: string;
}

/**
 * Represents the result of trying to parse kubectl output - success or failure.
 */
export type Errorable<T> = Succeeded<T> | Failed;

/**
 * Checks if an Errorable represents a successful parse.  In TypeScript, this is
 * a type guard, and you may access the .result property after calling this.
 * @param e The Errorable to be checked.
 * @returns Whether the Errorable represents a successful parse.
 */
export function succeeded<T>(e: Errorable<T>): e is Succeeded<T> {
    return e.succeeded;
}

/**
 * Checks if an Errorable represents a fauked parse.  In TypeScript, this is
 * a type guard, and you may access the .reason and .error properties after calling this.
 * @param e The Errorable to be checked.
 * @returns Whether the Errorable represents a failed parse.
 */
export function failed<T>(e: Errorable<T>): e is Failed {
    return !e.succeeded;
}
