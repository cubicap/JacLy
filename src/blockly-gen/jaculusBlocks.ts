import { getCoreBlocks } from "./coreBlocks";
import { getBlocks } from "./genBlocks";
import { getImportBlocks } from "./importBlocks";
import { createToolbox } from "./toolbox";


const adcDts = `
declare module "adc" {
    type Atten = number;

    const Attenuation: {
        readonly Db0: Atten;
        readonly Db2_5: Atten;
        readonly Db6: Atten;
        readonly Db11: Atten;
    };


    /**
     * Enable ADC on the given pin.
     * @param pin The pin to enable ADC on.
     */
    function configure(pin: number, attenuation?: Atten): void;

    /**
     * Read the value of the given pin.
     * @param pin The pin to read.
     * @returns The value of the pin (0-1023)
     */
    function read(pin: number): number;
}
`;

const consoleDts = `
declare const console: {
    debug(arg: any): void;
    log(arg: any): void;
    warn(arg: any): void;
    info(arg: any): void;
    error(arg: any): void;
}
`;

const ledcDts = `
declare module "ledc" {
    /**
     * Configure the given timer.
     * @param timer The timer to configure.
     * @param frequency The frequency to configure the timer to.
     * @param resolution The resolution to configure the timer to (default 10 bits, changes frequency range)
     */
    function configureTimer(timer: number, frequency: number, resolution?: number): void;

    /**
     * Configure the given LEDC channel.
     * @param channel The channel to configure.
     * @param pin The pin to configure the channel to.
     * @param timer The timer to configure the channel to.
     * @param duty The duty to configure the channel to (0-1023).
     */
    function configureChannel(channel: number, pin: number, timer: number, duty: number): void;

    /**
     * Set the frequency of the given timer.
     * @param timer The timer to set the frequency of.
     * @param frequency The frequency to set the timer to.
     */
    function setFrequency(timer: number, frequency: number): void;

    /**
     * Set the duty of the given channel.
     * @param channel The channel to set the duty of.
     * @param duty The duty to set the channel to (0-1023).
     */
    function setDuty(channel: number, duty: number): void;

    /**
     * Stop the given timer.
     * @param timer The timer to stop.
     */
    function stopTimer(timer: number): void;

    /**
     * Stop the given channel.
     * @param channel The channel to stop.
     */
    function stopChannel(channel: number): void;
}
`;

const timerDts = `
/**
 * Returns a promise that resolves after the specified time.
 * @param ms The number of milliseconds to wait before resolving the promise.
 */
declare function sleep(ms: number): Promise<void>;

/**
 * Calls a function after the specified time.
 * @param callback The function to call.
 * @param ms The number of milliseconds to wait before calling the function.
 */
declare function setTimeout(callback: () => void, ms: number): number;

/**
 * Calls a function repeatedly, with a fixed time delay between each call.
 * @param callback The function to call.
 * @param ms The number of milliseconds to wait before calling the function.
 */
declare function setInterval(callback: () => void, ms: number): number;

/**
 * Cancels a timeout previously established by calling setTimeout().
 * @param id The identifier of the timeout to cancel.
 */
declare function clearTimeout(id: number): void;

/**
 * Cancels a timeout previously established by calling setInterval().
 * @param id The identifier of the interval to cancel.
 */
declare function clearInterval(id: number): void;
`;


export function getJaculusToolbos() {
    return createToolbox([
        {
            kind: "category",
            name: "Util",
            toolboxitemid: "util",
            colour: "#FFD500",
            blocks: getCoreBlocks()
        },
        { kind: "sep" },
        {
            kind: "category",
            name: "Time",
            toolboxitemid: "time",
            colour: "#FFD500",
            blocks: getBlocks(timerDts)
        },
        {
            kind: "category",
            name: "Console",
            toolboxitemid: "console",
            colour: "#FFD500",
            blocks: getBlocks(consoleDts)
        },
        {
            kind: "category",
            name: "ADC",
            toolboxitemid: "adc",
            colour: "#FFD500",
            blocks: getBlocks(adcDts)
        },
        {
            kind: "category",
            name: "LEDC",
            toolboxitemid: "ledc",
            colour: "#FFD500",
            blocks: getBlocks(ledcDts)
        },
        {
            kind: "category",
            name: "Imports",
            toolboxitemid: "imports",
            colour: "#FFD500",
            blocks: getImportBlocks()
        }
    ]);
}
