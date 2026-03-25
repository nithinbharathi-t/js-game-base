import * as THREE from "three";

const width = window.innerWidth, height = window.innerHeight;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 2);
const ambient = new THREE.AmbientLight(0xffffff, 0.5);

const camera = new THREE.PerspectiveCamera(100, width/height, .1, 10);
const cameraOffset = new THREE.Vector3(0, 1, 1.25);
camera.position.x = cameraOffset.x;
camera.position.y = cameraOffset.y;
camera.position.z = cameraOffset.z;

const loader = new THREE.TextureLoader();

const scene = new THREE.Scene();

const buildingTexture = loader.load("./building.png");
const planeTexture = loader.load("./grass.png");

const buildingGeometry = new THREE.BoxGeometry( 1, 2, 1, 5, 5, 5 );
const playerGeometry = new THREE.CapsuleGeometry(0.25, 0.5, 50, 100, 1);
const platformGeometry = new THREE.BoxGeometry( 5, 0.02, 5, 5, 5, 5 );

const material = new THREE.MeshBasicMaterial( {map: buildingTexture, color: 0x636363} );
const planeMaterial = new THREE.MeshBasicMaterial({ map: planeTexture, color: 0x636363 });
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.5, metalness: 0.1 });

const player = new THREE.Mesh( playerGeometry, playerMaterial );
const object = new THREE.Mesh( buildingGeometry, material );
const plane = new THREE.Mesh( platformGeometry, planeMaterial )

plane.position.z = -1;
plane.position.y = -0.35;

object.position.x = -1;
object.position.z = -1;

scene.add(player);
scene.add(object);
scene.add(plane);
scene.add(light);
scene.add(ambient);

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false,
    o: false,
    p: false,
    k: false,
    l: false
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
    if ( keys.ArrowUp ) player.position.z -= movementSpeed;
    if ( keys.ArrowDown ) player.position.z += movementSpeed;
    if ( keys.ArrowLeft ) player.position.x -= movementSpeed;
    if ( keys.ArrowRight ) player.position.x += movementSpeed;
    if ( keys.o ) player.rotation.y += 0.05
    if ( keys.p ) player.rotation.y -= 0.05
    if ( keys.k ) player.rotation.z += 0.05
    if ( keys.l ) player.rotation.z -= 0.05
}

const animate = () => {
    updateMovement();
    camera.lookAt(player.position);
    renderer.render(scene, camera)
}

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(width, height);
renderer.setAnimationLoop( animate );

document.body.appendChild( renderer.domElement );