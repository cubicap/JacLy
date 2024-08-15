import { Duplex } from "./jac-tools/link/stream";
import { Buffer } from "buffer";


export class WebSerialStream implements Duplex {
    private callbacks: {
        "data"?: (data: Buffer) => void,
        "error"?: (err: any) => void,
        "end"?: () => void
    } = {};
    private port: SerialPort;
    private reader: ReadableStreamDefaultReader<Uint8Array>;
    private writer: WritableStreamDefaultWriter<Uint8Array>;

    constructor(port: SerialPort, ) {
        this.port = port;
        let reader = port.readable?.getReader();
        if (!reader) {
            throw new Error("No reader");
        }

        let writer = port.writable?.getWriter();
        if (!writer) {
            throw new Error("No writer");
        }

        this.reader = reader;
        this.writer = writer;

        this.runReader();
    }

    async runReader() {
        try {
            while (true) {  // eslint-disable-line no-constant-condition
                const { done, value } = await this.reader.read();
                if (done) {
                    this.reader.releaseLock();
                    if (this.callbacks["end"]) {
                        this.callbacks["end"]();
                    }
                    break;
                }
                if (this.callbacks["data"]) {
                    this.callbacks["data"](Buffer.from(value));
                }
            }
        }
        catch (err) {
            console.error("Reader error: " + err);
            if (this.callbacks["error"]) {
                this.callbacks["error"](err);
            }
        }
        console.log("Reader done");
    }

    public put(c: number): void {
        this.writer.write(Buffer.from([c]));
    }

    public write(buf: Buffer): void {
        const bufCopy = Buffer.from(buf);
        console.log("Writing: " + bufCopy.toString("hex"));
        this.writer.write(bufCopy);
    }

    public onData(callback?: (data: Buffer) => void): void {
        this.callbacks["data"] = callback;
    }

    public onEnd(callback?: () => void): void {
        this.callbacks["end"] = callback;
    }

    public onError(callback?: (err: any) => void): void {
        this.callbacks["error"] = callback;
    }

    public destroy(): Promise<void> {
        // TBA: Check API doc
        // if (this.port.state === "closed") {
        //     return Promise.resolve();
        // }

        return new Promise((resolve, reject) => {
            if (this.callbacks["end"]) {
                const end = this.callbacks["end"];
                this.callbacks["end"] = () => {
                    end();
                    resolve();
                };
            }
            else {
                this.callbacks["end"] = () => {
                    resolve();
                };
            }
            if (this.callbacks["error"]) {
                const error = this.callbacks["error"];
                this.callbacks["error"] = (err: any) => {
                    error(err);
                    reject(err);
                };
            }
            else {
                this.callbacks["error"] = (err: any) => {
                    reject(err);
                };
            }

            (async () => {
                console.log("closing stream");
                await this.reader.cancel();
                await this.writer.abort();
                await this.port.close();
            })();
        });
    }
}
