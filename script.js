//import libraries
import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "./node_modules/three/examples/jsm/controls/DragControls.js";

window.addEventListener('DOMContentLoaded',function () {
    //elements
    const switchButton = document.querySelector(".switchbutton");
    const playButton = document.querySelector(".playbutton");
    const playIcon = document.querySelector(".playicon");
    const audioPlay = document.querySelector("#audioplay");



    //music part

    //music information variables
    let musicIndex = 1;
    let allMusicIndex = [1,2,3,4,5,6,7];
    let firstsong = true;
    let mood;

    //randomly choose the song until every song is played
    function chooseSong(){
        if(allMusicIndex.length===0){
            allMusicIndex = [1,2,3,4,5,6,7];
        }
        musicIndex = allMusicIndex.splice(Math.floor(Math.random()*allMusicIndex.length),1);
        console.log(musicIndex);
    }

    //play the current music
    function playMusic(){
        fetch("./music/music-list.json")
            .then((response) => response.json())
            .then((list) => {
                chooseSong();
                console.log(list["track"+musicIndex].uri);
                let musicUri = list["track"+musicIndex].uri;
                audioPlay.setAttribute("src", musicUri);
                mood = list["track"+musicIndex].mood;
                if(firstsong){
                    audioPlay.pause();
                    firstsong=false;
                }else{
                    playIcon.setAttribute("src", "./image/pauseIcon.png");
                }
            });
    }

    //control audio, play a song or stop a song
    function controlSongPlay(){
        console.log(audioPlay.paused);
        console.log("activate");
        if(audioPlay.paused === true){
            audioPlay.play();
            playIcon.setAttribute("src", "./image/pauseIcon.png");
        }else{
            audioPlay.pause();
            playIcon.setAttribute("src", "./image/playIcon.png");
        }
    }

    //choose the first song, then play or switch
    playMusic();
    playIcon.setAttribute("src", "./image/playIcon.png");
    playButton.addEventListener("click", controlSongPlay);
    switchButton.addEventListener("click", playMusic);



    //init render, scene, camera

    //create a renderer
    const renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);
    const canvas=renderer.domElement;

    //create a scene
    const scene = new THREE.Scene();
    //change the background color
    scene.background = new THREE.Color(0xFFC1C1);

    //create a camera
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
    camera.position.set(30, 10, 30);
    camera.lookAt(0, 0, 0);

    //responsive design
    function canvasResize(){
        canvas.classList.add("three");
        renderer.setSize( canvas.clientWidth*window.devicePixelRatio, canvas.clientHeight*window.devicePixelRatio,false );
        console.log("resize");
    }
    canvasResize();



    //init light and material

    //add ambient light(soft background light)
    const alight = new THREE.AmbientLight(0x404040);
    //create hemisphere light(to make shadow)
    const hlight = new THREE.HemisphereLight(0xFFFFFF, 0x080820, 1);
    //add the light
    scene.add(alight);
    scene.add(hlight);

    //create a gold MeshPhongMaterial
    const goldmaterial = new THREE.MeshPhongMaterial( { color: 0xDAA520 } );
    //create a dark gold MeshPhongMaterial
    const darkgoldmaterial = new THREE.MeshPhongMaterial( {color: 0xB8860B} );
    //create a grey MeshPhongMaterial
    const greymaterial = new THREE.MeshPhongMaterial( {color: 0x696969} );
    //create a black MeshPhongMaterial
    const blackmaterial = new THREE.MeshPhongMaterial( {color: 0x000000} );



    //construct model
    const dog_group=new THREE.Group();

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
    dog_group.add(body);

    //create head group
    const head_group=new THREE.Group();

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
    head_group.add(head);

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
    head_group.add(nose);

    //create eye geometry
    const eye_radius = 0.3;
    const eye_widthSegments = 20;
    const eye_heightSegments = 20;
    const eye_geometry = new THREE.SphereGeometry(eye_radius, eye_widthSegments, eye_heightSegments);
    //create two eyes in different position
    const eyes = [];
    let eye_position = [[1,1,1],[-1,1,1]];
    eye_position.forEach(index=>{
        index[0]=index[0]*(head_radius/2);
        index[1]=head_y+index[1]*(head_radius/4);
        index[2]=head_z-index[2]*(head_height/10);
        let eye = new THREE.Mesh(eye_geometry, blackmaterial);
        eye.position.set(index[0],index[1],index[2]);
        eyes.push(eye);
        head_group.add(eye);
    })



    //creat ear geometry
    const ear_radius = 2;
    const ear_geometry = new THREE.TetrahedronGeometry(ear_radius);
    //create two ears in different positions and rotation
    const ears = [];
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
        ears.push(ear);
        head_group.add(ear);
    })

    //create earphone geometry
    const earphone_radiusTop = 1;
    const earphone_radiusBottom = 1;
    const earphone_height = 1;
    const earphone_radialSegments = 7;
    const earphone_geometry = new THREE.CylinderGeometry(earphone_radiusTop, earphone_radiusBottom, earphone_height, earphone_radialSegments);
    //define earphone position
    const earphone_group = new THREE.Group();
    let earphone_center={
        x:0,
        y:head_y+head_radius*3/5,
        z:head_z-head_height/4
    };
    console.log(earphone_center);
    //create earphone
    const earphones = [];
    let earphone_direction_x = [-1,1];
    earphone_direction_x.forEach(index => {
        let earphone = new THREE.Mesh(earphone_geometry, greymaterial);
        earphone.position.set(earphone_center.x+index*3, earphone_center.y, earphone_center.z);
        earphone.rotation.z = Math.PI/2;
        earphones.push(earphone);    
        earphone_group.add(earphone);
    });
    head_group.add(earphone_group);

    //add head_group to dog_group
    dog_group.add(head_group);

    //create feet geometry
    const feet_radius = 1;
    const feet_widthSegments = 5;
    const feet_heightSegments = 5;
    const feet_geometry = new THREE.SphereGeometry(feet_radius, feet_widthSegments, feet_heightSegments);
    //create four feet in different positions based on the position of body
    const feet = [];
    let feet_position = [[1,1,1],[1,1,-1],[-1,1,1],[-1,1,-1]];
    feet_position.forEach(index=>{
        index[0]=index[0]*3;
        index[1]=index[1]*-4;
        index[2]=index[2]*5;
        let foot = new THREE.Mesh(feet_geometry, goldmaterial);
        foot.position.set(index[0],index[1],index[2]);
        feet.push(foot);
        dog_group.add(foot);
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
    dog_group.add(tail);

    //add the whole dog to the scene
    scene.add(dog_group);



    //helper system, de-comment if needed

    // //add helper if needed
    // const axesHelper = new THREE.AxesHelper(30);
    // scene.add(axesHelper);



    //control system, de-comment type of control you need to activate it

    //create a control so user can rotate the model by holding and dragging the mouse
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // //create a control so user can drag the headphone
    //const controls = new DragControls([], camera, renderer.domElement);
    //controls.transformGroup = true;
    //const draggableObjects = controls.getObjects();
    //draggableObjects.push(earphone_group);
    //renderer.render(scene, camera);



    //render the scene with the camera and update it by animate

    //default state of the dog
    function defaultAnimate(time) {
        function defaultRotationSet(time){
            body.rotation.set(Math.PI/2, 0, 0);
            head.rotation.set(Math.PI*2/3, 0, 0);
            ear_rotation = 0;
            ears.forEach(ear => {
                ear.rotation.set(0, ear_rotation, 0);
                ear_rotation += Math.PI/2;
            });
            earphone_group.rotation.set(0,0,0);
            head_group.rotation.set(0,0,0);
            tail.rotation.set(Math.PI*2/3, 0, 0);
        }
        function defaultPositionSet(time){
            head.position.set(0, head_y, head_z);
            nose.position.set(0, head_y-head_height/2*Math.sin(head.rotation.x-Math.PI/2)+0.32, head_z+head_height/2*Math.cos(head.rotation.x-Math.PI/2)-0.26);
            let eye_index = 0;
            eye_position.forEach(index=>{
                //adjust the ear position based on position of head
                eyes[eye_index].position.set(index[0],index[1],index[2]);
                eye_index++;            
            });
            let ear_index = 0;
            ear_position.forEach(index=>{
                //adjust the ear position based on position of head
                ears[ear_index].position.set(index[0],index[1],index[2]);
                ear_index++;            
            });
            let earphone_index=0;
            earphone_direction_x.forEach(index => {
                earphones[earphone_index].position.set(earphone_center.x+index*3, earphone_center.y, earphone_center.z);
                earphones[earphone_index].rotation.z = Math.PI/2;
                earphone_index++;    
            });
            let foot_index = 0;
            feet_position.forEach(index=>{
                feet[foot_index].position.set(index[0],index[1],index[2]);
                foot_index++;
            });
            tail.position.set(0, 2, -8);
        }
        defaultRotationSet(time);
        defaultPositionSet(time);
    };

    //bounce statement of the dog
    function bounceAnimate(time){
        function feetBounce(speed, amplitude){
            const phase_array = [0,2,4,6];
            let foot_index = 0;
            feet.forEach(foot =>{
                foot.position.y=feet_position[foot_index][1]+amplitude*Math.sin(speed*time+phase_array[foot_index]);
                foot.position.z=feet_position[foot_index][2]-amplitude*Math.cos(speed*time+phase_array[foot_index]);
                foot_index++;
            })
        }

        feetBounce(0.03,0.5);

        function tailWave(speed, amplitude){
            tail.rotation.z = amplitude*Math.sin(speed*time);
        }

        tailWave(0.01,0.3);

        function bodyWave(speed, amplitude){
            body.rotation.z = -amplitude*Math.sin(speed*time);
        }

        bodyWave(0.01,0.08);

        function earWave(speed, amplitude){
            ears.forEach(ear => {
                if(ear.rotation.y === 0){
                    ear.rotation.z=amplitude*Math.sin(speed*time);
                }else{
                    ear.rotation.x=amplitude*Math.sin(speed*time+1);
                }
            })
        }

        earWave(0.02, 0.1);

        function headGroupShake(speed, amplitude){
            head_group.rotation.z = amplitude*Math.sin(speed*time);
            head_group.rotation.y = amplitude*Math.sin(speed*time);
        }

        headGroupShake(0.01, 0.08);
    }

    //peaceful state of the dog
    function peacefulAnimate(time){
        function feetSwim(speed, amplitude){
            const phase_array = [0,0,2,2];
            let foot_index = 0;
            feet.forEach(foot =>{
                foot.position.x=1.5*feet_position[foot_index][0]+amplitude*Math.sin(speed*time+phase_array[foot_index]);
                foot.position.y=0.5*feet_position[foot_index][1];
                foot.position.z=1.5*feet_position[foot_index][2]-amplitude*Math.cos(speed*time+phase_array[foot_index]);
                foot_index++;
            })
        }

        feetSwim(0.003,1);

        function bodySwim(speed, amplitude){
            body.rotation.x = Math.PI/2-0.7*amplitude*Math.sin(0.5*speed*time);
            body.rotation.z = -amplitude*Math.cos(speed*time);
            body.rotation.y = -amplitude*Math.sin(speed*time);
        }

        bodySwim(0.003,0.1);
        
        function tailWave(speed, amplitude){
            tail.rotation.z = amplitude*Math.sin(speed*time);
        }

        tailWave(0.003,0.1);
        
        function earWave(speed, amplitude){
            ears.forEach(ear => {
                if(ear.rotation.y === 0){
                    ear.rotation.z=amplitude*Math.sin(speed*time);
                }else{
                    ear.rotation.x=amplitude*Math.sin(speed*time+1);
                }
            })
        }

        earWave(0.01, 0.1);
        
        function headGroupShake(speed, amplitude){
            head_group.rotation.x = 0.5*amplitude*Math.sin(0.5*speed*time);
            head_group.rotation.z = amplitude*Math.sin(speed*time);
            head_group.rotation.y = amplitude*Math.sin(speed*time);
        }

        headGroupShake(0.003, 0.1);

        function dogSwimFly(speed, amplitude){
            dog_group.position.z = amplitude*Math.sin(speed*time);
            dog_group.position.x = -0.5*amplitude*Math.sin(speed*time)
        }

        dogSwimFly(0.003, 1.5);
    }

    function sorrowfulAnimate(time){

    }

    //dog react differently to the music mood
    function dogReaction(time){
        requestAnimationFrame(dogReaction);
        if(audioPlay.paused){
            //scene.background = new THREE.Color(0xFFC1C1);
            defaultAnimate();
            console.log("default");
        }else{
            if(mood==="bounce"){
                scene.background = new THREE.Color(0x8FBC8F);
                bounceAnimate(time);
                console.log("bounce");
            }
            if(mood==="peaceful"){
                //change the background color
                scene.background = new THREE.Color(0x4682B4);
                peacefulAnimate(time);
                console.log("peaceful");
            }
            if(mood==="sorrowful"){
                //change the background color
                scene.background = new THREE.Color(0x7A378B);
                sorrowfulAnimate(time);
                console.log("sorrowful");
            }
        }
        controls.update();
        renderer.render(scene, camera);
    }

    dogReaction();

});


