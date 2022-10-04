import * as THREE from "./libs/three/three.module.js";
import { VRButton } from "./libs/VRButton.js";
import { XRControllerModelFactory } from "./libs/three/jsm/XRControllerModelFactory.js";
import { Stats } from "./libs/stats.module.js";
import { OrbitControls } from "./libs/three/jsm/OrbitControls.js";
import { GLTFLoader } from "./libs/three/jsm/GLTFLoader.js";

class App {
  constructor() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 3, 5);

    this.scene = new THREE.Scene();
    //skybox
    const loader2 = new THREE.CubeTextureLoader()
    const texture = loader2.load([
      './assets/img/posx.jpg',
      './assets/img/negx.jpg',
      './assets/img/posy.jpg',
      './assets/img/negy.jpg',
      './assets/img/posz.jpg',
      './assets/img/negz.jpg'
    ])
    this.scene.background = texture

    //lights 

    // this.scene.add(new THREE.HemisphereLight(0xFFF6BF, 0xFFF6BF));
    // const light = new THREE.AmbientLight( 0x404040 , 0.5); // soft white light
    // this.scene.add( light );

   const pointLight1 = new THREE.PointLight(0x79DAE8, 1, 100);
   pointLight1.position.set( 0, 10, 0 );
   pointLight1.castShadow = true; // default false
   this.scene.add( pointLight1 )
   const sphereSize1 = 1;
   const pointLightHelper1 = new THREE.PointLightHelper( pointLight1, sphereSize1 );
  //  this.scene.add( pointLightHelper1 );
    
   const pointLight2 = new THREE.PointLight(0x79DAE8, 1, 100);
   pointLight2.position.set( 35, 10, 5 );
   pointLight2.castShadow = true; // default false
   this.scene.add( pointLight2 )
   const sphereSize2 = 1;
   const pointLightHelper2 = new THREE.PointLightHelper( pointLight2, sphereSize2 );
  //  this.scene.add( pointLightHelper2 );

   const pointLight3 = new THREE.PointLight(0xFFF6BF, 1, 100);
   pointLight3.position.set( -35, 10, 0 );
   pointLight3.castShadow = true; // default false
   this.scene.add( pointLight3 )
   const sphereSize3 = 1;
   const pointLightHelper3 = new THREE.PointLightHelper( pointLight3, sphereSize3 );
  //  this.scene.add( pointLightHelper3 );

   const pointLight4 = new THREE.PointLight(0xFFF6BF, 1, 100);
   pointLight4.position.set( 9, 10, -8 );
   pointLight4.castShadow = true; // default false
   this.scene.add( pointLight4 )
   const sphereSize4 = 1;
   const pointLightHelper4 = new THREE.PointLightHelper( pointLight4, sphereSize4 );
  //  this.scene.add( pointLightHelper4 );
    

    // const dirLight = new THREE.DirectionalLight(0xFFF6BF, 1);
	  // dirLight.position.set(0, 10, 0);
	  // dirLight.castShadow = true;
	  // dirLight.shadow.camera.top = 50;
	  // dirLight.shadow.camera.bottom = -50;
	  // dirLight.shadow.camera.left = -50;
	  // dirLight.shadow.camera.right = 50;
	  // dirLight.shadow.camera.near = 0.1;
	  // dirLight.shadow.camera.far = 200;
	  // dirLight.shadow.mapSize.width = 4096;
	  // dirLight.shadow.mapSize.height = 4096;
	  // this.scene.add(dirLight);
    // const helper = new THREE.DirectionalLightHelper( dirLight, 5 );
    // this.scene.add( helper );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(this.renderer.domElement);

    const orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
    orbitControl.enableDamping = true;
    orbitControl.minDistance = 7;
    orbitControl.maxDistance = 100;
    orbitControl.enablePan = false;
    orbitControl.maxPolarAngle = Math.PI / 2 - 0.05;
    orbitControl.update();    

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.target.set(0, 1.6, 0);
    // this.controls.update();

    this.stats = new Stats();

    this.raycaster = new THREE.Raycaster();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();
    this.origin = new THREE.Vector3();

    this.initScene();
    this.setupVR();

    window.addEventListener("resize", this.resize.bind(this));

    this.renderer.setAnimationLoop(this.render.bind(this));
  }

 

  initScene() {

    // ground
    const ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(200, 200),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);


    this.colliders = [];
    
    //change the variable in room for the change in scene
    
    const room = './assets/rooms/Final_Interior.glb';
    const loader = new GLTFLoader();
    loader.castShadow = true;
    loader.load(room, (gltf) => {
        // gltf.scene.position.y = -8;
        gltf.scene.scale.set(0.05, 0.05, 0.05);
        gltf.scene.traverse((child) => {
          
            if (child.isMesh) {
                this.colliders.push(child);
            }
        });
        this.scene.add(gltf.scene);
    });

  }

  setupVR() {
    this.renderer.xr.enabled = true;

    const button = new VRButton(this.renderer);

    const self = this;

    function onSelectStart() {
      this.userData.selectPressed = true;
    }

    function onSelectEnd() {
      this.userData.selectPressed = false;
    }

    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener("selectstart", onSelectStart);
    this.controller.addEventListener("selectend", onSelectEnd);
    this.controller.addEventListener("connected", function (event) {
      const mesh = self.buildController.call(self, event.data);
      mesh.scale.z = 0;
      this.add(mesh);
    });
    this.controller.addEventListener("disconnected", function () {
      this.remove(this.children[0]);
      self.controller = null;
      self.controllerGrip = null;
    });
    this.scene.add(this.controller);

    const controllerModelFactory = new XRControllerModelFactory();

    this.controllerGrip = this.renderer.xr.getControllerGrip(0);
    this.controllerGrip.add(
      controllerModelFactory.createControllerModel(this.controllerGrip)
    );
    this.scene.add(this.controllerGrip);

    this.dolly = new THREE.Object3D();
    this.dolly.position.z = 5;
    this.dolly.add(this.camera);
    this.scene.add(this.dolly);

    this.dummyCam = new THREE.Object3D();
    this.camera.add(this.dummyCam);
  }

  buildController(data) {
    let geometry, material;

    switch (data.targetRayMode) {
      case "tracked-pointer":
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
        );
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
        );

        material = new THREE.LineBasicMaterial({
          vertexColors: true,
          blending: THREE.AdditiveBlending,
        });

        return new THREE.Line(geometry, material);

      case "gaze":
        geometry = new THREE.RingBufferGeometry(0.02, 0.04, 32).translate(
          0,
          0,
          -1
        );
        material = new THREE.MeshBasicMaterial({
          opacity: 0.5,
          transparent: true,
        });
        return new THREE.Mesh(geometry, material);
    }
  }

  handleController(controller, dt) {
    if (controller.userData.selectPressed) {
      const wallLimit = 0.5;
      const speed = 3;
      let pos = this.dolly.position.clone();
      /**
       * you get the position of you view here
       * can load the model here
       */
      console.log(pos);
      pos.y += 1;
      let dir = new THREE.Vector3();
      //Store original dolly rotation
      const quaternion = this.dolly.quaternion.clone();
      //Get rotation for movement from the headset pose
      this.dolly.quaternion.copy(this.dummyCam.getWorldQuaternion());
      this.dolly.getWorldDirection(dir);
      dir.negate();
      this.raycaster.set(pos, dir);

      let blocked = false;

      let intersect = this.raycaster.intersectObjects(this.colliders);
      if (intersect.length > 0) {
        if (intersect[0].distance < wallLimit) blocked = true;
      }

      if (!blocked) {
        this.dolly.translateZ(-dt * speed);
        pos = this.dolly.getWorldPosition(this.origin);
      }

      //cast left
      dir.set(-1, 0, 0);
      dir.applyMatrix4(this.dolly.matrix);
      dir.normalize();
      this.raycaster.set(pos, dir);

      intersect = this.raycaster.intersectObjects(this.colliders);
      if (intersect.length > 0) {
        if (intersect[0].distance < wallLimit)
          this.dolly.translateX(wallLimit - intersect[0].distance);
      }

      //cast right
      dir.set(1, 0, 0);
      dir.applyMatrix4(this.dolly.matrix);
      dir.normalize();
      this.raycaster.set(pos, dir);

      intersect = this.raycaster.intersectObjects(this.colliders);
      if (intersect.length > 0) {
        if (intersect[0].distance < wallLimit)
          this.dolly.translateX(intersect[0].distance - wallLimit);
      }

      this.dolly.position.y = 0;

      //Restore the original rotation
      this.dolly.quaternion.copy(quaternion);
    }
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }


  render() {
    // if (sceneMesh) {
		
    // }
    // if(joinedRoom){
    //   let user = {
    //           userId: socket.id,
    //           userName: "User",
    //           roomId: "room1",
    //           avatarId: 1,
    //           position: controls.cameraData.worldPosition,
    //           rotation: controls.cameraData.worldRotation
    //       }
    //   let data = {
    //     room: "room1",
    //     user: user
    //   }
    //   //console.log(data)
    //   socket.emit("update", data)
    //   for(let user in gameScene.users){
    //     //console.log(gameScene.users[user].position)
    //     if (gameScene.users[user].userId != socket.id){
    //       if(user in meshes){
    //         meshes[user].position.x = gameScene.users[user].position.x
    //         meshes[user].position.y = gameScene.users[user].position.y - 1.6
    //         meshes[user].position.z = gameScene.users[user].position.z
    //         //[user].rotation.y = gameScene.users[user].rotation.y
    //         meshes[user].setRotationFromEuler(new THREE.Euler(0, 0, 0))
    //         meshes[user].applyQuaternion(gameScene.users[user].rotation)
    //         //meshes[user].position.set(gameScene.users[user].position.x, gameScene.users[user].position.y, gameScene.users[user].position.z)
    //       }
    //       else{
    //         meshes[user] = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0x00ff00}))
    //         loader.load("https://elasticbeanstalk-ap-south-1-889470011136.s3.ap-south-1.amazonaws.com/Soldier.glb", function (glb) {
    //           scene.add(glb.scene)
    //           meshes[user] = glb.scene
    //           gameScene.users[user].loaded = true
    //           console.log("Loaded")
    //         })
    //       }
    //     }
    //   }
    // }
    const dt = this.clock.getDelta();
    this.stats.update();
    if (this.controller) this.handleController(this.controller, dt);
    this.renderer.render(this.scene, this.camera);
  }
  // socketInit(roomId) {
  //   socket = io("http://localhost:3001");
  //   socket.on("connect", () => {
  //     console.log("Connected to server");
  //     console.log("Socket ID: "+socket.id);
  //     let data = {
  //       room: roomId
  //     }
  //     socket.emit("joinRoom", data)
  //   })
  //   socket.on("joinedRoom", (data) => {
  //     console.log(data)
  //     joinedRoom = true
  //     gameScene = data
  //     //loadPlayers(data)
  //   })
  //   socket.on("newupdate", (data) => {
  //     gameScene = data
  //   })
  // }
  
  //  loadPlayers(data) {
  //   for (let user of data.users) {
  //     console.log(user)
  //   }
  // }
}

export { App };
