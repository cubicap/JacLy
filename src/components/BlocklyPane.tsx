import React, { Component } from "react";
import { BlocklyWorkspace, WorkspaceSvg } from "react-blockly";
import { javascriptGenerator } from "blockly/javascript";
import { svgResize } from "blockly";
import { getJaculusToolbos as getJaculusToolbox } from "../blockly-gen/jaculusBlocks";

export interface BlocklyPaneProps {  // eslint-disable-line @typescript-eslint/no-empty-interface

}

const toolbox = getJaculusToolbox();
const defaultJson = "{}";

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
