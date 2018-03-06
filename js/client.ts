import "object.entries";
import $ from "jquery";
import {DEFAULT_EDGE_PROPS, Node, Painting, PaintingOpts} from "./painting";

interface PointLike {
    readonly x: number,
    readonly y: number
}

class Point implements PointLike {
    static from(pl: PointLike) {
        if (pl instanceof Point) {
            return pl;
        }
        return new Point(pl.x, pl.y);
    }

    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(p: PointLike) {
        return new Point(this.x + p.x, this.y + p.y);
    }

    rotate(theta: number) {
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        return new Point(
            this.x * cos + this.y * sin,
            -this.x * sin + this.y * cos
        );
    }

    modify(func: (p: Point) => PointLike): Point {
        return Point.from(func(this));
    }

    distance(p: Point): number {
        const dx = p.x - this.x;
        const dy = p.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Assuming a line from p1 -> p2, does that line move p1 over this point?
     * Note that this doesn't test if it hits, just if it breaks the axis-aligned lines.
     */
    wasPassed(p1: Point, p2: Point): boolean {
        const oldDx = p1.x - this.x;
        const oldDy = p1.y - this.y;
        const newDx = p2.x - this.x;
        const newDy = p2.y - this.y;
        return Math.sign(oldDx) !== Math.sign(newDx) ||
            Math.sign(oldDy) !== Math.sign(newDy);
    }
}

class ArtTarget {
    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(element: HTMLCanvasElement) {
        this.element = element;
        const ctx = element.getContext("2d");
        if (ctx === null) {
            throw new Error("No 2D context!");
        }
        this.context = ctx;
    }

    private waveInfo(p1: Point, p2: Point, numWaves: number): {
        theta: number, step: number, target: number
    } {
        const theta = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const dist = p2.distance(p1);
        const step = dist / numWaves;

        return {
            theta: theta,
            step: step,
            target: dist
        };
    }

    display(painting: Painting) {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
        painting.nodes.forEach(node => {
            this.context.strokeStyle = node.color;
            this.context.beginPath();
            this.context.arc(node.x, node.y, 3, 0, Math.PI * 2);
            this.context.stroke();
        });
        painting.computeDistinctEdges().forEach((n2, n1, edgeProperties = DEFAULT_EDGE_PROPS) => {
            this.context.save();
            let lg = this.context.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
            lg.addColorStop(0, n1.color);
            lg.addColorStop(1, n2.color);
            this.context.strokeStyle = lg;
            this.context.beginPath();
            this.context.moveTo(n1.x, n1.y);
            // wave factor controls how many waves there are
            // and the extent to which they go
            const wf = edgeProperties.waveFactor;
            const waveHeight = wf * 50;
            const numWaves = (wf * 20) + 1;
            const p1 = Point.from(n1);
            const p2 = Point.from(n2);

            const wi = this.waveInfo(p1, p2, numWaves);
            this.context.translate(p1.x, p1.y);
            this.context.rotate(wi.theta);
            const target = wi.target;
            let nextPoint = 0;

            for (let i = 0; i < numWaves; i++) {
                const old = nextPoint;
                nextPoint += wi.step;
                if (old < target !== nextPoint < target) {
                    nextPoint = target;
                    const even = i % 2 === 0;
                    i = numWaves;
                    if (even !== (i % 2 == 0)) {
                        i++;
                    }
                }
                const dist = nextPoint - old;


                let offMult = i % 2 === 0 ? -1 : 1;
                this.context.quadraticCurveTo(old + dist / 2, offMult * waveHeight, nextPoint, 0);
            }
            this.context.stroke();
            this.context.restore();
        });
    }
}

function makeTargets(count: number): ArtTarget[] {
    const $targets = $("#targets");
    const targets: ArtTarget[] = [];
    for (let i = 0; i < count; i++) {
        const holder = document.createElement("div");
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        canvas.style.width = "320px";
        canvas.style.height = "240px";

        canvas.className = "gallery-slot";
        holder.className = "col-md-3 p-2 d-flex align-content-center justify-content-center";
        $targets.append(holder);
        holder.appendChild(canvas);

        targets.push(new ArtTarget(canvas));
    }
    return targets;
}

const paintingOpts: PaintingOpts = {
    numNodes: 20,
    waveFactorRange: {min: 0.01, max: 0.3}
};

$(() => {
    const targets = makeTargets(4 * 3);

    function newGallery() {
        targets.forEach(t => t.display(Painting.generate(paintingOpts)));
    }

    newGallery();
    setInterval(newGallery, 5000);
});
