import { Component } from "react";
import { JacDevice } from "../jac-tools/device/jacDevice";
import { WebSerialStream } from "../webSerialStream";
import { Buffer } from "buffer";

export interface ControlBarProps {
    onConnect?: (device: JacDevice) => void;
    onDisconnect?: () => void;
    getCode(): Promise<string>;
}


export class ControlBar extends Component<ControlBarProps> {
    connected = false;
    device: JacDevice | null = null;

    connect() {
        this.connected = true;

        let port = navigator.serial.requestPort();
        port.then(async (port) => {
            await port.open({ baudRate: 921600, bufferSize: 10240 });  // TODO: make this configurable

            let stream = new WebSerialStream(port);
            this.device = new JacDevice(stream);

            this.forceUpdate();
            this.props.onConnect?.call(this, this.device);
        });
    }

    async disconnect() {
        this.props.onDisconnect?.call(this);

        this.connected = false;
        await this.device?.destroy();
        this.forceUpdate();
    }

    async version() {
        if (!this.connected || !this.device) {
            return;
        }

        try {
            let version = await this.device.controller.version();
            alert("Version: " + version);
        } catch (e) {
            alert("Failed to get version: " + e);
        }
    }

    private uploading = false;
    async upload() {
        if (this.uploading) {
            return;
        }
        if (!this.connected || !this.device) {
            return;
        }
        let device = this.device;
        this.uploading = true;
        // try {
        await (async () => {
            let code = await this.props.getCode.call(this);
            console.log("Uploading code: " + code);

            await device.controller.lock().catch((err) => {
                console.log("Error locking device: " + err + "\n");
            });

            await device.controller.stop().catch((err) => {
                console.log("Error stopping device: " + err);
            });

            const cmd = await device.uploader.writeFile("code/index.js", Buffer.from(code, "utf-8")).catch((err) => {
                throw new Error("Error uploading: " + err);
            });
            console.log(cmd.toString() + "\n");

            await device.controller.start("index.js").catch((err) => {
                throw new Error("Error starting program: " + err);
            });

            await device.controller.unlock().catch((err) => {
                throw new Error("Error unlocking device: " + err);
            });
        })();
        // }
        this.uploading = false;
    }

    getContent() {
        if (this.connected) {
            return (
                <div className="control-connected">
                    <button onClick={ () => this.disconnect() } className="connected-button">Disconnect</button>
                    <button onClick={ () => this.upload() } className="connected-button">Upload</button>
                    <button onClick={ () => this.version() } className="connected-button">Version</button>
                </div>
            );
        }
        return (
            <div className="control-disconnected">
                <button onClick={ () => this.connect() } className="disconnected-button">Connect</button>
            </div>
        );
    }

    render() {
        return (
            <div className="control-bar">
                { this.getContent() }
            </div>
        );
    }
}
