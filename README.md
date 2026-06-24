# @lamartinecabral/freedom

- [What is it?](#what-is-it)
- [Installation](#installation)
- [Usage example](#usage-example)
- [Reference](#reference)

# What is it?

A really small set of utilities to write `HTML` and `CSS` using only pure javascript.

### But how?

It uses browser native APIs under the hood and get type checking and suggestions thanks to [`typescript`](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts).

# Installation

In a browser:

```html
<script src="https://unpkg.com/@lamartinecabral/freedom"></script>
<script>
  const { elem, style } = freedom;
</script>
```

```html
<script type="module">
  import "https://unpkg.com/@lamartinecabral/freedom";
  const { elem, style } = freedom;
</script>
```

Using npm:

```sh
$ npm install @lamartinecabral/freedom
```

```javascript
require("@lamartinecabral/freedom");
const { elem, style } = freedom;
```

```javascript
import "@lamartinecabral/freedom";
const { elem, style } = freedom;
```

# Usage example

The code below...

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
      <button id="clr" onclick="reset()">reset</button>
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

... can be rewritten like this:

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
        elem("h1", {}, ["Hello World!"]),
        elem("button", { onclick: () => count() }, ["click me"]),
        elem("p", {}, [
          " you clicked ",
          elem("span", { id: "counter" }, ["0"]),
          " times. ",
        ]),
        elem("button", { id: "clr", onclick: () => reset(), disabled: true }, [
          "reset",
        ]),
      ])
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

# Reference

### `elem()`

It abstracts the [`Document.createElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement), [`Element.setAttribute`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute) and [`Element.append`](https://developer.mozilla.org/en-US/docs/Web/API/Element/append) methods. It returns the element created.

Signature:

```typescript
function elem<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes: Partial<HTMLElementTagNameMap[T]>,
  children: Array<HTMLElement | string>
): HTMLElementTagNameMap[T];
```

### `style()`

It creates and returns a global [CSSRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSRule) and abstracts the [`CSSStyleDeclaration.setProperty`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty).

Signature:

```typescript
function style(
  selector: string,
  properties: Partial<CSSStyleDeclaration>
): CSSStyleRule;
```
