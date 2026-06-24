# @lamartinecabral/freedom

Tiny browser utilities for building DOM and CSS with plain JavaScript.

- [What is it?](#what-is-it)
- [Installation](#installation)
- [Quick example](#quick-example)
- [API](#api)

# What is it?

`@lamartinecabral/freedom` is a browser-first helper library for:

- creating elements with `elem()`
- inserting stylesheet rules with `style()` and `media()`
- querying elements with typed helpers such as `getElem()`

It uses the browser's native DOM and CSSOM APIs directly, so you still get editor autocomplete and type checking from the standard DOM typings shipped with [`typescript`](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts).

This package is designed for browser environments. It attaches a global `freedom` object to `window`.

# Installation

In the browser with a classic script tag:

```html
<script src="https://unpkg.com/@lamartinecabral/freedom"></script>
<script>
  const { elem, style } = freedom;
</script>
```

In the browser with an ES module script:

```html
<script type="module">
  import "https://unpkg.com/@lamartinecabral/freedom";

  const { elem, style } = window.freedom;
</script>
```

With npm:

```sh
npm install @lamartinecabral/freedom
```

Then load it in browser code so it can register `window.freedom`:

```javascript
import "@lamartinecabral/freedom";

const { elem, style } = window.freedom;
```

# Quick example

This HTML:

```html
<html>
  <head>
    <style>
      #app {
        text-align: center;
        width: fit-content;
        border: 1px solid;
        padding: 1em;
      }
      h1 {
        color: red;
      }
      * {
        font-family: monospace;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <h1>Hello World!</h1>
      <button onclick="count()">click me</button>
      <p>you clicked <span id="counter">0</span> times.</p>
      <button id="clr" onclick="reset()" disabled>reset</button>
    </div>
    <script>
      let counter = +document.getElementById("counter").innerText;

      function count() {
        document.getElementById("counter").innerText = `${++counter}`;
        document.getElementById("clr").disabled = false;
      }

      function reset() {
        document.getElementById("counter").innerText = `${(counter = 0)}`;
        document.getElementById("clr").disabled = true;
      }
    </script>
  </body>
</html>
```

can be written with `freedom` like this:

```html
<body>
  <script src="https://unpkg.com/@lamartinecabral/freedom"></script>
  <script>
    const { elem, style, getElem } = freedom;

    style("#app", {
      textAlign: "center",
      width: "fit-content",
      border: "1px solid",
      padding: "1em",
    });

    style("h1", {
      color: "red",
    });

    style("*", {
      fontFamily: "monospace",
    });

    document.body.append(
      elem("div", { id: "app" }, [
        elem("h1", ["Hello World!"]),
        elem("button", { onclick: count }, ["click me"]),
        elem("p", ["you clicked ", elem("span", { id: "counter" }, ["0"]), " times."]),
        elem("button", { id: "clr", onclick: reset, disabled: true }, ["reset"]),
      ]),
    );

    let counter = +getElem("counter").innerText;

    function count() {
      getElem("counter").innerText = `${++counter}`;
      getElem("clr").disabled = false;
    }

    function reset() {
      getElem("counter").innerText = `${(counter = 0)}`;
      getElem("clr").disabled = true;
    }
  </script>
</body>
```

# API

The global `freedom` object currently exposes:

```javascript
const {
  elem,
  style,
  media,
  getElem,
  queryElem,
  getChild,
  getParent,
  refElem,
  version,
} = window.freedom;
```

### `elem()`

Creates a DOM element, assigns properties or attributes, and appends children.

Supported patterns include:

```typescript
elem("button")
elem("button", { disabled: true })
elem("button", ["save"])
elem("button", { disabled: true }, ["save"])
elem("button", { disabled: true }, "save")
```

Notes:

- string and number children are converted to text nodes
- nested child arrays are flattened
- `null`, `undefined`, `false`, `true`, and functions are ignored as children
- `style` inside the attributes object is treated as inline style properties

### `style()`

Creates a global CSS rule and assigns its properties.

```typescript
style(".card", {
  padding: "1rem",
  borderRadius: "0.5rem",
});
```

Property names can be camelCase or kebab-case. Values ending in `!important` are preserved.

### `media()`

Creates a `@media` rule and inserts one or more selectors into it.

```typescript
media("(max-width: 640px)", {
  ".card": {
    width: "100%",
  },
  "#sidebar": {
    display: "none",
  },
});
```

### `getElem()`

Returns the element with the given `id` and throws if it does not exist.

```typescript
const button = getElem("save");
```

Pass the optional tag name as the second parameter when you want an extra runtime check and stronger typing.

```typescript
const button = getElem("save", "button");
```

### `queryElem()`

Like `document.querySelector`, but throws when nothing matches.

```typescript
const main = queryElem("main");
```

It also accepts the same optional second parameter to assert the returned element type.

```typescript
const main = queryElem("main", "main");
```

### `getChild()`

Returns the first element child of the element with the given `id`.

```typescript
const icon = getChild("save-button");
```

You can pass an optional second parameter to assert the child's tag name.

```typescript
const icon = getChild("save-button", "svg");
```

### `getParent()`

Returns the parent element of the element with the given `id`.

```typescript
const form = getParent("save");
```

You can also pass an optional second parameter to assert the parent's tag name.

```typescript
const form = getParent("save", "form");
```

### `refElem()`

Creates a stable element reference helper with an auto-generated `id`.

```javascript
const buttonRef = refElem("button");

document.body.append(elem(buttonRef, ["save"]));

buttonRef().disabled = true;
```

The returned function also exposes:

- `id`
- `tag`
- `selector`
- `toString()` returning the selector

### `version`

The package version string embedded in the distributed build.
