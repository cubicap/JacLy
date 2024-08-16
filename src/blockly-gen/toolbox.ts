import { CustomCategory, ToolboxEntries } from "./types";
import * as Blockly from "blockly/core";

export function createToolbox(customEntries?: ToolboxEntries) {
    let toolbox = {
        kind: "categoryToolbox",
        contents: [
            {  // loops
                kind: "category",
                name: "Loops",
                toolboxitemid: "loops",
                colour: "#57834b",
                contents: [
                    {
                        kind: "block",
                        type: "controls_repeat_ext"
                    },
                    {
                        kind: "block",
                        type: "controls_whileUntil"
                    },
                    {
                        kind: "block",
                        type: "controls_for"
                    },
                    {
                        kind: "block",
                        type: "controls_forEach"
                    },
                    {
                        kind: "block",
                        type: "controls_flow_statements"
                    }
                ]
            },
            {  // logic
                kind: "category",
                name: "Logic",
                toolboxitemid: "logic",
                colour: "#496682",
                contents: [
                    {
                        kind: "block",
                        type: "logic_boolean"
                    },
                    {
                        kind: "block",
                        type: "controls_if"
                    },
                    {
                        kind: "block",
                        type: "controls_ifelse"
                    },
                    {
                        kind: "block",
                        type: "logic_compare"
                    },
                    {
                        kind: "block",
                        type: "logic_operation"
                    },
                    {
                        kind: "block",
                        type: "logic_negate"
                    },
                    {
                        kind: "block",
                        type: "logic_ternary"
                    }
                ]
            },
            {  // math
                kind: "category",
                name: "Math",
                toolboxitemid: "math",
                colour: "#475180",
                contents: [
                    {
                        kind: "block",
                        type: "math_number"
                    },
                    {
                        kind: "block",
                        type: "math_arithmetic"
                    },
                    {
                        kind: "block",
                        type: "math_single"
                    },
                    {
                        kind: "block",
                        type: "math_trig"
                    },
                    {
                        kind: "block",
                        type: "math_constant"
                    },
                    {
                        kind: "block",
                        type: "math_number_property"
                    },
                    {
                        kind: "block",
                        type: "math_change"
                    },
                    {
                        kind: "block",
                        type: "math_round"
                    },
                    {
                        kind: "block",
                        type: "math_on_list"
                    },
                    {
                        kind: "block",
                        type: "math_constrain"
                    },
                    {
                        kind: "block",
                        type: "math_random_int"
                    },
                    {
                        kind: "block",
                        type: "math_random_float"
                    }
                ]
            },
            {  // lists
                kind: "category",
                name: "Lists",
                toolboxitemid: "lists",
                colour: "#5c4881",
                contents: [
                    {
                        kind: "block",
                        type: "lists_create_empty"
                    },
                    {
                        kind: "block",
                        type: "lists_reverse"
                    },
                    {
                        kind: "block",
                        type: "lists_isEmpty"
                    },
                    {
                        kind: "block",
                        type: "lists_length"
                    }
                ]
            },
            {  // variables
                kind: "category",
                name: "Variables",
                toolboxitemid: "variables",
                colour: "#a55b80",
                contents: [
                    {
                        kind: "block",
                        type: "variables_get"
                    },
                    {
                        kind: "block",
                        type: "variables_set"
                    }
                ]
            },
            {  // procedures
                kind: "category",
                name: "Procedures",
                toolboxitemid: "procedures",
                colour: "#7a4881",
                custom: "PROCEDURE"
            },
            {  // text
                kind: "category",
                name: "Text",
                toolboxitemid: "text",
                colour: "#498374",
                contents: [
                    {
                        kind: "block",
                        type: "text"
                    },
                    {
                        kind: "block",
                        type: "text_join"
                    },
                    {
                        kind: "block",
                        type: "text_append"
                    },
                    {
                        kind: "block",
                        type: "text_length"
                    },
                    {
                        kind: "block",
                        type: "text_isEmpty"
                    },
                    {
                        kind: "block",
                        type: "text_indexOf"
                    },
                    {
                        kind: "block",
                        type: "text_charAt"
                    }
                ]
            },
            { kind: "sep" }
        ]
    };

    if (!customEntries) {
        return toolbox;
    }

    for (let entry of customEntries) {
        switch (entry.kind) {
        case "category": {
            let category = entry as unknown as CustomCategory;
            toolbox.contents.push({
                kind: "category",
                name: category.name,
                toolboxitemid: category.toolboxitemid,
                colour: category.colour,
                contents: category.blocks.map(block => ({
                    kind: "block",
                    type: block.type
                }))
            });
            for (let block of category.blocks) {
                Blockly.Blocks[block.type] = {
                    init: function() { block.init(this as unknown as Blockly.Block); }
                };
            }
        } break;
        case "sep":
            toolbox.contents.push({ kind: "sep" });
            break;
        }
    }

    return toolbox;
}
