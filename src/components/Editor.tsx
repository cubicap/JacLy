import React, { Component, RefObject } from "react";
import { BlocklyPane } from "./BlocklyPane";
import { TextPane } from "./TextPane";
import { Pane } from "./types";
import { ReduceRate } from "../debounce";


export class State {
    pane: Pane;
    content: string;

    constructor(pane: Pane, content: string) {
        this.pane = pane;
        this.content = content;
    }

    toString() {
        return JSON.stringify(this);
    }

    static fromString(str: string) {
        let obj = JSON.parse(str);
        return new State(obj.pane, obj.content);
    }
}


export interface EditorProps {  // eslint-disable-line @typescript-eslint/no-empty-interface
    onChange?: (state: State) => void;
    initialState?: State;
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
            currentPane: this.props.initialState?.pane ?? Pane.Blocks
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
                <div className="editor-pane" style={{ display: this.state.currentPane === Pane.Text ? undefined : "none" }} >
                    <TextPane ref={this.textEditor} onChange={ (code) => this.props.onChange?.(new State(Pane.Text, code)) } defaultValue={ this.props.initialState?.pane === Pane.Text ? this.props.initialState.content : undefined } />
                </div>
                <div className="editor-pane" style={{ display: this.state.currentPane === Pane.Blocks ? undefined : "none" }} >
                    <BlocklyPane ref={this.blocklyEditor} onChange={ (code) => this.props.onChange?.(new State(Pane.Blocks, code)) } defaultJson={ this.props.initialState?.pane === Pane.Blocks ? this.props.initialState.content : undefined } />
                </div>
            </div>
        );
    }
}
