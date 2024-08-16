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

type Property = {
    name: string;
    type: Type;
};

type ObjectType = {
    properties: Property[];
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

type Var = {
    name: string;
    type: Type;
};

type Module = {
    name: string;
    members: Var[];
}

function simpleName(type: string): string {
    switch (type) {
    case "number":
        return "Number";
    case "string":
        return "String";
    case "boolean":
        return "Boolean";
    default:
        return type;
    }
}

function simpleCheck(type: string): string | null {
    switch (type) {
    case "any":
        return null;
    case "void":
        throw new Error("Invalid type: void");
    default:
        return simpleName(type);
    }
}

function typeToString(type: Type): string {
    switch (type.kind) {
    case "simple":
        return simpleName(type.type as string) ?? "any";
    case "promise":
        return `Promise<${typeToString(type.type as Type)}>`;
    case "array":
        return `${typeToString(type.type as Type)}[]`;
    case "object":
        return "{\n" + (type.type as ObjectType).properties.map((prop) => {
            return `${prop.name}: ${typeToString(prop.type)},`;
        }).join("\n") + "\n}";
    case "function":
        return `(${(type.type as FuncType).args.map((arg) => {
            return `${arg.name}: ${typeToString(arg.type)}`;
        }).join(", ")}) => ${typeToString((type.type as FuncType).returnType)}`;
    default:
        throw new Error("Unsupported type: " + type.kind);
    }
}

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
        if (node.typeArguments !== undefined) {
            throw new Error("Type reference has type arguments");
        }
        return simple(typeName);
    }
}

function getTypeFunction(node: ts.SignatureDeclaration): Type {
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

function getTypeProperty(node: ts.PropertySignature): Property {
    if (node.name === undefined) {
        throw new Error("Property has no name");
    }
    if (node.name.kind !== ts.SyntaxKind.Identifier) {
        throw new Error("Property name is not an identifier");
    }
    let identifier = node.name as ts.Identifier;

    if (node.type === undefined) {
        throw new Error("Property has no type");
    }

    return {
        name: identifier.text,
        type: getType(node.type)
    };
}

function getTypeMethod(node: ts.MethodSignature): Property {
    if (node.name === undefined) {
        throw new Error("Method has no name");
    }
    if (node.name.kind !== ts.SyntaxKind.Identifier) {
        throw new Error("Method name is not an identifier");
    }
    let identifier = node.name as ts.Identifier;

    return {
        name: identifier.text,
        type: {
            kind: "function",
            type: getFunctionSignature(node)
        }
    };
}

function getTypeLiteral(node: ts.TypeLiteralNode): ObjectType {
    const properties: Property[] = [];
    node.members.forEach((member) => {
        switch (member.kind) {
        case ts.SyntaxKind.PropertySignature:
            properties.push(getTypeProperty(member as ts.PropertySignature));
            break;
        case ts.SyntaxKind.MethodSignature:
            properties.push(getTypeMethod(member as ts.MethodSignature));
            break;
        default:
            throw new Error("Unsupported type literal member: " + ts.SyntaxKind[member.kind]);
        }
    });

    return { properties };
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
    case ts.SyntaxKind.AnyKeyword:
        return simple("any");
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

function getFunctionSignature(node: ts.SignatureDeclaration): FuncType {
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

    return { args, returnType };
}

function getFunction(node: ts.FunctionDeclaration): Func {
    const name = node.name?.text;
    if (name === undefined) {
        throw new Error("Function has no name");
    }

    return { name, type: getFunctionSignature(node) };
}

function getVariable(node: ts.VariableStatement): Var {
    if (node.declarationList.declarations.length !== 1) {
        throw new Error("Variable statement has multiple declarations");
    }

    const decl = node.declarationList.declarations[0];
    if (decl.name === undefined) {
        throw new Error("Variable declaration has no name");
    }
    if (decl.name.kind !== ts.SyntaxKind.Identifier) {
        throw new Error("Variable name is not an identifier");
    }
    let identifier = decl.name as ts.Identifier;
    if (decl.type === undefined) {
        throw new Error("Variable declaration has no type");
    }

    if (decl.type.kind === ts.SyntaxKind.TypeReference) {
        return {
            name: identifier.text,
            type: getTypeReference(decl.type as ts.TypeReferenceNode)
        };
    }
    if (decl.type.kind === ts.SyntaxKind.TypeLiteral) {
        return {
            name: identifier.text,
            type: {
                kind: "object",
                type: getTypeLiteral(decl.type as ts.TypeLiteralNode)
            }
        };
    }

    throw new Error("Unsupported variable type: " + ts.SyntaxKind[decl.type.kind]);
}

function addArgument(bloc: Blockly.Block, arg: Argument) {
    console.log(arg);
    switch (arg.type.kind) {
    case "simple":
        bloc.appendValueInput(arg.name)
            .setCheck(simpleCheck(arg.type.type as string))
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

function addGlobalFunctionBlock(blocks: BlockDefinition[], func: Func) {
    let name = func.name;
    const block: BlockDefinition = {
        type: name,
        init: (bloc) => {
            bloc.appendDummyInput()
                .appendField(name);
            for (let arg of func.type.args) {
                addArgument(bloc, arg);
            }
            bloc.setNextStatement(true);
            bloc.setPreviousStatement(true);
            if (!(func.type.returnType.kind === "simple" && func.type.returnType.type === "void")) {
                bloc.setOutput(true, typeToString(func.type.returnType));
            }
            bloc.setColour("404040");
        }
    };
    blocks.push(block);

    javascriptGenerator.forBlock[name] = (block: Blockly.Block, generator: JavascriptGenerator) => {
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
                let fn = arg.type.type as unknown as FuncType;
                let code = "(";
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
                code += "}";
                args.push(code);
            } break;
            }
        }
        return `${name}(${args.join(", ")});\n`;
    };
}

function addGlobalSimpleBlock(blocks: BlockDefinition[], name: string, type: string) {
    const block: BlockDefinition = {
        type: name,
        init: (bloc) => {
            bloc.appendDummyInput()
                .appendField(name);
            bloc.setOutput(true, type);
            bloc.setColour("404040");
        }
    };
    blocks.push(block);

    javascriptGenerator.forBlock[name] = (block: Blockly.Block, generator: JavascriptGenerator) => {
        return `(${name})`;
    };
}

function addGlobalVariableBlock(blocks: BlockDefinition[], var_: Var) {
    switch (var_.type.kind) {
    case "simple":
        addGlobalSimpleBlock(blocks, var_.name, var_.type.type as string);
        break;
    case "object":
        addGlobalObjectBlock(blocks, var_.type.type as ObjectType, var_.name);
        break;
    default:
        throw new Error("Unsupported variable type: " + var_.type.kind);
    }
}

function addGlobalObjectBlock(blocks: BlockDefinition[], obj: ObjectType, prefix = "") {
    for (let prop of obj.properties) {
        switch (prop.type.kind) {
        case "function":
            console.log(prop.type);
            addGlobalFunctionBlock(blocks, {
                name: prefix + "." + prop.name,
                type: prop.type.type as FuncType
            });
            break;
        case "simple":
            addGlobalVariableBlock(blocks, {
                name: prefix + "." + prop.name,
                type: prop.type
            });
            break;
        default:
            throw new Error("Unsupported property type: " + prop.type.kind);
        }
    }
}

function getModule(node: ts.ModuleDeclaration): Module {
    if (node.name === undefined) {
        throw new Error("Module has no name");
    }
    if (node.body === undefined) {
        throw new Error("Module has no body");
    }
    if (node.body.kind !== ts.SyntaxKind.ModuleBlock) {
        throw new Error("Module body is not a block");
    }

    const name = node.name.text;
    const members: Var[] = [];
    node.body.statements.forEach((member) => {
        if (member.kind === ts.SyntaxKind.VariableStatement) {
            members.push(getVariable(member as ts.VariableStatement));
        }
        else if (member.kind === ts.SyntaxKind.FunctionDeclaration) {
            console.log(member);
            const func = getFunction(member as ts.FunctionDeclaration);
            members.push({
                name: func.name,
                type: { kind: "function", type: func.type }
            });
        }
    });

    return { name, members };
}

function addModuleBlock(blocks: BlockDefinition[], mod: Module, name: string) {
    for (let member of mod.members) {
        switch (member.type.kind) {
        case "function":
            addGlobalFunctionBlock(blocks, {
                name: name + "." + member.name,
                type: member.type.type as FuncType
            });
            break;
        case "object":
            addGlobalObjectBlock(blocks, member.type.type as ObjectType, name + "." + member.name);
            break;
        default:
            throw new Error("Unsupported member type: " + member.type.kind);
        }
    }
}

export function getBlocks(dts: string): BlockDefinition[] {
    console.log(dts);
    const ast = getAst(dts);

    const blocks: BlockDefinition[] = [];

    ast.forEachChild((node) => {
        if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
            const func = getFunction(node as ts.FunctionDeclaration);
            addGlobalFunctionBlock(blocks, func);
        }
        else if (node.kind  === ts.SyntaxKind.VariableStatement) {
            const vars = getVariable(node as ts.VariableStatement);
            addGlobalVariableBlock(blocks, vars);
        }
        else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            const mod = getModule(node as ts.ModuleDeclaration);
            addModuleBlock(blocks, mod, mod.name);
        }
        else {
            console.log("Unsupported node: " + ts.SyntaxKind[node.kind]);
        }
    });

    return blocks;
}
