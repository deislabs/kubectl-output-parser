/**
 * Represents objects which can have arbitrary property names but whose
 * properties must all be of the specified type.  This is equivalent
 * to the TypeScript `{ [key: string]: T }` type.
 */
export type Dictionary<T> = {
    [key: string]: T
};

export module Dictionary {
    /**
     * Returns a new, empty Dictionary<T>.
     */
    export function of<T>(): Dictionary<T> {
        return {};
    }
}
