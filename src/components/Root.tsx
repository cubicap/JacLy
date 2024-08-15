import React, { Component, RefObject } from "react";
import { Editor } from "./Editor";
import { NavigationBar } from "./NavigationBar";
import { ControlBar } from "./ControlBar";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import { Console } from "./Console";
import { JacDevice } from "../jac-tools/device/jacDevice";


export class Root extends Component {
    private editor: RefObject<Editor>;
    private console: RefObject<Console>;
    private device: JacDevice | null = null;

    constructor(props: any) {
        super(props);
        this.editor = React.createRef();
        this.console = React.createRef();
    }

    async getJS() {
        if (this.editor.current === null) {
            throw new Error("Editor not initialized");
        }
        return this.editor.current.getJS();
    }

    startMonitor() {
        if (!this.device) {
            throw new Error("No device");
        }

        this.device.programOutput.onData((data: Buffer) => {
            this.console.current?.write(data.toString());
        });
        this.device.programError.onData((data: Buffer) => {
            this.console.current?.write(data.toString());
        });
    }

    stopMonitor() {
        if (!this.device) {
            throw new Error("No device");
        }
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
                    <Console ref={this.console} />
                </ReflexElement>
            </ReflexContainer>
            <ControlBar
                getCode={ () => { return this.getJS(); } }
                onConnect={ (device) => { this.device = device; this.startMonitor(); } }
                onDisconnect={ () => { this.stopMonitor(); this.device = null; } }
            />
        </div>;
    }
}
