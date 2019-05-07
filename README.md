# Kubectl Output Parser

A NPM package containing utility functions for parsing output from the Kubernetes `kubectl` command
line tool.

# Reference

## Table format functions

These functions are for use with `kubectl` commands that return data in tabular format -
that is, of the form:

```
TITLE1    TITLE2       TITLE3
value11   value12      value13
value21   value22      value23
```

where no column header or value contains a space, and columns are separated by one or more spaces.
Examples include the default behaviour of `kubectl get`, for example `kubectl get pods` or
`kubectl get pods -o wide` to get a list of pods.

In all cases:

* The function takes a `KubectlOutput`: that is, either a `ShellResult` (an object with numeric `code`,
`stdout` string and `stderr` string properties), or `undefined`.  `code` and `stderr` are used
for error handling; on the happy path, the function will operate on the `stdout` string.
* The function returns an `Errorable`: that is, an object with a boolean `succeeded` property.  If
`succeeded` is true, the object also has a `result` property containing the result of the function;
if `succeeded` is false, the object has `reason` and `error` properties describing the failure.
* If the input is `undefined`, or has a non-zero `code`, the function returns a _failed_ Errorable.
* The function does not check the format of the provided `stdout`.  You should use it **only** on the output
of `kubectl` commands that return tabular data without spaces or missing values.

### parseTabular

**JavaScript:** `parseTabular(output)`

**TypeScript:** `parseTabular(output: KubectlOutput): Errorable<Dictionary<string>[]>`

Parses tabular `kubectl` output into an array of key-value objects, one per line.

The result is an array of the form:

```javascript
[
    {
        title1: "value11",
        title2: "value12",
        title3: "value13"
    },
    {
        title1: "value21",
        title2: "value22",
        title3: "value23"
    }
]
```

Each non-header row is parsed as an object within the array.  Each object's keys are the lowercased
column headers, and the value of each key is the string under that header in the object's row.

If `output.stdout` is empty then the function returns success with an empty array.

**TypeScript:** `Dictionary<T>` is an alias for `{ [key: string]: T }`.

### asTableLines

**JavaScript:** `asTableLines(output)`

**TypeScript:** `asTableLines(output: KubectlOutput): Errorable<TableLines>`

Splits tabular `kubectl` output into a header line and an array of body lines.  The result is
an object of the form:

```javascript
{
    header: "TITLE1    TITLE2       TITLE3",
    body: [
        "value11   value12      value13".
        "value21   value22      value23"
    ]
}
```

If `output.stdout` is empty then the function returns success with an empty string `header` and
an empty `body` array.

## JSON format functions

These functions are for use with `kubectl` commands that return data in JSON format.
This is typically triggered by the `-o json` option and may be used for lists or for single
resources, e.g. `kubectl get pods -o json` or `kubectl get deploy/nginx -o json`.

In all cases:

* The function takes a `KubectlOutput`: that is, either a `ShellResult` (an object with numeric `code`,
`stdout` string and `stderr` string properties), or `undefined`.  `code` and `stderr` are used
for error handling; on the happy path, the function will operate on the `stdout` string.
* The function returns an `Errorable`: that is, an object with a boolean `succeeded` property.  If
`succeeded` is true, the object also has a `result` property containing the result of the function;
if `succeeded` is false, the object has `reason` and `error` properties describing the failure.
* If the input is `undefined`, or has a non-zero `code`, or if `stdout` is empty, the function
returns a _failed_ Errorable.
* The function does not check the format of the provided `stdout`.  You should use it **only** on the output
of `kubectl` commands that return JSON data.

### parseJSON

**JavaScript:** `parseJSON(output)`

**TypeScript:** `parseJSON<T>(output: KubectlOutput): Errorable<T>`

Checks for `kubectl` failure and then returns the deserialised object corresponding to the
`stdout` JSON.

### parseJSONCollection

**TypeScript:** `parseJSONCollection<T>(output: KubectlOutput): Errorable<KubernetesList<T>>`

Checks for `kubectl` failure and then returns the deserialised object corresponding to the
`stdout` JSON, where this is a Kubernetes item list object.

This is equivalent to writing `parseJSON<KubernetesList<T>>`; it is provided for TypeScript
users to reduce generics clutter in their code.  (In untyped JavaScript, there's no difference
between this and the `parseJSON` function.)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
