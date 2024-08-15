import React, { Component } from "react";
import { Pane } from "./types";

export interface NavigationBarProps {
    onPaneChange: (pane: Pane) => void;
}


export class NavigationBar extends Component<NavigationBarProps> {
    render() {
        return (
            <div className="navigation-bar">
                <button className="pane-select-button" onClick={ () => this.props.onPaneChange(Pane.Blocks) }>Blocks</button>
                <button className="pane-select-button" onClick={ () => this.props.onPaneChange(Pane.Text) }>Text</button>
            </div>
        );
    }
}
