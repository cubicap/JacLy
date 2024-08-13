import React, { Component } from "react";
import { editor } from 'monaco-editor';
import Editor from "@monaco-editor/react";

export interface TextPaneProps {

}

export class TextPane extends Component<TextPaneProps> {
    private monacoEditor: editor.IStandaloneCodeEditor | null = null;


    getJS(): string {
        if (this.monacoEditor === null) {
            return '';
        }
        return this.monacoEditor.getValue();
    }

    setJS(code: string) {
        if (this.monacoEditor === null) {
            return;
        }
        this.monacoEditor.setValue(code);
    }

    render() {
        return (
            <Editor
                width="100%"
                height="100%"
                language="javascript"
                defaultValue="// Write your code here"
                theme="vs-dark"
                options={{
                    minimap: {
                        enabled: false
                    },
                    readOnly: true
                }}
                onMount={ (editor, monaco) => { this.monacoEditor = editor; } }
            />
        );
    }
};
