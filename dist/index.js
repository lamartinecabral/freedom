!(function(){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
function setInlineStyle(element, style) {
    try {
        for (var prop in style) {
            try {
                var value = typeof style[prop] === "string"
                    ? style[prop].replace("!important", "")
                    : style[prop];
                var important = value === style[prop] ? "" : "important";
                if (prop in element.style && !important)
                    element.style[prop] = value;
                else
                    element.style.setProperty(prop in element.style ? kebab(prop) : prop, value, important);
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    catch (e) {
        throw e;
    }
}
function setAttribute(element, name, value) {
    try {
        if (name === "style")
            setInlineStyle(element, value);
        else if (name in element)
            element[name] = value;
        else
            element.setAttribute(name, value);
    }
    catch (e) {
        throw e;
    }
}
function createElem(tag, attributes) {
    if (tag === String("")) {
        return document.createDocumentFragment();
    }
    else {
        var el = document.createElement(tag);
        for (var attr in attributes)
            setAttribute(el, attr, attributes[attr]);
        return el;
    }
}
function appendChildren(parent, children) {
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var child = children_1[_i];
        if (typeof child === "boolean" || typeof child === "function")
            continue;
        if (child === null || child === undefined)
            continue;
        if (Array.isArray(child)) {
            appendChildren(parent, child);
            continue;
        }
        try {
            child !== "" &&
                parent.appendChild(typeof child === "object"
                    ? child
                    : document.createTextNode(String(child)));
        }
        catch (err) {
            console.error(err);
        }
    }
}
function elemArgs(args) {
    var _a = typeof args[0] === "string" ? [args[0], ""] : [args[0].tag, args[0].id], tag = _a[0], id = _a[1];
    var attributes = {};
    var children = [];
    if (args[1]) {
        if (typeof args[1] === "string" || typeof args[1] === "number")
            children = [args[1]];
        else if (Array.isArray(args[1]))
            children = args[1];
        else if (args[1])
            attributes = args[1];
    }
    if (args.length >= 3) {
        children = args.slice(2);
    }
    else {
        if (Array.isArray(attributes.children))
            children = attributes.children;
    }
    if ("children" in attributes) {
        var _ = attributes.children, rest = __rest(attributes, ["children"]);
        attributes = rest;
    }
    if (id)
        attributes = __assign(__assign({}, attributes), { id: id });
    return [tag, attributes, children];
}
function elem() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    try {
        if (isComponent(args[0]))
            return getComponent(args);
        var _a = elemArgs(args), tag = _a[0], attributes = _a[1], children = _a[2];
        var el = createElem(tag, attributes);
        appendChildren(el, children);
        return el;
    }
    catch (e) {
        console.error(e);
        return "";
    }
}
var getStyleSheet = (function () {
    var styleElement;
    return function getStyleSheet() {
        if (!styleElement) {
            styleElement = document.createElement("style");
            document.head.appendChild(styleElement);
        }
        if (!styleElement.sheet)
            throw new Error("Unable to add style rule.");
        return styleElement.sheet;
    };
})();
function initRule(sheet, selector, content) {
    var index = sheet.cssRules.length;
    sheet.insertRule(selector + (content ? " { content: ".concat(content, "; }") : " {}"), index);
    var rule = sheet.cssRules.item(index);
    return rule;
}
function style(selector, properties) {
    try {
        var rule = initRule(getStyleSheet(), selector, properties.content);
        setInlineStyle(rule, properties);
        return rule;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
function media(condition, styleRules) {
    try {
        var mediaRule = initRule(getStyleSheet(), "@media ".concat(condition));
        try {
            for (var selector in styleRules) {
                var properties = styleRules[selector];
                var rule = initRule(mediaRule, selector, properties.content);
                setInlineStyle(rule, properties);
            }
        }
        catch (e) {
            console.error(e);
        }
        return mediaRule;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
function assertElement(el, tag) {
    if (!el)
        throw new ReferenceError("Element not found.");
    if (tag && el.tagName.toLowerCase() !== tag)
        throw new TypeError("tag parameter and element's tag do not match.");
    return el;
}
function queryElem(selector, tag) {
    var el = document.querySelector(selector);
    return assertElement(el, tag);
}
function getElem(id, tag) {
    var el = document.getElementById(id);
    return assertElement(el, tag);
}
function getChild(id, tag) {
    var _a;
    var el = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.firstElementChild;
    return assertElement(el, tag);
}
function getParent(id, tag) {
    var _a;
    var el = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.parentElement;
    return assertElement(el, tag);
}
var refElem = (function () {
    var refCount = 0;
    return function refElem(tag) {
        var id = "e" + (refCount++).toString(36);
        var ref = function () {
            return getElem(id, tag);
        };
        ref.id = id;
        ref.tag = tag;
        ref.selector = tag + "#" + id;
        ref.toString = function () {
            return this.selector;
        };
        return Object.freeze(ref);
    };
})();
function isRef(value) {
    return (Object.isFrozen(value) &&
        "selector" in value &&
        value.selector === String(value));
}
function isComponent(value) {
    return typeof value === "function" && !isRef(value);
}
function getComponent(args) {
    try {
        // this is for jsx compatibility
        return args[0](__assign({ children: args.slice(2) }, args[1]));
    }
    catch (err) {
        console.error(err);
        return;
    }
}
function kebab(name) {
    if (name.indexOf("-") !== -1)
        return name;
    return name.replace(/([A-Z])/g, function (a) {
        return "-" + a.toLowerCase();
    });
}
var thisModule = Object.freeze({
    elem: elem,
    style: style,
    media: media,
    getElem: getElem,
    queryElem: queryElem,
    getChild: getChild,
    getParent: getParent,
    refElem: refElem,
    version: "1.0.0-beta.1",
});
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
})()
