import React, { Component } from "react";

export interface ConsoleProps {  // eslint-disable-line @typescript-eslint/no-empty-interface

}

export class Console extends Component<ConsoleProps> {
    private console: React.RefObject<HTMLDivElement>;

    constructor(props: ConsoleProps) {
        super(props);
        this.console = React.createRef();
    }

    write(text: string) {
        if (this.console.current === null) {
            return;
        }
        this.console.current.innerHTML += text.replace(/\n/g, "<br>");
    }

    render() {
        return (
            <div className="console" ref={ this.console }> </div>
        );
    }
}
