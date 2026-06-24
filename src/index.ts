type Tags = keyof HTMLElementTagNameMap;
type Elem<T extends Tags> = HTMLElementTagNameMap[T];
type DeepPartial<T extends object> = T extends Function | Array<unknown>
  ? T
  : {
      [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
    };
type PickByType<T, U> = { [P in keyof T as T[P] extends U ? P : never]: T[P] };
type ElemAttributes<T extends Tags> = DeepPartial<Elem<T>>;
type ElemText = string | number;
type ElemChildren = Array<HTMLElement | ElemText>;
type TagObj<T extends Tags> = { tag: T; id?: string };
type TagLike<T extends Tags> = T | TagObj<T>;
type Stringable = { toString: () => string };
type StyleProps = Partial<PickByType<CSSStyleDeclaration, string>> & {
  [property: string]: string;
};

function setInlineStyle<T extends HTMLElement | CSSStyleRule>(
  element: T,
  style: StyleProps,
) {
  try {
    for (const prop in style) {
      try {
        const value =
          typeof style[prop] === "string"
            ? style[prop].replace("!important", "")
            : style[prop];
        const important = value === style[prop] ? "" : "important";
        if (prop in element.style && !important)
          element.style[prop as any] = value;
        else
          element.style.setProperty(
            prop in element.style ? kebab(prop) : prop,
            value,
            important,
          );
      } catch (e) {
        console.error(e);
      }
    }
  } catch (e) {
    throw e;
  }
}

function setAttribute<T extends HTMLElement>(
  element: T,
  name: string,
  value: any,
) {
  try {
    if (name === "style") setInlineStyle(element, value);
    else if (name in element) element[name as keyof T] = value;
    else element.setAttribute(name, value);
  } catch (e) {
    throw e;
  }
}

function createElem<T extends Tags>(tag: T, attributes: ElemAttributes<T>) {
  if (tag === String("")) {
    return document.createDocumentFragment();
  } else {
    const el = document.createElement(tag);
    for (const attr in attributes) setAttribute(el, attr, attributes[attr]);
    return el;
  }
}

function appendChildren(parent: Node, children: any[]) {
  for (const child of children) {
    if (typeof child === "boolean" || typeof child === "function") continue;
    if (child === null || child === undefined) continue;
    if (Array.isArray(child)) {
      appendChildren(parent, child);
      continue;
    }
    try {
      child !== "" &&
        parent.appendChild(
          typeof child === "object"
            ? child
            : document.createTextNode(String(child)),
        );
    } catch (err) {
      console.error(err);
    }
  }
}

function elemArgs<T extends Tags>(args: any[]) {
  const [tag, id]: [T, string] =
    typeof args[0] === "string" ? [args[0], ""] : [args[0].tag, args[0].id];
  let attributes = {} as ElemAttributes<T>;
  let children = [] as ElemChildren;
  if (args[1]) {
    if (typeof args[1] === "string" || typeof args[1] === "number")
      children = [args[1]];
    else if (Array.isArray(args[1])) children = args[1];
    else if (args[1]) attributes = args[1];
  }
  if (args.length >= 3) {
    children = args.slice(2);
  } else {
    if (Array.isArray(attributes.children)) children = attributes.children;
  }

  if ("children" in attributes) {
    const { children: _, ...rest } = attributes;
    attributes = rest as typeof attributes;
  }
  if (id) attributes = { ...attributes, id };

  return [tag, attributes, children] as const;
}

function elem<T extends Tags>(tag: TagLike<T>): Elem<T>;
function elem<T extends Tags>(
  tag: TagLike<T>,
  attributes: ElemAttributes<T>,
): Elem<T>;
function elem<T extends Tags>(
  tag: TagLike<T>,
  attributes: ElemAttributes<T>,
  children: ElemChildren,
): Elem<T>;
function elem<T extends Tags>(tag: TagLike<T>, children: ElemChildren): Elem<T>;
function elem<T extends Tags>(tag: TagLike<T>, text: ElemText): Elem<T>;
function elem<T extends Tags>(
  tag: TagLike<T>,
  attributes: ElemAttributes<T>,
  text: ElemText,
): Elem<T>;
function elem(...args: any[]) {
  try {
    if (isComponent(args[0])) return getComponent(args);
    const [tag, attributes, children] = elemArgs(args);
    const el = createElem(tag, attributes);
    appendChildren(el, children);
    return el;
  } catch (e) {
    console.error(e);
    return "";
  }
}

const getStyleSheet = (() => {
  let styleElement: HTMLStyleElement;
  return function getStyleSheet() {
    if (!styleElement) {
      styleElement = document.createElement("style");
      document.head.appendChild(styleElement);
    }
    if (!styleElement.sheet) throw new Error("Unable to add style rule.");
    return styleElement.sheet;
  };
})();

function initRule<T extends CSSRule = CSSRule>(
  sheet: CSSStyleSheet | CSSMediaRule,
  selector: string | Stringable,
  content?: string,
) {
  const index = sheet.cssRules.length;
  sheet.insertRule(
    selector + (content ? ` { content: ${content}; }` : " {}"),
    index,
  );
  const rule = sheet.cssRules.item(index) as T;
  return rule;
}

function style(selector: string | Stringable, properties: StyleProps) {
  try {
    const rule = initRule<CSSStyleRule>(
      getStyleSheet(),
      selector,
      properties.content,
    );
    setInlineStyle(rule, properties);
    return rule;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function media(condition: string, styleRules: Record<string, StyleProps>) {
  try {
    const mediaRule = initRule<CSSMediaRule>(
      getStyleSheet(),
      `@media ${condition}`,
    );
    try {
      for (const selector in styleRules) {
        const properties = styleRules[selector];
        const rule = initRule<CSSStyleRule>(
          mediaRule,
          selector,
          properties.content,
        );
        setInlineStyle(rule, properties);
      }
    } catch (e) {
      console.error(e);
    }
    return mediaRule;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function assertElement<T extends Element>(
  el: T | null | undefined,
  tag?: string,
) {
  if (!el) throw new ReferenceError("Element not found.");
  if (tag && el.tagName.toLowerCase() !== tag)
    throw new TypeError("tag parameter and element's tag do not match.");
  return el;
}

function queryElem<T extends Tags>(
  selector: string,
  tag?: T,
): "main" extends T ? HTMLElement : Elem<T> {
  const el = document.querySelector(selector);
  return assertElement(el, tag) as any;
}

function getElem<T extends Tags>(
  id: string,
  tag?: T,
): "main" extends T ? HTMLElement : Elem<T> {
  const el = document.getElementById(id);
  return assertElement(el, tag) as any;
}

function getChild<T extends Tags>(
  id: string,
  tag?: T,
): "main" extends T ? HTMLElement : Elem<T> {
  const el = document.getElementById(id)?.firstElementChild;
  return assertElement(el, tag) as any;
}

function getParent<T extends Tags>(
  id: string,
  tag?: T,
): "main" extends T ? HTMLElement : Elem<T> {
  const el = document.getElementById(id)?.parentElement;
  return assertElement(el, tag) as any;
}

const refElem = (() => {
  let refCount = 0;
  return function refElem<T extends Tags>(tag: T) {
    const id = "e" + (refCount++).toString(36);
    const ref = function () {
      return getElem(id, tag) as Elem<T>;
    };
    ref.id = id;
    ref.tag = tag;
    ref.selector = tag + "#" + id;
    ref.toString = function (): string {
      return this.selector;
    };
    return Object.freeze(ref);
  };
})();

function isRef(value: Function): value is ReturnType<typeof refElem> {
  return (
    Object.isFrozen(value) &&
    "selector" in value &&
    value.selector === String(value)
  );
}

function isComponent(value: unknown): value is Function {
  return typeof value === "function" && !isRef(value);
}

function getComponent(args: any[]) {
  try {
    // this is for jsx compatibility
    return args[0]({
      children: args.slice(2),
      ...args[1],
    }) as HTMLElement;
  } catch (err) {
    console.error(err);
    return;
  }
}

function kebab(name: string) {
  if (name.indexOf("-") !== -1) return name;
  return name.replace(/([A-Z])/g, (a) => {
    return "-" + a.toLowerCase();
  });
}

const thisModule = Object.freeze({
  elem,
  style,
  media,
  getElem,
  queryElem,
  getChild,
  getParent,
  refElem,
  version: "__version__" as string,
});

declare global {
  var freedom: typeof thisModule;
}

Object.defineProperty(window, "freedom", {
  value: thisModule,
  enumerable: true,
});

// this is for jsx compatibility
"React" in window ||
  Object.defineProperty(window, "React", {
    value: { createElement: elem, Fragment: "" },
    enumerable: true,
  });

export {};
