export interface Range {
    min: number
    max: number
}

export function randInt(min: number, max: number): number;
export function randInt(range: Range): number;

export function randInt(minOrRange: number | Range, maxIn?: number): number {
    let randNumber = _rngImpl(minOrRange, maxIn);
    return Math.trunc(randNumber);
}

export function randNumber(min: number, max: number): number;
export function randNumber(range: Range): number;

export function randNumber(minOrRange: number | Range, maxIn?: number): any {
    return _rngImpl(minOrRange, maxIn)
}

function _rngImpl(minOrRange: number | Range, maxIn?: number): any {
    let max;
    let min;
    if (typeof minOrRange === "number") {
        if (typeof maxIn === "undefined") {
            throw new Error("Must provide max and min");
        }
        max = maxIn;
        min = minOrRange;
    } else {
        max = minOrRange.max;
        min = minOrRange.min;
    }
    return Math.random() * (max - min) + min;
}
