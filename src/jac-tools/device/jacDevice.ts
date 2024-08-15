import { Mux } from "../link/mux";
import { Duplex } from "../link/stream";
import {
    MuxOutputPacketCommunicator, MuxInputPacketCommunicator,
    MuxOutputStreamCommunicator, MuxInputStreamCommunicator
} from "../link/muxCommunicator";
import { Uploader } from "./uploader";
import { Controller } from "./controller";
import { CobsEncoder } from "../link/encoders/cobs";


export class JacDevice {
    private _mux: Mux;

    public programOutput: MuxInputStreamCommunicator;
    public programInput: MuxOutputStreamCommunicator;
    public programError: MuxInputStreamCommunicator;

    public errorOutput: MuxInputStreamCommunicator;
    public logOutput: MuxInputStreamCommunicator;
    public debugOutput: MuxInputStreamCommunicator;

    public controller: Controller;
    public uploader: Uploader;

    public constructor(connection: Duplex) {
        this._mux = new Mux(CobsEncoder, connection);

        this.programOutput = new MuxInputStreamCommunicator(this._mux, 16);
        this.programInput = new MuxOutputStreamCommunicator(this._mux, 16);
        this.programError = new MuxInputStreamCommunicator(this._mux, 17);

        this.errorOutput = new MuxInputStreamCommunicator(this._mux, 255);
        this.logOutput = new MuxInputStreamCommunicator(this._mux, 253);
        this.debugOutput = new MuxInputStreamCommunicator(this._mux, 251);

        this.controller = new Controller(
            new MuxInputPacketCommunicator(this._mux, 0),
            new MuxOutputPacketCommunicator(this._mux, 0)
        );

        this.uploader = new Uploader(
            new MuxInputPacketCommunicator(this._mux, 1),
            new MuxOutputPacketCommunicator(this._mux, 1)
        );

        this._mux.start();
    }

    public onError(callback: (err: any) => void): void {
        this._mux.onError(callback);
    }

    public onEnd(callback: () => void): void {
        this._mux.onEnd(callback);
    }

    public async destroy(): Promise<void> {
        try {
            await this.controller.unlock();
        } catch (e) {
            console.error("Failed to unlock controller: " + e);
        }
        return this._mux.destroy();
    }
}
