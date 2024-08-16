import * as Blockly from "blockly";
import { BlockDefinition } from "./types";
import { javascriptGenerator, JavascriptGenerator } from "blockly/javascript";




function createStarImportBlock(name: string): BlockDefinition {
    let blockName = `import_${name}`;
    javascriptGenerator.forBlock[blockName] = (block: Blockly.Block, generator: JavascriptGenerator) => {
        return `import * as ${name} from "${name}";\n`;
    };

    return {
        type: blockName,
        init(bloc: Blockly.Block) {
            bloc.appendDummyInput()
                .appendField(`import * as ${name} from "${name}"`);
            bloc.setColour(160);
            bloc.setNextStatement(true);
            bloc.setPreviousStatement(true);
        }
    };
}


export function getImportBlocks(): BlockDefinition[] {
    return [
        createStarImportBlock("adc"),
        createStarImportBlock("gpio"),
        createStarImportBlock("i2c"),
        createStarImportBlock("ledc"),
        createStarImportBlock("simpleradio"),
        createStarImportBlock("wifi")
    ];
}
