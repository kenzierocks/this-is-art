import "object.entries";
import $ from "jquery";
import {Painting, PaintingOpts} from "./painting";
import {ArtTarget} from "./target";

function makeTargets(count: number): ArtTarget[] {
    const $targets = $("#targets");
    const targets: ArtTarget[] = [];
    for (let i = 0; i < count; i++) {
        const holder = document.createElement("div");
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        canvas.style.width = "28vh";
        canvas.style.height = "21vh";

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
