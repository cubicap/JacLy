import React, { Component } from "react";
import { editor } from "monaco-editor";
import Editor from "@monaco-editor/react";

export interface TextPaneProps {  // eslint-disable-line @typescript-eslint/no-empty-interface
    onChange?: (code: string) => void;
    defaultValue?: string;
}

export class TextPane extends Component<TextPaneProps> {
    private monacoEditor: editor.IStandaloneCodeEditor | null = null;
    private disableOnChange: boolean = false;


    getJS(): string {
        if (this.monacoEditor === null) {
            return "";
        }
        return this.monacoEditor.getValue();
    }

    setJS(code: string, raiseOnChange: boolean = false) {
        if (this.monacoEditor === null) {
            return;
        }
        this.disableOnChange = !raiseOnChange;
        this.monacoEditor.setValue(code);
        this.disableOnChange = false;
    }

    raiseOnChange(value: string | undefined) {
        if (this.disableOnChange) {
            return;
        }
        this.props.onChange?.(value ?? "");
    }

    render() {
        return (
            <Editor
                width="100%"
                height="100%"
                language="javascript"
                defaultValue={ this.props.defaultValue ?? "// Write your code here" }
                theme="vs-dark"
                options={{
                    minimap: {
                        enabled: false
                    },
                    readOnly: true
                }}
                onMount={ (editor) => { this.monacoEditor = editor; } }
                onChange={ (value) => { this.raiseOnChange(value); } }
            />
        );
    }
}
