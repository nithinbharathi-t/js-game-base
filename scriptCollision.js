import * as THREE from "three";

const width = window.innerWidth, height = window.innerHeight;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 2);
const ambient = new THREE.AmbientLight(0xffffff, 0.5);

const camera = new THREE.PerspectiveCamera(100, width/height, .1, 20);
const cameraOffset = new THREE.Vector3(0, 1, 1.25);
camera.position.x = cameraOffset.x;
camera.position.y = cameraOffset.y;
camera.position.z = cameraOffset.z;

const loader = new THREE.TextureLoader();

const buildingTexture = loader.load("./building.png");
const planeTexture = loader.load("./grass.png");
const sceneBGTexture = loader.load("./sky.png");
const brickTexture = loader.load("./brick.png");

const scene = new THREE.Scene();
scene.background = sceneBGTexture;

const planeSize = 20;
const wallSize1 = planeSize;

const buildingGeometry = new THREE.BoxGeometry( 1, 2, 1, 5, 5, 5 );
const playerGeometry = new THREE.CapsuleGeometry(0.25, 0.5, 50, 100, 1);
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
    " ": false
}

window.addEventListener( 'keydown', ( event ) => {
    keys[event.key] = true;
});

window.addEventListener( 'keyup', ( event ) => {
    keys[event.key] = false;
});

const movementSpeed = 0.05;

player.add(camera);

const updateMovement = () => {
    const oldPosition = player.position.clone();  

    verticleVelocity += gravity;
    player.position.y += verticleVelocity;

    if ( keys.ArrowUp || keys.w ) player.translateZ(-movementSpeed);
    if ( keys.ArrowDown || keys.s ) player.translateZ(movementSpeed);
    if ( keys.ArrowLeft || keys.a ) player.translateX(-movementSpeed);
    if ( keys.ArrowRight || keys.d ) player.translateX(movementSpeed);
    if ( keys.o ) player.rotation.y += 0.05
    if ( keys.p ) player.rotation.y -= 0.05 
    
    const playerBox = new THREE.Box3().setFromObject(player);
    let onGround = false;

    for ( let i = 0; i < collidableObject.length; i++ ) {
        const target = collidableObject[i];
        const targetBox = new THREE.Box3().setFromObject(target);

        if ( playerBox.intersectsBox(targetBox) ) {
            if ( target.name === "ground" ) {
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
    if ( keys[" "] && onGround ) verticleVelocity = 0.2;
}

const animate = () => {
    updateMovement();
    camera.lookAt(player.position);
    renderer.render(scene, camera)
}

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
renderer.setSize(width, height);
renderer.setAnimationLoop( animate );

document.body.appendChild( renderer.domElement );