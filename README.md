<h1 align="center">
  <code>strema</code>
</h1>

<p align="center">
  Experimental schema builder using TypeScript templates.
</p>


## Usage

Use `compileSchema` to create a schema.

```tsx
import { compileSchema } from "strema";

const schema = compileSchema(`{
  message: string;
  size: number <positive, int>;
  tags: string[];
  author: {
    name: string;
    email: string <email>;
    age: number <int, min(18)>;
  };
}`);
```

To get the type from the `schema`, use `ExtractSchemaType`.

```tsx
import { ExtractSchemaType } from "strema";

type Body = ExtractSchemaType<typeof schema>;
```

To validate and parse incoming data, use the `parseSync` method on `schema`.

```tsx
// Throws an error if req.body does not conform to the schema
const body = schema.parseSync(req.body);
```


## Overview

- [Field types](#Field_types)
  - [Primitives](#Primitives)
    - [String](#String)
      - [String rules](#String_rules)
    - [Number](#Number)
      - [Number rules](#Number_rules)
    - [Boolean](#Boolean)
  - [Objects](#Objects)
  - [Arrays](#Arrays)
  - [Records](#Records)
- [Rules](#Rules)
- [Optional fields](#Optional_fields)
  - [Optional primitives](#Optional_primitives)
  - [Optional arrays](#Optional_arrays)
  - [Optional objects](#Optional_objects)
  - [Optional records](#Optional_primitives)


## Field types

This library supports four field types.

- [Primitives](#Primitives)
- [Objects](#Objects)
- [Arrays](#Arrays)
- [Records](#Records)


### Primitives

There are three primitive types.

- [String](#String)
- [Number](#Number)
- [Boolean](#Boolean)


#### String

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  value: string;
}`);
```
</td>
<td>

```tsx
{ value: string }
```
</td>
</tr>

<tr>
<td>

```tsx
// Optional 'value' field
const schema = compileSchema(`{
  value?: string;
}`);
```
</td>
<td>

```tsx
{ value: string | null }
```
</td>
</tr>

<tr>
<td>

```tsx
// Optional 'value' field with default value
const schema = compileSchema(`{
  value?: string = "Hello, world";
}`);
```
</td>
<td>

```tsx
{ value: string }
```
</td>
</tr>

<tr>
<td>

```tsx
// Apply email rule to 'to' field
const schema = compileSchema(`{
  to: string <email>;
}`);
```
</td>
<td>

```tsx
{ to: string }
```
</td>
</tr>
</table>

<h5 id="String_rules">String rules</h5>

 - `min(n)` sets a minimum length for the string.
 - `max(n)` sets a maximum length for the string.
 - `length(n)` equivalent to `min(n), max(n)`.
 - `email` the string value must be an email address.
 - `uuid` the string value must be a uuid.


#### Number

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  value: number;
}`);
```
</td>
<td>

```tsx
{ value: number }
```
</td>
</tr>

<tr>
<td>

```tsx
// Optional 'value' field
const schema = compileSchema(`{
  value?: number;
}`);
```
</td>
<td>

```tsx
{ value: number | null }
```
</td>
</tr>

<tr>
<td>

```tsx
// Optional 'value' field with default value
const schema = compileSchema(`{
  value?: number = 1;
}`);
```
</td>
<td>

```tsx
{ value: number }
```
</td>
</tr>

<tr>
<td>

```tsx
// Apply min rule to 'value' field
const schema = compileSchema(`{
  value: number <min(1)>;
}`);
```
</td>
<td>

```tsx
{ value: number }
```
</td>
</tr>
</table>

<h5 id="Number_rules">Number rules</h5>

 - `min(n)` sets a minimum value for the number.
 - `max(n)` sets a maximum value for the number.
 - `int` the value must be an integer.
 - `positive` equivalent to `min(0)`.


#### Boolean

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  include: boolean;
}`);
```
</td>
<td>

```tsx
{ include: boolean }
```
</td>
</tr>

<tr>
<td>

```tsx
// Optional 'include' field
const schema = compileSchema(`{
  include?: boolean;
}`);
```
</td>
<td>

```tsx
{ include: boolean | null }
```
</td>
</tr>

<tr>
<td>

```tsx
// Optional 'include' field with default value
const schema = compileSchema(`{
  include?: boolean = false;
}`);
```
</td>
<td>

```tsx
{ include: boolean }
```
</td>
</tr>
</table>

Booleans do not support any rules.


### Objects

Objects fields represent a collection of sub-fields (key-value pairs).

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  book: {
    name: string;
    description: string;
    author: {
      name: string;
      age: number;
    };
  };
}`);
```
</td>
<td>

```tsx
{
  book: {
    name: string;
    description: string;
    author: {
      name: string;
      age: number;
    };
  };
}
```
</td>
</tr>
</table>

To create an object with dynamic keys, use a <a href="#Records">Record</a>.


### Arrays

Arrays represent a list of values. The list may be multidimensional.

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  tags: string[];
}`);
```
</td>
<td>

```tsx
{ tags: string[] }
```
</td>
</tr>

<tr>
<td>

```tsx
const schema = compileSchema(`{
  matrix: number[][];
}`);
```
</td>
<td>

```tsx
{ matrix: number[][] }
```
</td>
</tr>

<tr>
<td>

```tsx
const schema = compileSchema(`{
  items: { name: string }[];
}`);
```
</td>
<td>

```tsx
{ items: Array<{ name: string }> }
```
</td>
</tr>

</table>

You can create arrays of any type. Here's how you would represent an array of objects.

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  books: {
    name: string;
    description: string;
  }[];
}`);
```
</td>
<td>

```tsx
{
  books: Array<{
    name: string;
    description: string;
  }>;
}
```
</td>
</tr>
</table>


### Records

Records represent a collection key-value pairs with dynamic keys (i.e. hash maps, dictionaries, associative arrays). The record syntax is `Record<K, V>` where `K` is the key type and `V` is the value type.

`K` must be either `string` or `number`. `V` can be any value that this library supports.


<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  map: Record<string, number>;
}`);
```
</td>
<td>

```tsx
{ map: Record<string, number> }
```
</td>
</tr>

<tr>
<td>

```tsx
const schema = compileSchema(`{
  map: Record<string, {
    value: number;
  }>;
}`);
```
</td>
<td>

```tsx
{ map: Record<string, { value: number }> }
```
</td>
</tr>

<tr>
<td>

```tsx
const schema = compileSchema(`{
  map: Record<string, number[]>;
}`);
```
</td>
<td>

```tsx
{ map: Record<string, number[]> }
```
</td>
</tr>
</table>



## Rules

Primitive types support rules to perform basic validation. Rules are specified inside of `<>` after the type name and before `;` with multiple rules separated by `,`. If the rule takes an argument, provide it inside of `()` after the rule name.

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  age: number <positive, int>;
  email: string <email>;
  password: string <min(8)>;
}`);
```
</td>
<td>

```tsx
{
  age: number;
  email: string;
  password: string;
}
```
</td>
</tr>
</table>

The available rules can be found here:

- [String rules](#String_rules)
- [Number rules](#Number_rules)
- Booleans do not support rules

Rules may also be applied to arrays (and multidimensional arrays). In those cases, specify the rules after the `[]` array notation.

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  tags: string[] <min(1)>;
  coords: number[][] <int>;
}`);
```
</td>
<td>

```tsx
{
  tags: string[];
  coords: number[][];
}
```
</td>
</tr>
</table>

Rules can not be applied directly to arrays or objects.


<h2 id="Optional_fields">Optional fields</h2>

By default, all fields are required. To mark a field as optional, add a `?` after the field name:

<table>
<tr>
<th>Schema</th>
<th>TypeScript type</th>
</tr>
<tr>
<td>

```tsx
const schema = compileSchema(`{
  description?: string;
}`);
```
</td>
<td>

```tsx
{ description: string | null }
```
</td>
</tr>
</table>


<h3 id="Optional_primitives">
Optional primitives
</h3>

When a primitive field is optional, `null` and `undefined` values are not rejected.

```tsx
const schema = compileSchema(`{
  description?: string;
}`);

const output = schema.parseSync({ description: undefined });

console.log(output);
//=> { description: null }
```


<h3 id="Optional_arrays">
Optional arrays
</h3>

Optional arrays behave in the same way as primitives.

```tsx
const schema = compileSchema(`{
  tags?: string[];
}`);

const output = schema.parseSync({ tags: undefined });

console.log(output);
//=> { tags: null }
```


<h3 id="Optional_objects">
Optional objects
</h3>

Object fields behave the same as primitives and arrays, with the exception that object fields with no required fields accept `null` and `undefined`.

```tsx
const schema = compileSchema(`{
  options: { notify?: boolean; delay?: number };
}`);

const output = schema.parseSync({ options: undefined });

console.log(output.options);
//=> { notify: null, delay: null }
```

However, if the object is optional, it resolves to `null` when `null` or `undefined` are provided.

```tsx
const schema = compileSchema(`{
  options?: { notify?: boolean; delay?: number };
}`);

const output = schema.parseSync({ options: undefined });

console.log(output.options);
//=> null
```


<h3 id="Optional_records">
Optional records
</h3>

Records fields are always optional. Using the `?:` optional notation throws an error.

```tsx
const schema = compileSchema(`{
  record?: Record<string, string>;
}`);
// Throws: Type 'record' cannot be optional
```