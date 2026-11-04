import * as THREE from 'three';
import { FOOD_BY_ANIMAL } from './gameEconomy.js';

// Readable miniature 3D collectibles, with all meshes safely disposable
// using the normal obstacle-group cleanup. No image packs are required.
export function createPickupArtwork(kind, animal) {
    const root = new THREE.Group();
    root.name = kind === 'box' ? 'surprise-reward-box' : 'animal-food-' + animal;
    const meshes = [];
    const material = (color, metalness = 0, roughness = 0.65) => new THREE.MeshStandardMaterial({
        color, metalness, roughness
    });
    const sphere = (m, x, y, z, sx, sy, sz) => {
        const o = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), m);
        o.position.set(x, y, z); o.scale.set(sx, sy, sz); root.add(o); meshes.push(o); return o;
    };
    const cone = (m, x, y, z, r, h) => {
        const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, 12), m);
        o.position.set(x, y, z); root.add(o); meshes.push(o); return o;
    };
    const box = (m, x, y, z, sx, sy, sz) => {
        const o = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
        o.position.set(x, y, z); o.scale.set(sx, sy, sz); root.add(o); meshes.push(o); return o;
    };

    const ivory = material(0xfff4dc), green = material(0x56b86d),
        yellow = material(0xffd56e), gold = material(0xf7be47, .28, .35),
        pink = material(0xff8fa8), mint = material(0x3fcf9f, .05, .25);

    function addCuteBeadFace(x, y, z, eyeDist = .16, eyeSize = .034, blushSize = .04) {
        const eyeMat = material(0x120d18, .1, .15);
        const catchMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const blushMat = new THREE.MeshBasicMaterial({ color: 0xff8fa8 });
        for (const side of [-1, 1]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(eyeSize, 10, 8), eyeMat);
            eye.position.set(x + side * (eyeDist * .5), y, z); root.add(eye); meshes.push(eye);
            const glint = new THREE.Mesh(new THREE.SphereGeometry(eyeSize * .42, 8, 6), catchMat);
            glint.position.set(x + side * (eyeDist * .5) - eyeSize * .3, y + eyeSize * .32, z + eyeSize * .85);
            root.add(glint); meshes.push(glint);
            const blush = new THREE.Mesh(new THREE.SphereGeometry(blushSize, 8, 6), blushMat);
            blush.position.set(x + side * (eyeDist * .82), y - eyeSize * .75, z - .01);
            blush.scale.set(1, .6, .3);
            root.add(blush); meshes.push(blush);
        }
    }

    if (kind === 'box') {
        // Kawaii Wobnimo Pastel Gift Box with fluffy bow loops and golden star charm
        const chest = box(material(0xcba5f8, .05, .4), 0, 1.05, 0, .76, .74, .72);
        chest.rotation.y = .12;
        // Coral/pink ribbon bands
        box(pink, 0, 1.05, 0, .80, .76, .16);
        box(pink, 0, 1.05, 0, .16, .76, .80);
        // Fluffy ribbon bow loops on top
        for (const side of [-1, 1]) {
            const loop = sphere(pink, side * .14, 1.48, 0, .16, .14, .11);
            loop.rotation.z = -side * .35;
        }
        // Golden star charm in center of ribbon
        sphere(gold, 0, 1.47, 0, .09, .09, .09);
        // Cute star sparkles on the corners
        sphere(ivory, 0, 1.49, .08, .045, .045, .045);
        addCuteBeadFace(0, 1.04, .39, .18, .032, .038);
        return root;
    }

    const item = FOOD_BY_ANIMAL[animal] || FOOD_BY_ANIMAL.mochi || FOOD_BY_ANIMAL.bunny;
    switch (item.id) {
        case 'jellyDrop': {
            // Mochi's signature translucent jelly berry droplet with sprout cap
            sphere(mint, 0, 1.10, 0, .42, .46, .40);
            // Leaf cap
            cone(green, 0, 1.52, 0, .22, .18);
            for (const side of [-1, 1]) {
                const leaf = sphere(green, side * .14, 1.54, 0, .12, .035, .06);
                leaf.rotation.z = -side * .35;
            }
            addCuteBeadFace(0, 1.10, .38, .16, .034, .042);
            break;
        }
        case 'clover': {
            // Hop's lucky 4-leaf clover with plump rounded heart petals
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2;
                const pet = sphere(green, Math.cos(angle) * .22, 1.15 + Math.sin(angle) * .22, 0, .20, .20, .12);
                pet.rotation.z = angle;
            }
            // Golden star spark in center
            sphere(gold, 0, 1.15, 0, .10, .10, .10);
            addCuteBeadFace(0, 1.14, .13, .13, .028, .035);
            break;
        }
        case 'carrot': {
            const carrot = cone(material(0xff943e), 0, 1.05, 0, .34, .84);
            carrot.rotation.z = Math.PI;
            for (const side of [-1, 0, 1]) {
                const leaf = cone(green, side * .15, 1.64, 0, .15, .38);
                leaf.rotation.z = -side * .47;
            }
            addCuteBeadFace(0, 1.18, .24, .14, .030, .036);
            break;
        }
        case 'rainbowFruit': {
            sphere(material(0xeaa6fb), 0, 1.10, 0, .38, .40, .36);
            for (const [i, c] of [0xffbfce, 0xffe5a2, 0x9bdfce, 0xadd2fa].entries()) {
                const angle = i * Math.PI / 2;
                sphere(material(c), Math.cos(angle) * .23, 1.14 + Math.sin(angle) * .1, Math.sin(angle) * .23, .15, .23, .13);
            }
            cone(green, 0, 1.55, 0, .17, .3);
            addCuteBeadFace(0, 1.12, .34, .15, .032, .038);
            break;
        }
        case 'apple': {
            sphere(material(0xea565d), 0, 1.07, 0, .39, .36, .36);
            box(material(0x8f653d), 0, 1.5, 0, .075, .24, .07);
            const leaf = sphere(green, .15, 1.55, .03, .2, .08, .14); leaf.rotation.z = .46;
            addCuteBeadFace(0, 1.08, .34, .15, .030, .038);
            break;
        }
        case 'catFish':
        case 'penguinFish': {
            const blue = material(item.id === 'catFish' ? 0x78c6de : 0xa5e7f5, .08);
            sphere(blue, 0, 1.08, 0, .53, .26, .20);
            const tail = cone(blue, -.50, 1.08, 0, .27, .44); tail.rotation.z = Math.PI / 2;
            // Cute bead eyes on fish side
            sphere(material(0x120d18), .24, 1.14, .17, .045, .045, .045);
            sphere(new THREE.MeshBasicMaterial({ color: 0xffffff }), .22, 1.16, .20, .018, .018, .018);
            sphere(pink, .16, 1.06, .17, .04, .025, .03);
            for (let i = -1; i <= 1; i++)sphere(ivory, i * .15, 1.24, -.06, .025, .04, .14);
            break;
        }
        case 'bone': {
            box(ivory, 0, 1.11, 0, .68, .20, .19);
            for (const x of [-.4, .4]) for (const z of [-.13, .13]) sphere(ivory, x, 1.11, z, .18, .18, .15);
            addCuteBeadFace(0, 1.11, .11, .13, .026, .032);
            break;
        }
        case 'corn': {
            const cob = sphere(yellow, 0, 1.10, 0, .23, .45, .24);
            cob.rotation.z = .08;
            for (const side of [-1, 1]) {
                const husk = cone(green, side * .2, 1.0, -.04, .20, .71); husk.rotation.z = -side * .35;
            }
            addCuteBeadFace(0, 1.14, .22, .12, .026, .032);
            break;
        }
    }
    return root;
}
