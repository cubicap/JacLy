import React, { Component } from "react";
import { BlocklyWorkspace, WorkspaceSvg } from "react-blockly";
import { javascriptGenerator } from "blockly/javascript";
import { svgResize } from "blockly";
import { getBlocks } from "../blockly-gen/genBlocks";
import { getToolbox } from "../blockly-gen/toolbox";
import { getCoreBlocks } from "../blockly-gen/coreBlocks";

export interface BlocklyPaneProps {  // eslint-disable-line @typescript-eslint/no-empty-interface

}


const timerDts = `
/**
 * Returns a promise that resolves after the specified time.
 * @param ms The number of milliseconds to wait before resolving the promise.
 */
declare function sleep(ms: number): Promise<void>;

/**
 * Calls a function after the specified time.
 * @param callback The function to call.
 * @param ms The number of milliseconds to wait before calling the function.
 */
declare function setTimeout(callback: () => void, ms: number): number;

/**
 * Calls a function repeatedly, with a fixed time delay between each call.
 * @param callback The function to call.
 * @param ms The number of milliseconds to wait before calling the function.
 */
declare function setInterval(callback: () => void, ms: number): number;

/**
 * Cancels a timeout previously established by calling setTimeout().
 * @param id The identifier of the timeout to cancel.
 */
declare function clearTimeout(id: number): void;

/**
 * Cancels a timeout previously established by calling setInterval().
 * @param id The identifier of the interval to cancel.
 */
declare function clearInterval(id: number): void;
`;

const consoleDts = `
declare const console: {
    debug(arg: any): void;
    log(arg: any): void;
    warn(arg: any): void;
    info(arg: any): void;
    error(arg: any): void;
}
`;

const defaultJson = "{}";
const toolbox = getToolbox([
    {
        kind: "category",
        name: "Util",
        toolboxitemid: "util",
        colour: "#FFD500",
        blocks: getCoreBlocks()
    },
    { kind: "sep" },
    {
        kind: "category",
        name: "Time",
        toolboxitemid: "time",
        colour: "#FFD500",
        blocks: getBlocks(timerDts)
    },
    {
        kind: "category",
        name: "Console",
        toolboxitemid: "console",
        colour: "#FFD500",
        blocks: getBlocks(consoleDts)
    }
]);
console.log(toolbox);

export class BlocklyPane extends Component<BlocklyPaneProps> {
    private blocklyEditor: React.RefObject<HTMLDivElement> = React.createRef();
    private blocklyArea: React.RefObject<HTMLDivElement> = React.createRef();
    private workspace: WorkspaceSvg | null = null;

    getJS(): string {
        try {
            if (!this.workspace) {
                return "";
            }
            let code = javascriptGenerator.workspaceToCode(this.workspace);
            return code;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }

    resize() {
        if (this.workspace) {
            svgResize(this.workspace);
        }
    }

    render() {
        return (
            <BlocklyWorkspace
                className="blockly-workspace"
                onWorkspaceChange={(workspace) => { this.workspace = workspace; }}
                workspaceConfiguration={{
                    renderer: "zelos",
                    grid: {
                        spacing: 20,
                        length: 3,
                        colour: "#ccc",
                        snap: true
                    },
                    zoom: {
                        controls: true,
                        wheel: true,
                        startScale: 1.0,
                        maxScale: 3,
                        minScale: 0.3,
                        scaleSpeed: 1.2
                    }
                }}
                toolboxConfiguration={toolbox}
                initialJson={{ defaultJson }}
            />
        );
    }
}
