import * as Blockly from "blockly";

export interface BlockDefinition {
    type: string;
    init: (bloc: Blockly.Block) => void;
}

export interface CustomCategory {
    kind: "category";
    name: string;
    toolboxitemid: string;
    colour: string;
    blocks: BlockDefinition[];
}

export interface Separator {
    kind: "sep";
}

export type ToolboxEntries = (CustomCategory | Separator)[];
