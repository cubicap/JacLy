import React, { Component, RefObject } from "react";
import { Editor } from "./Editor";
import { NavigationBar } from "./NavigationBar";
import { ControlBar } from "./ControlBar";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import { Console } from "./Console";


export class Root extends Component {
    private editor: RefObject<Editor>;

    constructor(props: any) {
        super(props);
        this.editor = React.createRef();
    }

    async getJS() {
        if (this.editor.current === null) {
            throw new Error('Editor not initialized');
        }
        return this.editor.current.getJS();
    }

    render() {
        return <div className="root">
            <NavigationBar onPaneChange={ (pane) => this.editor.current?.selectPane(pane) } />
            <ReflexContainer className="pane-view" orientation="vertical">
                <ReflexElement minSize={100} flex={4} onResize={ () => this.editor.current?.resize() }>
                    <Editor ref={this.editor} />
                </ReflexElement>
                <ReflexSplitter className="splitter" />
                <ReflexElement minSize={100} flex={1}>
                    <Console />
                </ReflexElement>
            </ReflexContainer>
            <ControlBar getCode={ () => { return this.getJS(); } } />
        </div>;
    }
}
