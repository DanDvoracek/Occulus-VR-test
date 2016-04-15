/*
|-- Setup three.js WebGL renderer
*/
var renderer = new THREE.WebGLRenderer( { antialias: true } );

/*
|-- Append the canvas element created by the renderer to document body element.
*/
document.body.appendChild( renderer.domElement );

/*
|-- Create the scene
*/
var scene = new THREE.Scene();

/*
|-- Create the camera
*/
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set(0, 30, 0);
// camera position for a wider view (testing purpose)
// camera.position.set(0, 150, 450);

/*
|-- Apply VR headset orientation and positional to camera.
*/
var controls = new THREE.VRControls( camera );

/*
|-- Apply VR stereo rendering to renderer
*/
var effect = new THREE.VREffect( renderer );
effect.setSize( window.innerWidth, window.innerHeight );

/*
|-- Add lightning
*/
var spotLight = new THREE.SpotLight( 0x404040 );
spotLight.position.set( 0, 1000, 0 );
spotLight.castShadow = true;
scene.add( spotLight );
/*
|-- Create basic shape to work with (in our case a simple quadrilateral is enough: floor, roof and walls can use the same shape)
*/
var geometry = new THREE.BoxGeometry( 300, 1, 300 );

/*
|--- Texture for the floor
*/
var floorTexture = new THREE.ImageUtils.loadTexture( 'images/wood-floor.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var roofMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );

/*
|--- Texture for the walls
*/
var wallTexture = new THREE.ImageUtils.loadTexture( 'images/neutral-wall.jpg' );
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping; 
wallTexture.repeat.set( 4, 4 );
// need to make it seperate per wall in order to have control on each wall when the colour changes
var backWallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture, side: THREE.DoubleSide } );
var leftWallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture, side: THREE.DoubleSide } );
var rightWallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture, side: THREE.DoubleSide } );

/*
|--- Create elements
*/
// Floor
var floor = new THREE.Mesh( geometry, floorMaterial );
floor.name = "floor";
// Back wall
var backWall = new THREE.Mesh(geometry, backWallMaterial );
backWall.rotation.x = Math.PI/180 * 90;
backWall.position.set(0,150,-150);
backWall.name = "backwall";
// Left wall
var leftWall = new THREE.Mesh(geometry, leftWallMaterial );
leftWall.rotation.x = Math.PI/180 * 90;
leftWall.rotation.z = Math.PI/180 * 90;
leftWall.position.set(-150,150,0);
leftWall.name = "leftwall";
// Right wall
var rightWall = new THREE.Mesh(geometry, rightWallMaterial );
rightWall.rotation.x = Math.PI/180 * 90;
rightWall.rotation.z = Math.PI/180 * 90;
rightWall.position.set(150,150,0);
rightWall.name = "rightwall";
// Roof
var roof = new THREE.Mesh(geometry, roofMaterial );
roof.position.set(0,300,0);
roof.name = "roof";

// Colour blocks on the floor
var colourOption = new THREE.BoxGeometry( 20, 20, 20 );
var copperBlush = new THREE.MeshBasicMaterial({ color: 0xCA8E78 });
var colourMaterial2 = new THREE.MeshBasicMaterial({ color: 0x90b6db });
// box right
var colourCopperBlush = new THREE.Mesh(colourOption, copperBlush );
colourCopperBlush.position.set(15,0,-20);
colourCopperBlush.name = "copperBlushBox";
// box left
var colourBlue = new THREE.Mesh(colourOption, colourMaterial2 );
colourBlue.position.set(-15,0,-20);
colourBlue.name = "blueBox";

/*
|--- Set a raycaster and a render method to find what the user look at
*/
var raycaster = new THREE.Raycaster();
var vector = new THREE.Vector2();

function render() {
	// update the picking ray with the camera 
	raycaster.setFromCamera( vector, camera );	
	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children ),
		copperColor = 0xCA8E78,
		blueColor = 0x90b6db,
		currentColor;
	// for each object seen by the user on the scene...check the name and do smth
	for ( var i = 0; i < intersects.length; i++ ) {

		if((intersects[ i ].object.name) == "copperBlushBox"){
			currentColor = copperColor;
		} else if ((intersects[ i ].object.name) == "blueBox"){
			currentColor = blueColor;
		} 

		if (currentColor) {
			backWall.material.color.set( currentColor );
			leftWall.material.color.set( currentColor );
			rightWall.material.color.set( currentColor );
		}
	
	}
	renderer.render( scene, camera );
	window.requestAnimationFrame(render);
}
// kick off render() at the start
render();

/*
|--- Add elements to the scene
*/
scene.add( floor );
scene.add( backWall );
scene.add( leftWall );
scene.add( rightWall );
scene.add( roof );
scene.add( colourCopperBlush );
scene.add( colourBlue );

/*
|--- Request animation frame loop function
*/
function animate() {
	/*
	|--- Update VR headset position and apply to camera.
	*/
	controls.update();

	/*
	|--- Render the scene through the VREffect.
	*/
	effect.render( scene, camera );

	requestAnimationFrame( animate );
}

/*
|--- Kick off animation loop
*/
animate();

/*
|--- Listen for double click event to enter full-screen VR mode
*/
document.body.addEventListener( 'dblclick', function() {
	effect.setFullScreen( true );
});

/*
|--- Listen for keyboard event and zero positional sensor on appropriate keypress.
*/
function onkey(event) {
	event.preventDefault();

if (event.keyCode == 90) { // z
	controls.zeroSensor();
}
};

window.addEventListener("keydown", onkey, true);


/*
|--- Handle window resizes
*/
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	effect.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );