import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const width = window.innerWidth, height = window.innerHeight;
const clock = new THREE.Clock();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 2);
const ambient = new THREE.AmbientLight(0xffffff, 0.5);

const camera = new THREE.PerspectiveCamera(100, width/height, .1, 20);
const cameraOffset = new THREE.Vector3(0, 1, 1.25);
camera.position.x = cameraOffset.x;
camera.position.y = cameraOffset.y;
camera.position.z = cameraOffset.z;
camera.rotation.x = -0.3

const loader = new THREE.TextureLoader();

let mixer;
let idleAction, walkAction;
let currentAction;

const gltfLaoader = new GLTFLoader();



const buildingTexture = loader.load("./building.png");
const planeTexture = loader.load("./grass.png");
const sceneBGTexture = loader.load("./sky.png");
const brickTexture = loader.load("./brick.png");

const scene = new THREE.Scene();
scene.background = sceneBGTexture;

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
renderer.setSize(width, height);

const planeSize = 20;
const wallSize1 = planeSize;

const buildingGeometry = new THREE.BoxGeometry( 1, 2, 1, 5, 5, 5 );
// const playerGeometry = new THREE.CapsuleGeometry(0.25, 0.5, 50, 100, 1);
const playerGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
const platformGeometry = new THREE.BoxGeometry( planeSize, 0.02, planeSize, 5, 5, 5 );
const healthGeometry = new THREE.SphereGeometry(0.35, 32, 16)
const borderXGeometry = new THREE.BoxGeometry(planeSize, 1, 1)
const borderZGeometry = new THREE.BoxGeometry(1, 1, (planeSize-1))

const material = new THREE.MeshBasicMaterial( {map: buildingTexture, color: 0x636363} );
const planeMaterial = new THREE.MeshBasicMaterial({ map: planeTexture, color: 0x636363 });
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.5, metalness: 0.3 });
const healthMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const borderMaterial = new THREE.MeshBasicMaterial({ map: brickTexture, color: 0x636363 })

const player = new THREE.Mesh( playerGeometry, playerMaterial );
const object = new THREE.Mesh( buildingGeometry, material );
const plane = new THREE.Mesh( platformGeometry, planeMaterial );
const health = new THREE.Mesh( healthGeometry, healthMaterial );
const border1 = new THREE.Mesh( borderXGeometry, borderMaterial );
const border2 = new THREE.Mesh( borderXGeometry, borderMaterial );
const border3 = new THREE.Mesh( borderZGeometry, borderMaterial );
const border4 = new THREE.Mesh( borderZGeometry, borderMaterial );

player.name = "player";
object.name = "building";
health.name = "health";
plane.name = "ground";
border1.name = "wall";
border2.name = "wall";
border3.name = "wall";
border4.name = "wall";

gltfLaoader.load("./scene.gltf", (gltf) => {
    const model = gltf.scene;
    model.scale.setScalar(0.2);
    model.position.y = 0;
    player.add(model);
    player.material.visible = false

    mixer = new THREE.AnimationMixer(model);

    const idleClip = THREE.AnimationClip.findByName(gltf.animations, "animation");
    const walkClip = THREE.AnimationClip.findByName(gltf.animations, "walk");

    idleAction = mixer.clipAction(idleClip);
    walkAction = mixer.clipAction(walkClip);

    idleAction.play();
    currentAction = idleAction;
})

const collidableObject = [object, health, plane, border1, border2, border3, border4];

let verticleVelocity = 0;
const gravity = -0.01;

plane.position.z = -1;
plane.position.y = -0.35;
object.position.x = -1;
object.position.z = -1;
object.position.y = 0.75
health.position.z = -1;
health.position.x = 1;
border1.position.z = -(planeSize/2 + 0.5);
border2.position.z = (planeSize/2 - 0.5);
border3.position.x = (planeSize/2 - 0.5);
border3.position.z = -0.5;
border4.position.x = -(planeSize/2 - 0.5);
border4.position.z = -0.5;


scene.add(player);
scene.add(object);
scene.add(plane);
scene.add(light);
scene.add(ambient);
scene.add(health);
scene.add(border1);
scene.add(border2);
scene.add(border3);
scene.add(border4);

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false,
    w: false,
    a: false,
    s: false,
    d: false,
    o: false,
    p: false,
    " ": false,
    r: false
}

const baseSpeed = 2.0;
let targetRotation = 0;
const rotationSmooth = 0.08;

window.addEventListener( 'keydown', ( event ) => {
    keys[event.key] = true;
});

window.addEventListener( 'keyup', ( event ) => {
    keys[event.key] = false;
});

document.addEventListener( "click", () => {
    renderer.domElement.requestPointerLock();
})

document.addEventListener( "mousemove", (event) => {
    if (document.pointerLockElement === renderer.domElement) {
        const sensitivity = 0.004;
        // player.rotation.y -= event.movementX * sensitivity;
        targetRotation -= event.movementX * sensitivity;
        camera.rotation.x -= event.movementY * sensitivity;
        // camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
        camera.rotation.x = Math.max(-1.0, Math.min(0.5, camera.rotation.x))
    }
} )

player.add(camera);

const fadeToAction = (nextAction, duration = 0.2) => {
    if (currentAction !== nextAction) {
        const previousAction = currentAction;
        currentAction = nextAction;
        if (previousAction) {
            previousAction.fadeOut(duration);
        }
        currentAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
    }
}

const updateMovement = (delTime) => {
    const movementDistance = delTime * baseSpeed;

    const isMovingSide = ( keys.ArrowLeft || keys.ArrowRight || keys.a || keys.d );

    const oldPosition = player.position.clone();  

    verticleVelocity += gravity * delTime * 60;
    player.position.y += verticleVelocity;

    
    if ( keys.ArrowUp || keys.w ) player.translateZ(-movementDistance);
    if ( keys.ArrowDown || keys.s ) player.translateZ(movementDistance);
    if ( keys.ArrowLeft || keys.a ) {
        player.translateX(-movementDistance);
        targetRotation += 0.5 * delTime;
    }
    if ( keys.ArrowRight || keys.d ) {
        player.translateX(movementDistance);
        targetRotation -= 0.5 * delTime;
    }
    if ( keys.o ) player.rotation.y += 0.05
    if ( keys.p ) player.rotation.y -= 0.05 
    if ( keys.r ) window.location.reload();
    
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation, rotationSmooth);
    
    const isMoving = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || keys.a || keys.s || keys.d || keys.w;
    if (mixer) {
        if (isMoving) {
            fadeToAction(walkAction);
        } else {
            fadeToAction(idleAction);
        }
        mixer.update(delTime);
    }

    const playerBox = new THREE.Box3().setFromObject(player);
    let onGround = false;
    
    for ( let i = 0; i < collidableObject.length; i++ ) {
        const target = collidableObject[i];
        const targetBox = new THREE.Box3().setFromObject(target);
        
        if ( playerBox.intersectsBox(targetBox) ) {
            if ( target.name === "ground" || target.name === "wall" ) {
                player.position.y = oldPosition.y;
                verticleVelocity = 0;
                onGround = true
            }
            if ( target.name === "health" ) {
                console.log("collided with life");
                scene.remove(target);
                collidableObject.splice(i, 1);
            } else if ( target.name === "building" || target.name === "wall" ) {
                player.position.x = oldPosition.x;
                player.position.z = oldPosition.z;
            }
        }
    }
    if ( keys[" "] && onGround ) verticleVelocity = 0.15;
    
}

const animate = () => {
    const deltaTime = clock.getDelta();
    updateMovement(deltaTime);
    // camera.lookAt(player.position);
    renderer.render(scene, camera)
}

renderer.setAnimationLoop( animate );



document.body.appendChild( renderer.domElement );