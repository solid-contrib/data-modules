type IRINamespacesMap = {
    [prefix: string]: string;
};
export default function IRI(value: string, namespaces?: IRINamespacesMap, defaultNamespace?: string): string;
export {};
