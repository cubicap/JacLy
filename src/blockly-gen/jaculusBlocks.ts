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

const gpioDts = `
declare module "gpio" {
    type Mode = number;

    const PinMode: {
        readonly DISABLE: Mode,
        readonly OUTPUT: Mode,
        readonly INPUT: Mode,
        readonly INPUT_PULLUP: Mode,
        readonly INPUT_PULLDOWN: Mode,
    };

    interface EventInfo {
        timestamp: Timestamp;
    }

    /**
     * Configure the given pin.
     * @param pin The pin to configure.
     * @param mode The mode to configure the pin in.
     */
    function pinMode(pin: number, mode: Mode): void;

    /**
     * Write digital value to the given pin.
     * @param pin The pin to write to.
     * @param value The value to write.
     */
    function write(pin: number, value: number): void;

    /**
     * Read digital value from the given pin.
     * @param pin The pin to read from.
     * @returns The value of the pin (0 or 1).
     */
    function read(pin: number): number;

    /**
     * Set event handler for the given pin.
     * @param event The event to handle.
     * @param pin The pin to handle the event for.
     * @param callback The callback to call when the event occurs.
     */
    function on(event: "rising" | "falling" | "change", pin: number, callback: (info: EventInfo) => void): void;

    /**
     * Remove event handler for the given pin.
     * @param event The event to remove.
     * @param pin The pin to remove the event handler for.
     */
    function off(event: "rising" | "falling" | "change", pin: number): void;
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

const simpleRadioDts = `
declare module "simpleradio" {

    interface PacketInfo {
        group: number;
        address: string;
        rssi: number;
    }

    /**
     * Initialize the radio.
     * @param group The radio group to use.
     */
    function begin(group: number): void;

    /**
     * Set the radio group.
     * @param group The radio group to use, between 0 and 15 inclusive.
     */
    function setGroup(group: number): void;

    /**
     * Get current radio group
     * @returns ID of the current group
     */
    function group(): number;

    /**
     * Get the local device address.
     * @returns the local device address. Only works after begin() is called.
     */
    function address(): string;

    /**
     * Send a string.
     * @param str The string to send.
     */
    function sendString(str: string): void;

    /**
     * Send a number.
     * @param num The number to send.
     */
    function sendNumber(num: number): void;

    /**
     * Send a key-value pair.
     * @param key The key to send.
     * @param value The number to send.
     */
    function sendKeyValue(key: string, value: number): void;

    /**
     * Register a callback for a packet type.
     * @param type The packet type to register for.
     * @param callback The callback to register.
     */
    function on(type: "number", callback: (num: number, info: PacketInfo) => void): void;

    /**
     * Register a callback for a packet type.
     * @param type The packet type to register for.
     * @param callback The callback to register.
     */
    function on(type: "string", callback: (str: string, info: PacketInfo) => void): void;

    /**
     * Register a callback for a packet type.
     * @param type The packet type to register for.
     * @param callback The callback to register.
     */
    function on(type: "keyvalue", callback: (key: string, value: number, info: PacketInfo) => void): void;

    /**
     * Unregister a callback for a packet type.
     * @param type The packet type to unregister for.
     */
    function off(type: "number" | "string" | "keyvalue"): void;

    /**
     * Stop the radio.
     */
    function end(): void;
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

const miscDts = `
/**
 * Exits the current program.
 * @param code The exit code to use.
 */
declare function exit(code?: number): void;
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
            name: "GPIO",
            toolboxitemid: "gpio",
            colour: "#FFD500",
            blocks: getBlocks(gpioDts)
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
            name: "SimpleRadio",
            toolboxitemid: "simpleradio",
            colour: "#FFD500",
            blocks: getBlocks(simpleRadioDts)
        },
        {
            kind: "category",
            name: "Misc",
            toolboxitemid: "misc",
            colour: "#FFD500",
            blocks: getBlocks(miscDts)
        },
        { kind: "sep" },
        {
            kind: "category",
            name: "Imports",
            toolboxitemid: "imports",
            colour: "#FFD500",
            blocks: getImportBlocks()
        }
    ]);
}
