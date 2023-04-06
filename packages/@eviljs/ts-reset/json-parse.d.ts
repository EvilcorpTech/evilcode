interface JSON {
    parse(text: string, reviver?: (this: any, key: string, value: any) => any): unknown
}
