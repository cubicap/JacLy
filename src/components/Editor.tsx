import React, { Component, RefObject } from "react";
import { BlocklyPane } from "./BlocklyPane";
import { TextPane } from "./TextPane";
import { Pane } from "./types";
import { ReduceRate } from "../debounce";


export interface EditorProps {  // eslint-disable-line @typescript-eslint/no-empty-interface

}

interface EditorState {
    currentPane: Pane;
}

export class Editor extends Component<EditorProps> {
    private textEditor: RefObject<TextPane>;
    private blocklyEditor: RefObject<BlocklyPane>;
    public state: EditorState;

    private resizeDebounce: ReduceRate;

    constructor(props: EditorProps) {
        super(props);
        this.textEditor = React.createRef();
        this.blocklyEditor = React.createRef();
        this.state = {
            currentPane: Pane.Blocks
        };
        this.resizeDebounce = new ReduceRate(() => this._doResize(), 5);
    }

    selectPane(pane: Pane) {
        if (this.state.currentPane === pane) {
            return;
        }

        this.setState({
            currentPane: pane
        });

        if (pane === Pane.Text) {
            let code = this.blocklyEditor.current?.getJS();
            if (code === undefined) {
                code = "";
            }
            this.textEditor.current?.setJS(code);
        } else {
            // TODO: update blockly editor
        }
    }

    getJS(): string {
        if (this.state.currentPane === Pane.Text) {
            if (this.textEditor.current === null) {
                return "";
            }
            return this.textEditor.current.getJS();
        } else {
            if (this.blocklyEditor.current === null) {
                return "";
            }
            return this.blocklyEditor.current.getJS();
        }
    }

    resize() {
        this.resizeDebounce.call();
    }

    _doResize() {
        if (this.state.currentPane === Pane.Text) {
            // this.textEditor.current?.resize();
        } else {
            this.blocklyEditor.current?.resize();
        }
    }

    render() {
        return (
            <div className="editor">
                <div className="editor-pane" style={{ display: this.state.currentPane === Pane.Text ? undefined : "none" }} > <TextPane ref={this.textEditor} /> </div>
                <div className="editor-pane" style={{ display: this.state.currentPane === Pane.Blocks ? undefined : "none" }} > <BlocklyPane ref={this.blocklyEditor} /> </div>
            </div>
        );
    }
}
