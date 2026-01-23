import { Engine, Scene, Mesh, MeshBuilder, Vector3, Color3, GlowLayer, Color4, StandardMaterial,
	 ArcRotateCamera, GroundMesh, Animation, IAnimationKey } from '@babylonjs/core';
import { GAME_SIZE, IOptions, IScene, PlayerState, IPlayer } from './pongData';

/************************************************************************************************************/

export { loadGame, openingAnimation, createMaterial, drawScore, drawName }

/************************************************************************************************************
 * 		SETTING 3D OBJECTS																					*
 ***********************************************************************************************************/

function createMaterial(scene: Scene, colorHex: string): StandardMaterial | null
{
	if (!scene || scene === undefined) return null;
	
	const color: Color3 = new Color3().fromHexString(colorHex);

	const meshMaterial: StandardMaterial = new StandardMaterial("Material", scene);
	//	Color/texture of the material as if it were illuminated from within
	meshMaterial.emissiveColor = color;
	meshMaterial.disableLighting = true;
	//	Set transparency between 0 & 1
	meshMaterial.alpha = 0.8;

	return meshMaterial;
}

// { diameter: Ball.RADIUS * 2, segments: 2, updatable: true },
function createBallMesh(scene: Scene, radius: number, colorHex: string): Mesh
{
	const mesh: Mesh = MeshBuilder.CreateSphere(
		'ball',
		{ diameter: radius * 2 },
		scene
	);
	mesh.material = createMaterial(scene, colorHex);

	return mesh;
}

function creatPaddleMesh(scene: Scene, colorHex: string): Mesh
{
	const mesh: Mesh = MeshBuilder.CreateBox(
		'paddle',
		{
			width: GAME_SIZE.PADD_WIDTH,
			height: GAME_SIZE.PADD_HEIGHT,
			depth: GAME_SIZE.PADD_DEPTH
		},
		scene
	);
	mesh.material = createMaterial(scene, colorHex);

	return mesh;
}

function createMap(scene: Scene, height: number, width: number, colorHex: string): Mesh | null
{
	if (!scene || scene === undefined) return null;

	const map: GroundMesh = MeshBuilder.CreateGround(
		'ground',
		{ width: width, height: height},
		scene
	);
	const mapMaterial: StandardMaterial = new StandardMaterial("Material", scene);
	mapMaterial.emissiveColor = new Color3().fromHexString(colorHex);
	map.material = mapMaterial;
	
	// const border: GroundMesh = MeshBuilder.CreateGround(
	// 	'border',
	// 	{
	// 		width: 0.1, height: height
	// 	},
	// 	scene
	// );

	return map;
}

/************************************************************************************************************
 * 		CAMERA & ANIMATION																					*
 ***********************************************************************************************************/

function createCamera(scene: Scene, matchLocation: string): ArcRotateCamera | null
{
	if (!scene || scene === undefined) return null;

	// if (matchLocation === 'remote')
	// {
	// 	const camera: ArcRotateCamera = new ArcRotateCamera(
	// 		'arCamera',
	// 		0, // alpha
	// 		Math.PI / 3, // beta
	// 		13, // radius
	// 		new Vector3((GAME_SIZE.MAP_WIDTH / 2) - 3, 0.5, 0.0), // target
	// 		scene
	// 	);
	// 	return camera;
	// }
	// else
	// {
	const camera: ArcRotateCamera = new ArcRotateCamera(
		'arCamera',
		-(Math.PI / 2), // alpha
		0, // beta
		13, // radius
		new Vector3(0.0, -1, 0.0), // target
		scene
	);
	return camera;
	// }
	//	Allow to move the camera with the mouse -> uncomment for debug
	// camera.attachControl(canvas, true);
}

function createAnimation(username: string, target: string, keys: IAnimationKey[]): Animation
{
	const animation = new Animation(
		username,
		target,
		50, // frames per second
		Animation.ANIMATIONTYPE_FLOAT,
		Animation.ANIMATIONLOOPMODE_CONSTANT
	);
	animation.setKeys(keys);
	return animation;
}

/**
 * 	- Camera tilt animation when the game launches
 */
function openingAnimation(scene: IScene): void
{
	console.log("GAME-APP: opening scene animation");

	const endCameraAngle: number = Math.PI / 4;

	const keys = [
		{ frame: 0, value: 0 },
		{ frame: 60, value: endCameraAngle }
	];
	const animation = createAnimation("cameraBetaAnim", "beta", keys);

	if (scene.camera && scene.id) {
		scene.camera.animations = [];
		scene.camera.animations.push(animation);
		scene.id.beginAnimation(scene.camera, 0, 60, false);
		setTimeout(() => {
			scene.state = PlayerState.waiting;
		}, 200);
	}
}

/************************************************************************************************************
 * 		SETTING PONG GAME SCENE																				*
 ***********************************************************************************************************/

/**
 * 	- Create the main scene and all its elements
 */
function loadGame(engine: Engine, canvas: HTMLCanvasElement, options: IOptions): IScene | null
{
	if (!engine || !canvas || !options) return null;

	const id = new Scene(engine) as Scene;
	if (!id) {
		console.error("GAME-APP: 'scene' creation failed");
		return null;
	}

	//	Remove default background color
	id.clearColor = new Color4(0, 0, 0, 0);

	const camera = createCamera(id, options.matchLocation);

	//	Create a glow layer to add a bloom effect around meshes
	const glowLayer: GlowLayer = new GlowLayer("glow", id, { mainTextureRatio: 0.6 });
	glowLayer.intensity = 0.7;
	glowLayer.blurKernelSize = 64;

	const map: Mesh | null = createMap(id, GAME_SIZE.MAP_HEIGHT, GAME_SIZE.MAP_WIDTH, options.mapColor);

	// Exclude map from bloom effect
	// glowLayer.addExcludedMesh(map);

	//	Create the ball
	const ball: Mesh | null = setupBall(id, options.ballColor);
	if (!ball) {
		console.error("GAME-APP: failed to create 'Ball', can't load game");
		return null;
	}

	//	Creates 2 paddles, one for each players
	const leftPadd: Mesh | null = setupPaddle(id, options.paddColors[0], 'left');
	const rightPadd: Mesh | null = setupPaddle(id, options.paddColors[Math.min(1, options.paddColors.length - 1)] ?? "#a2c2e8", 'right');
	if (!leftPadd || !rightPadd) {
		console.error("GAME-APP: failed to create 'Paddle', can't load game");
		return null;
	}
	
	const scene: IScene = { 
		id: id, 
		camera: camera, 
		ball: ball, 
		leftPadd: { mesh: leftPadd, player: null },
		rightPadd: { mesh: rightPadd, player: null },
		options: options,
		players: [],
		state: 0
	};

	console.log("GAME-APP: game scene loaded");
	return scene;
}

function setupBall(scene: Scene, color: string): Mesh | null
{
	if (!scene || scene === undefined) return null;

	const ball: Mesh = createBallMesh(scene, GAME_SIZE.BALL_RADIUS, color);
	ball.position = new Vector3(0.0, GAME_SIZE.MAP_Y, 0.0);
	return ball;
}

function setupPaddle(scene: Scene, color: string, side: string): Mesh | null
{
	if (!scene || scene === undefined) return null;

	const paddle: Mesh = creatPaddleMesh(scene, color);
	paddle.rotation.y = Math.PI / 2;
	// paddle.position = new Vector3((GAME_SIZE.MAP_WIDTH / 2), GAME_SIZE.MAP_Y, 0.0);
	if (side === 'left')
		paddle.position = new Vector3(-(GAME_SIZE.MAP_WIDTH / 2), GAME_SIZE.MAP_Y, 0.0);
	else
		paddle.position = new Vector3((GAME_SIZE.MAP_WIDTH / 2), GAME_SIZE.MAP_Y, 0.0);


	return paddle;
}

/************************************************************************************************************
 * 		DRAWING UserInterface																				*
 ***********************************************************************************************************/

// FYI: score1 is the player2
function drawScore(player1: IPlayer | null, player2: IPlayer | null): void
{
	if (!player1 || !player2)
		return ;

	const player1Score = document.getElementById('player1-score');
	const player2Score = document.getElementById('player2-score');

	if (player1Score)
	{
		player1Score.textContent = player1.score.toString();
		player1Score.style.color = player1.color;
	}

	if (player2Score)
	{
		player2Score.textContent = player2.score.toString();
		player2Score.style.color = player2.color;
	}
}

function drawName(player1: IPlayer | null, player2: IPlayer | null): void
{
	if (!player1 || !player2)
		return ;

	const player1Name = document.getElementById('player1-name');
	const player2Name = document.getElementById('player2-name');

	if (player1Name)
	{
		player1Name.textContent = player1.username.substring(0, 10) || 'You';
		player1Name.style.color = player1.color;
	}
	if (player2Name)
	{
		player2Name.textContent = player2.username.substring(0, 10) || "Robot";
		player2Name.style.color = player2.color;
	}
}