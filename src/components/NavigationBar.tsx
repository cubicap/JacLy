import React, { Component } from "react";
import { Pane } from "./types";

export interface NavigationBarProps {
    onPaneChange: (pane: Pane) => void;
}


export class NavigationBar extends Component<NavigationBarProps> {
    render() {
        return (
            <div className="navigation-bar">
                <div className="navigation-bar-title">JacLy</div>
                <button className="pane-select-button" onClick={ () => this.props.onPaneChange(Pane.Blocks) }>Blocks</button>
                <button className="pane-select-button" onClick={ () => this.props.onPaneChange(Pane.Text) }>Text</button>
                <div className="nav-github-link">
                    <a href="https://github.com/cubicap/JacLy" target="_blank" rel="noopener noreferrer">View on GitHub</a>
                </div>
            </div>
        );
    }
}
