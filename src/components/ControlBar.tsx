import { Component } from "react";

export interface ControlBarProps {
    onConnect?: () => void;
    onDisconnect?: () => void;
    getCode(): Promise<string>;
}


export class ControlBar extends Component<ControlBarProps> {
    connected: boolean = false;
    port: SerialPort | null = null;

    connect() {
        this.connected = true;

        let port = navigator.serial.requestPort();
        port.then((port) => {
            this.port = port;
            this.port.open({ baudRate: 921600 });  // TODO: make this configurable
            this.forceUpdate();
            this.props.onConnect?.call(this);
        })
        .catch((err) => {
            alert('Failed to connect to serial port: ' + err);
        });
    }

    disconnect() {
        this.connected = false;
        this.port?.close();

        this.props.onDisconnect?.call(this);
        this.forceUpdate();
    }

    private uploading: boolean = false;
    async upload() {
        if (this.uploading) {
            return;
        }
        this.uploading = true;
        try {
            await (async () => {
                let code = await this.props.getCode.call(this);
                console.log('Uploading code: ' + code);
            })();
        } catch (e) {
            alert('Failed to upload code: ' + e);
        }
        this.uploading = false;
    }

    getContent() {
        if (this.connected) {
            return (
                <div className="control-connected">
                    <button onClick={ () => this.disconnect() } className='connected-button'>Disconnect</button>
                    <button onClick={ () => this.upload() } className='connected-button'>Upload</button>
                </div>
            );
        }
        return (
            <div className="control-disconnected">
                <button onClick={ () => this.connect() } className='disconnected-button'>Connect</button>
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
