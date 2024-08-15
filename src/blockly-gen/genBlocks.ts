import * as ts from "typescript";
import * as Blockly from "blockly";
import { BlockDefinition } from "./types";
import { javascriptGenerator, JavascriptGenerator } from "blockly/javascript";


function getAst(dts: string): ts.SourceFile {
    return ts.createSourceFile("test.d.ts", dts, ts.ScriptTarget.ES2020);
}

type Type = {
    kind: "simple" | "promise" | "array" | "object" | "function";
    type: string | Type | ObjectType | FuncType
}

type ObjectType = {
    properties: { [key: string]: Type };
};

type FuncType = {
    args: Argument[];
    returnType: Type;
};

type Argument = {
    name: string;
    type: Type;
};

type Func = {
    name: string;
    type: FuncType;
};

function simple(type: string): Type {
    return { kind: "simple", type };
}

function promise(type: Type): Type {
    return { kind: "promise", type };
}

function getTypeReference(node: ts.TypeReferenceNode): Type {
    if (node.typeName.kind !== ts.SyntaxKind.Identifier) {
        throw new Error("Type reference is not an identifier");
    }
    let identifier = node.typeName as ts.Identifier;
    let typeName = identifier.text;

    switch (typeName) {
    case "Promise":
        if (node.typeArguments === undefined || node.typeArguments.length !== 1) {
            throw new Error("Promise type has no type arguments");
        }
        return promise(getType(node.typeArguments[0]));
    default:
        throw new Error("Unsupported type reference: " + typeName);
    }
}

function getTypeFunction(node: ts.FunctionTypeNode): Type {
    const args: Argument[] = [];
    node.parameters.forEach(() => {
        throw new Error("Functions with parameters are not supported");
    });

    let returnType = simple("void");
    if (node.type !== undefined) {
        returnType = getType(node.type);
    }

    return { kind: "function", type: { args, returnType } };
}

function getType(node: ts.TypeNode): Type {
    switch (node.kind) {
    case ts.SyntaxKind.NumberKeyword:
        return simple("number");
    case ts.SyntaxKind.StringKeyword:
        return simple("string");
    case ts.SyntaxKind.BooleanKeyword:
        return simple("boolean");
    case ts.SyntaxKind.VoidKeyword:
        return simple("void");
    case ts.SyntaxKind.LiteralType:
        return simple((node as ts.LiteralTypeNode).literal.getText());
    case ts.SyntaxKind.TypeReference:
        return getTypeReference(node as ts.TypeReferenceNode);
    case ts.SyntaxKind.FunctionType:
        return getTypeFunction(node as ts.FunctionTypeNode);
    default:
        throw new Error("Unsupported type: " + ts.SyntaxKind[node.kind]);
    }
}

function getFunction(node: ts.FunctionDeclaration): Func {
    const name = node.name?.text;
    if (name === undefined) {
        throw new Error("Function has no name");
    }

    const args: Argument[] = [];
    node.parameters.forEach((param) => {
        if (param.name === undefined) {
            throw new Error("Parameter has no name");
        }
        if (param.type === undefined) {
            throw new Error("Parameter has no type");
        }
        if (param.name.kind !== ts.SyntaxKind.Identifier) {
            throw new Error("Parameter name is not an identifier");
        }
        let identifier = param.name as ts.Identifier;

        args.push({
            name: identifier.text,
            type: getType(param.type)
        });
    });

    let returnType = simple("void");
    if (node.type !== undefined) {
        returnType = getType(node.type);
    }

    return { name, type: { args, returnType } };
}

function addArgument(bloc: Blockly.Block, arg: Argument) {
    switch (arg.type.kind) {
    case "simple":
        bloc.appendValueInput(arg.name)
            .setCheck(null)
            .appendField(arg.name);
        break;
    case "promise": case "array": case "object":
        bloc.appendValueInput(arg.name)
            .setCheck(arg.type.type as string)
            .appendField(arg.name);
        break;
    case "function":
        bloc.appendStatementInput(arg.name)
            .setCheck("Function")
            .appendField(arg.name);
        break;
    default:
        throw new Error("Unsupported type: " + arg.type.kind);
    }
}

export function getBlocks(dts: string): BlockDefinition[] {
    const ast = getAst(dts);

    const blocks: BlockDefinition[] = [];

    ast.forEachChild((node) => {
        if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
            const func = getFunction(node as ts.FunctionDeclaration);

            const block: BlockDefinition = {
                type: func.name,
                init: (bloc) => {
                    bloc.appendDummyInput()
                        .appendField(func.name);
                    for (let arg of func.type.args) {
                        addArgument(bloc, arg);
                    }
                    bloc.setNextStatement(true);
                    bloc.setPreviousStatement(true);
                    bloc.setColour("404040");
                }
            };
            blocks.push(block);

            javascriptGenerator.forBlock[func.name] = (block: Blockly.Block, generator: JavascriptGenerator) => {
                console.log(block);
                let args: string[] = [];
                for (let arg of func.type.args) {
                    switch (arg.type.kind) {
                    case "simple":
                        args.push(generator.valueToCode(block, arg.name, 0));
                        break;
                    case "promise": case "array": case "object":
                        args.push(generator.valueToCode(block, arg.name, 0));
                        break;
                    case "function": {
                        console.log(arg);
                        let fn = arg.type.type as unknown as FuncType;
                        let code = "((";
                        let first = true;
                        for (let a of fn.args) {
                            if (!first) {
                                code += ", ";
                            }
                            code += a.name;
                            first = false;
                        }
                        code += ") => {\n";
                        code += generator.statementToCode(block, arg.name);
                        code += "})";
                        args.push(code);
                    } break;
                    }
                }
                return `${func.name}(${args.join(", ")});\n`;
            };
        }
    });

    return blocks;
}
