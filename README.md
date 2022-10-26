<h1 align="center">
  <code>strema</code>
</h1>

<p align="center">
  Experimental schema builder using TypeScript templates.
</p>

## Usage

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

type Body = ExtractSchemaType<typeof schema>;

// ...

const body = schema.parseSync(req.body);
```


## Rules

Primitive values support a number of rules to perform basic validation.

```tsx
const schema = compileSchema(`{
  age: number <positive, int>;
  email: string <email>;
  password: string <min(8)>;
}`);
```

Some rules take an argument, some not. Multiple rules may be applied to a single value.

To apply rules to arrays of primitives, place the rules after the array notation:

```tsx
const schema = compileSchema(`{
  tags: string[] <min(1)>;
  coords: number[][] <int>;
}`);
```

Rules can not be applied to arrays or objects.


## Data Types

### String `string`

```tsx
const schema = compileSchema(`{
  email: string <email>;
}`);
```

The rules available for strings are:

 - `min(n)` sets a minimum length for the string.
 - `max(n)` sets a maximum length for the string.
 - `length(n)` equivalent to `min(n), max(n)`.
 - `email` the string value must be an email address.
 - `uuid` the string value must be a uuid.

 A default value can be provided inside of double quotes:

```tsx
const schema = compileSchema(`{
  category: string <min(3)> = "other";
}`);
```


### Number `number`

 ```tsx
const schema = compileSchema(`{
  width: number <positive>;
}`);
```

The rules available for numbers are:

 - `min(n)` sets a minimum value for the number.
 - `max(n)` sets a maximum value for the number.
 - `int` the value must be an integer.
 - `positive` equivalent to `min(0)`.

A default value can be provided:

```tsx
const schema = compileSchema(`{
  delayMs: number <positive> = 0;
}`);
```


### Boolean `boolean`

 ```tsx
const schema = compileSchema(`{
  include: boolean;
}`);
```

Booleans do not support any rules.

A default value of either `true` or `false` can be provided:

```tsx
const schema = compileSchema(`{
  include: boolean = true;
}`);
```

