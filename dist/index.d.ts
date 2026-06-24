type Tags = keyof HTMLElementTagNameMap;
type Elem<T extends Tags> = HTMLElementTagNameMap[T];
type DeepPartial<T extends object> = T extends Function | Array<unknown> ? T : {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
type PickByType<T, U> = {
    [P in keyof T as T[P] extends U ? P : never]: T[P];
};
type ElemAttributes<T extends Tags> = DeepPartial<Elem<T>>;
type ElemText = string | number;
type ElemChildren = Array<HTMLElement | ElemText>;
type TagObj<T extends Tags> = {
    tag: T;
    id?: string;
};
type TagLike<T extends Tags> = T | TagObj<T>;
type Stringable = {
    toString: () => string;
};
type StyleProps = Partial<PickByType<CSSStyleDeclaration, string>> & {
    [property: string]: string;
};
declare function elem<T extends Tags>(tag: TagLike<T>): Elem<T>;
declare function elem<T extends Tags>(tag: TagLike<T>, attributes: ElemAttributes<T>): Elem<T>;
declare function elem<T extends Tags>(tag: TagLike<T>, attributes: ElemAttributes<T>, children: ElemChildren): Elem<T>;
declare function elem<T extends Tags>(tag: TagLike<T>, children: ElemChildren): Elem<T>;
declare function elem<T extends Tags>(tag: TagLike<T>, text: ElemText): Elem<T>;
declare function elem<T extends Tags>(tag: TagLike<T>, attributes: ElemAttributes<T>, text: ElemText): Elem<T>;
declare function style(selector: string | Stringable, properties: StyleProps): CSSStyleRule | null;
declare function media(condition: string, styleRules: Record<string, StyleProps>): CSSMediaRule | null;
declare function queryElem<T extends Tags>(selector: string, tag?: T): "main" extends T ? HTMLElement : Elem<T>;
declare function getElem<T extends Tags>(id: string, tag?: T): "main" extends T ? HTMLElement : Elem<T>;
declare function getChild<T extends Tags>(id: string, tag?: T): "main" extends T ? HTMLElement : Elem<T>;
declare function getParent<T extends Tags>(id: string, tag?: T): "main" extends T ? HTMLElement : Elem<T>;
declare const thisModule: Readonly<{
    elem: typeof elem;
    style: typeof style;
    media: typeof media;
    getElem: typeof getElem;
    queryElem: typeof queryElem;
    getChild: typeof getChild;
    getParent: typeof getParent;
    refElem: <T extends Tags>(tag: T) => {
        (): Elem<T>;
        id: string;
        tag: T;
        selector: string;
        toString(): string;
    };
    version: string;
}>;
declare global {
    var freedom: typeof thisModule;
}
export {};
