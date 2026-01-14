import { Engine, Scene, Mesh, MeshBuilder, Vector3, Color3, GlowLayer, Color4, StandardMaterial,
	 ArcRotateCamera, GroundMesh, Animation, IAnimationKey } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { GAME_SIZE, IOptions, IScene } from './pongData';

/************************************************************************************************************/

export { createText, createAnimation, loadGame, drawScore, drawName }

/************************************************************************************************************
 * 		SETTING 3D OBJECTS																					*
 ***********************************************************************************************************/

function createMaterial(scene: Scene, color: Color3): StandardMaterial | null
{
	if (!scene || scene === undefined) return null;
	if (color === undefined) color = new Color3(0.031, 0.031, 0.141);

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
	const color : Color3 = new Color3().fromHexString(colorHex);
	mesh.material = createMaterial(scene, color);

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
	mesh.material = createMaterial(scene, new Color3().fromHexString(colorHex));

	return mesh;
}

function createCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera | null
{
	if (!scene || scene === undefined) return null;

	const camera: ArcRotateCamera = new ArcRotateCamera(
		'arCamera',
		-(Math.PI / 2), // alpha
		0, // beta
		12, // radius
		Vector3.Zero(), // target
		scene
	);
	//	Allow to move the camera -> uncomment for debug
	// camera.attachControl(canvas, true);

	return camera;
}

function createText(
	text: string, color: string, fontSize: number, topPx: string, leftPx: string, gui: AdvancedDynamicTexture): TextBlock
{
	const block: TextBlock = new TextBlock();
	block.text = text;
	block.color = color;
	block.fontSize = fontSize;
	block.top = topPx;
	block.left = leftPx;
	gui.addControl(block);
	return block;
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
	return map;
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

/**
 * 	- Create the main scene and all its elements
 */
function loadGame(engine: Engine, canvas: HTMLCanvasElement, options: IOptions): IScene | null
{
	if (!engine || !canvas || !options) return null;

	const id = new Scene(engine) as Scene;
	if (!id) {
		console.error("GAME-FRONT: 'scene' creation failed");
		return null;
	}

	//	Remove default background color
	id.clearColor = new Color4(0, 0, 0, 0);

	const camera = createCamera(id, canvas);

	//	Create a glow layer to add a bloom effect around meshes
	const glowLayer: GlowLayer = new GlowLayer("glow", id, { mainTextureRatio: 0.6 });
	glowLayer.intensity = 0.7;
	glowLayer.blurKernelSize = 64;
	console.log(options.mapColor);

	const map: Mesh | null = createMap(id, GAME_SIZE.MAP_HEIGHT, GAME_SIZE.MAP_WIDTH, options.mapColor);

	// Exclude map from bloom effect
	// glowLayer.addExcludedMesh(map);

	//	Create the ball
	const ball: Mesh | null = setupBall(id, options.ballColor);
	if (!ball) {
		console.error("GAME-FRONT: failed to create 'Ball', can't load game");
		return null;
	}

	//	Creates 2 paddles, one for each players
	const leftPadd: Mesh | null = setupPaddle(id, options.paddColors[0], 'left');
	const rightPadd: Mesh | null = setupPaddle(id, options.paddColors[Math.min(1, options.paddColors.length - 1)] ?? "#a2c2e8", 'right');
	if (!leftPadd || !rightPadd) {
		console.error("GAME-FRONT: failed to create 'Paddle', can't load game");
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

	console.log("GAME-FRONT: game loaded");
	return scene;
}

/************************************************************************************************************
 * 		DRAWING User Interface																				*
 ***********************************************************************************************************/

// FYI: score1 is the player2
function drawScore(score1: number, score2: number): void
{
	const player1Score = document.getElementById('player1-score');
	const player2Score = document.getElementById('player2-score');

	if (player1Score)
		player1Score.textContent = score1.toString();

	if (player2Score)
		player2Score.textContent = score2.toString();
}

function drawName(player1: string, player2: string, nbRound: number): void
{
	const player1Name = document.getElementById('player1-name');
	const player2Name = document.getElementById('player2-name');

	if (player1Name)
		player1Name.textContent = player1.substring(0, 10) || 'You';
	if (player2Name)
		player2Name.textContent = player2.substring(0, 10) || "Robot";
}