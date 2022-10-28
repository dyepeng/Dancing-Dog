import * as THREE from "node_modules/three/build/three.module.js";
import { OrbitControls } from "node_modules/three/examples/jsm/controls/OrbitControls.js";

//create a renderer
const renderer = new THREE.WebGLRenderer();
document.body.appendChild( renderer.domElement );
//responsive design
const canvas=renderer.domElement;
canvas.classList.add("three");
renderer.setSize( canvas.clientWidth*window.devicePixelRatio, canvas.clientHeight*window.devicePixelRatio,false );

//create a scene
const scene = new THREE.Scene();
//change the color
scene.background = new THREE.Color(0xFFC1C1);

//create a camera
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
camera.position.set(30, 10, 30);
camera.lookAt(0, 0, 0);

//create a control so user can rotate the model by holding and dragging the mouse
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

//add ambient light(soft background light)
const alight = new THREE.AmbientLight( 0x404040 );
//create hemisphere light(to make shadow)
const hlight = new THREE.HemisphereLight( 0xFFFFFF, 0x080820, 1 );
//add the light
scene.add(alight);
scene.add(hlight);

//create a gold MeshPhongMaterial
const goldmaterial = new THREE.MeshPhongMaterial( { color: 0xDAA520 } );
//create a dark gold MeshPhongMaterial
const darkgoldmaterial = new THREE.MeshPhongMaterial( {color: 0xB8860B} );

//create body geometry
const body_radius = 3;
const body_length = 8;
const body_capSubdivisions = 5;
const body_radialSegments = 5;
const body_geometry = new THREE.CapsuleGeometry(body_radius, body_length, body_capSubdivisions, body_radialSegments);
//create a body
const body = new THREE.Mesh(body_geometry, goldmaterial);
//adjust the position and rotation
body.rotation.x = Math.PI/2;
//add the body
scene.add(body);

//create head geometry
const head_radius = 3;
const head_height = 5;
const head_radialSegments = 5;
const head_geometry = new THREE.ConeGeometry(head_radius, head_height, head_radialSegments);
//create a head
const head = new THREE.Mesh(head_geometry, goldmaterial);
//adjust the position and rotation
const head_y = 5;
const head_z = 10;
head.position.set(0, head_y, head_z);
head.rotation.x = Math.PI*2/3;
//add the head
scene.add(head);

//creat nose geometry
const nose_radius = 0.5;
const nose_widthSegments = 7;
const nose_heightSegments = 7;
const nose_geometry = new THREE.SphereGeometry(nose_radius, nose_widthSegments, nose_heightSegments);
//create a nose
const nose = new THREE.Mesh(nose_geometry,darkgoldmaterial);
//adjust the nose position based on position of head
nose.position.set(0, head_y-head_height/2*Math.sin(head.rotation.x-Math.PI/2)+0.32, head_z+head_height/2*Math.cos(head.rotation.x-Math.PI/2)-0.26);
//add the nose
scene.add(nose);

//creat ear geometry
const ear_radius = 2;
const ear_geometry = new THREE.TetrahedronGeometry(ear_radius);
//create two ears in different positions and rotation
let ear_position = [[1,1,1],[-1,1,1]];
let ear_rotation = 0;
ear_position.forEach(index=>{
    index[0]=index[0]*(head_radius-0.5);
    index[1]=head_y+index[1]*head_radius;
    index[2]=head_z-(index[2]*head_height/2-0.6);
    let ear = new THREE.Mesh(ear_geometry, darkgoldmaterial);
    //adjust the ear position based on position of head
    ear.position.set(index[0],index[1],index[2]);
    ear.rotation.y = ear_rotation;
    ear_rotation += Math.PI/2;
    scene.add(ear);
})

//create feet geometry
const feet_radius = 1;
const feet_widthSegments = 5;
const feet_heightSegments = 5;
const feet_geometry = new THREE.SphereGeometry(feet_radius, feet_widthSegments, feet_heightSegments);
//create four feet in different positions based on the position of body
let feet_position = [[1,1,1],[1,1,-1],[-1,1,1],[-1,1,-1]];
feet_position.forEach(index=>{
    index[0]=index[0]*3;
    index[1]=index[1]*-4;
    index[2]=index[2]*5;
    let feet = new THREE.Mesh(feet_geometry, goldmaterial);
    feet.position.set(index[0],index[1],index[2]);
    scene.add(feet);
})

//creat a tail geometry
const tail_radius = 1;
const tail_height = 6;
const tail_radialSegments = 4;
const tail_geometry = new THREE.ConeGeometry(tail_radius, tail_height, tail_radialSegments);
//create a tail
const tail = new THREE.Mesh(tail_geometry, goldmaterial);
//adjust the position and rotation
tail.position.set(0, 2, -8);
tail.rotation.x = Math.PI*2/3;
//add the tail
scene.add(tail);

// //add helper if needed
// const axesHelper = new THREE.AxesHelper(30);
// scene.add(axesHelper);

//render the scene with the camera and update it by animate
function animate() {
    requestAnimationFrame( animate );

    controls.update();

    renderer.render( scene, camera );
};

animate();

