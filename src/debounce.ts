export class Debounce {
    private timeout: NodeJS.Timeout | null;
    private callback: () => void;
    private time: number;

    constructor(callback: () => void, time: number) {
        this.timeout = null;
        this.callback = callback;
        this.time = time;
    }

    public call() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.callback();
        }, this.time);
    }
};

export class ReduceRate {
    private timeout: NodeJS.Timeout | null;
    private callback: () => void;
    private time: number;

    constructor(callback: () => void, time: number) {
        this.timeout = null;
        this.callback = callback;
        this.time = time;
    }

    public call() {
        if (this.timeout !== null) {
            return;
        }

        this.timeout = setTimeout(() => {
            this.callback();
            this.timeout = null;
        }, this.time);
    }
}
