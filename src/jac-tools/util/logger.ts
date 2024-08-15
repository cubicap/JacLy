export const logger = {
    error: (message: string) => console.error(message),
    info: (message: string) => console.log(message),
    verbose: (message: string) => console.debug(message),
    debug: (message: string) => console.debug(message),
    silly: (message: string) => console.debug(message),
};
