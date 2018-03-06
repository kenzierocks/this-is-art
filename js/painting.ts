import {Range, randInt, randNumber} from "./rand";

export class Node {
    color: string;
    x: number;
    y: number;

    constructor(color: string, x: number, y: number) {
        this.color = color;
        this.x = x;
        this.y = y;
    }
}

export interface EdgeProperties {
    waveFactor: number
}

export const DEFAULT_EDGE_PROPS: EdgeProperties = {
    waveFactor: 0
};

export class EdgeMap {
    _map: Map<Node, Set<Node>>;
    _edgeProperties: Map<Node, Map<Node, EdgeProperties>>;

    constructor(copySource?: EdgeMap) {
        this._map = new Map();
        this._edgeProperties = new Map();
        if (copySource) {
            copySource._map.forEach((v, k) => {
                this._map.set(k, new Set(v));
            });
            copySource._edgeProperties.forEach((v, k) => {
                this._edgeProperties.set(k, new Map(v));
            });
        }
    }

    getEdges(n1: Node): Set<Node> {
        return this._map.get(n1) || new Set();
    }

    getEdgeProperties(n1: Node, n2: Node): EdgeProperties | undefined {
        let valueMap = this._edgeProperties.get(n1);
        if (typeof valueMap === "undefined") {
            return undefined;
        }
        return valueMap.get(n2);
    }

    hasEdge(n1: Node, n2: Node): boolean {
        let valueSet = this._map.get(n1);
        if (typeof valueSet === "undefined") {
            return false;
        }
        return valueSet.has(n2);
    }

    addEdge(n1: Node, n2: Node, edgeProperties: EdgeProperties = DEFAULT_EDGE_PROPS) {
        let valueSet = this._map.get(n1);
        let propMap = this._edgeProperties.get(n1);
        if (typeof valueSet === "undefined") {
            valueSet = new Set<Node>();
            this._map.set(n1, valueSet);
        }
        if (typeof propMap === "undefined") {
            propMap = new Map();
            this._edgeProperties.set(n1, propMap);
        }
        valueSet.add(n2);
        propMap.set(n2, edgeProperties);
    }

    removeEdge(n1: Node, n2: Node) {
        let valueSet = this._map.get(n1);
        if (typeof valueSet === "undefined") {
            return;
        }
        valueSet.add(n2);
    }

    forEach(cb: (n2: Node, n1: Node, edgeProperties: EdgeProperties | undefined) => any) {
        this._map.forEach((valueSet, key) => {
            valueSet.forEach(value => {
                cb(value, key, this.getEdgeProperties(key, value));
            })
        });
    }
}


function linksPerNodeRangeGenerator(): Range {
    const values = [randInt(1, 6), randInt(1, 7)];
    values.sort();
    return {min: values[0], max: values[1]};
}

const COLORS = [
    "#80add7",
    "#0abda0",
    "#ebf2ea",
    "#d4dca9",
    "#bf9d7a",

    "#c0334d",
    "#d6618f",
    "#f3d4a0",
    "#f1931b",
    "#8f715b"
];

export interface PaintingOpts {
    numNodes?: number
    linksPerNodeRange?: Range
    waveFactorRange?: Range
    colors?: string[]
}

export class Painting {
    static generate(opts: PaintingOpts = {}): Painting {
        const numNodes = opts.numNodes || randInt(50, 100);
        const linksPerNodeRange = opts.linksPerNodeRange || linksPerNodeRangeGenerator();
        const waveFactorRange = opts.waveFactorRange || {min: 0, max: 1};
        const colors = opts.colors || COLORS;

        let painting = new Painting();
        const nodeList = [];
        for (let i = 0; i < numNodes; i++) {
            const color = colors[randInt(0, colors.length)];
            let node = new Node(color, randInt(0, 640), randInt(0, 480));
            painting.addNode(node);
            nodeList.push(node);
        }
        for (let i = 0; i < numNodes; i++) {
            const numLinks = randInt(linksPerNodeRange);
            const usedNodes = new Set();
            usedNodes.add(i);
            for (let j = 0; j < numLinks; j++) {
                let node;
                do {
                    node = randInt(0, numNodes);
                } while (usedNodes.has(node));
                usedNodes.add(node);
                const properties: EdgeProperties = {
                    waveFactor: randNumber(waveFactorRange)
                };
                painting.connectNodes(nodeList[i], nodeList[node], properties);
            }
        }
        return painting;
    }

    nodes: Set<Node>;
    edges: EdgeMap;

    constructor(copySource?: Painting) {
        if (copySource) {
            this.nodes = new Set(copySource.nodes);
            this.edges = new EdgeMap(copySource.edges);
        } else {
            this.nodes = new Set();
            this.edges = new EdgeMap();
        }
    }

    addNode(node: Node) {
        this.nodes.add(node);
    }

    connectNodes(node1: Node, node2: Node, edgeProperties: EdgeProperties = DEFAULT_EDGE_PROPS) {
        this.edges.addEdge(node1, node2, edgeProperties);
        this.edges.addEdge(node2, node1, edgeProperties);
    }

    disconnectNodes(node1: Node, node2: Node) {
        this.edges.removeEdge(node1, node2);
        this.edges.removeEdge(node2, node1);
    }

    /**
     * Compute edges, ignoring the second of the bi-directional edges.
     */
    computeDistinctEdges(): EdgeMap {
        const result = new EdgeMap();
        this.edges.forEach((value, key, edgeProperties) => {
            // if we don't have the swapped version
            // addEdge this version
            // (implicitly we don't have this version already!)
            if (!result.hasEdge(value, key)) {
                result.addEdge(key, value, edgeProperties);
            }
        });
        return result;
    }

}