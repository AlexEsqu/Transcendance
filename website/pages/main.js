export const createScene = function () {
const createScene = function () {
	var scene = new BABYLON.Scene(engine);
	scene.createDefaultLight();

	// Set the camera
	var camera = new BABYLON.ArcRotateCamera(
		'arCamera',
		0, // alpha
		1, // beta
		10, // radius
		new BABYLON.Vector3(0, 0, 0), // target
		scene
	);
	// Allow to move the camera
	camera.attachControl(canvas, true);

	// Set the light
	var light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = -0.2;
	var ball = BABYLON.MeshBuilder.CreateSphere(
		'ball',
		{
			diameter: 0.5,
			segments: 32
		},
		scene
	);
	ball.position.y = 0.3;
	ball.position.z = 0;
	ball.position.x = 0;

	// Set a the ground
	var ground = BABYLON.MeshBuilder.CreateGround(
		'ground',
		{ 
			width: 4,
			height: 6 
		}, 
		scene
	);

	// Set a gizmo for debug
	const gizmoManager = new BABYLON.GizmoManager(scene);
	gizmoManager.positionGizmoEnabled = true;
	gizmoManager.attachToMesh(ball);

	// Code below provokes a crash
	// while (ball.position.z != 3)
	// 	ball.position.z += 0.01;
	// while (ball.position.z != -3)
	// 	ball.position.z -= 0.01;

	// Try to animate the ball
	// Try to animate the ball
	const ballAnimation = new BABYLON.Animation(
		'ballAnimation',
		'position.z',
		30,
		BABYLON.Animation.ANIMATIONTYPE_FLOAT,
		BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
	);
	const animationKeys = [];
	animationKeys.push({frame: 0, value: -3});
	animationKeys.push({frame: 30, value: 0});
	animationKeys.push({frame: 60, value: 3});
	animationKeys.push({frame: 90, value: 0});
	animationKeys.push({frame: 120, value: -3});
	ballAnimation.setKeys(animationKeys);
	ball.animations = [];
	ball.animations.push(ballAnimation);
	scene.beginAnimation(ball, 0, 120, true);

	return scene;
};
