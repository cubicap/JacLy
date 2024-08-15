import * as Blockly from "blockly";
import { BlockDefinition } from "./types";
import { javascriptGenerator, JavascriptGenerator } from "blockly/javascript";


export function getCoreBlocks(): BlockDefinition[] {
    javascriptGenerator.forBlock["exprStatement"] = (block: Blockly.Block, generator: JavascriptGenerator) => {
        let expr = generator.valueToCode(block, "expr", 0);
        if (block.getFieldValue("behaviour") === "await") {
            return `(await ${expr});\n`;
        }
        return `(${expr});\n`;
    };

    return [
        {
            type: "exprStatement",
            init(bloc: Blockly.Block) {
                bloc.appendValueInput("expr")
                    .setCheck(null)
                    .appendField(new Blockly.FieldDropdown([
                        ["await", "await"],
                        ["ignore", "ignore"]
                    ]), "behaviour");
                bloc.setColour(160);
                bloc.setNextStatement(true);
                bloc.setPreviousStatement(true);
            }
        }
    ];
}
