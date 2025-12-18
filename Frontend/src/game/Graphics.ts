import { Engine, Scene, Mesh, MeshBuilder, Vector3, Color3, GlowLayer, Color4, StandardMaterial, ArcRotateCamera, GroundMesh, Animation, IAnimationKey } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { Pong } from './Pong';
import { IOptions, IScene } from './Data';

export { createBall, createPaddle, createCamera, createText, createMap, createAnimation, loadGame }

function createMaterial(scene: Scene, color: Color3): StandardMaterial
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
function createBall(scene: Scene, radius: number, colorHex: string): Mesh
{
	if (!scene || scene === undefined) return null;

	const mesh: Mesh = MeshBuilder.CreateSphere(
		'ball',
		{ diameter: radius * 2 },
		scene
	);
	// const mesh = MeshBuilder.CreateBox(
	// 	'ball',
	// 	{ size: Ball.RADIUS * 2 },
	// 	scene
	// );
	const color : Color3 = new Color3().fromHexString(colorHex);
	mesh.material = createMaterial(scene, color);
	return mesh;
}

function createPaddle(scene: Scene, height: number, width: number, depth: number, colorHex: string): Mesh
{
	if (!scene || scene === undefined) return null;

	const mesh: Mesh = MeshBuilder.CreateBox(
		'paddle',
		{
			width: width,
			height: height,
			depth: depth
		},
		scene
	);
	mesh.material = createMaterial(scene, new Color3().fromHexString(colorHex));
	return mesh;
}

function createCamera(scene: Scene, canvas): ArcRotateCamera
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

function createText(text: string, color: string, fontSize: number, topPx: string, leftPx: string, gui: AdvancedDynamicTexture): TextBlock {
	const block: TextBlock = new TextBlock();
	block.text = text;
	block.color = color;
	block.fontSize = fontSize;
	block.top = topPx;
	block.left = leftPx;
	gui.addControl(block);
	return block;
}

function createMap(scene: Scene, height: number, width: number, colorHex: string): Mesh
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

function createAnimation(name: string, target: string, keys: IAnimationKey[]): Animation
{
	const animation = new Animation(
		name,
		target,
		50, // frames per second
		Animation.ANIMATIONTYPE_FLOAT,
		Animation.ANIMATIONLOOPMODE_CONSTANT
	);
	animation.setKeys(keys);
	return animation;
}

/**
 * 	- Create the main scene and all its elements
 */
function loadGame(engine: Engine, canvas: HTMLCanvasElement, options: IOptions, gui): IScene
{
	if (!engine || !canvas || !options) return null;
	
	let scene: IScene = { id: null, camera: null, ball: null, 
		leftPadd: { paddle: null, player: null }, 
		rightPadd: { paddle: null, player: null },
		options: options,
		players: null,
		state: 0
	};

	scene.id = new Scene(engine);
	if (!scene.id) {
		console.error("can't load game scene");
		return null;
	}

	//	Remove default background color
	scene.id.clearColor = new Color4(0, 0, 0, 0);

	scene.camera = createCamera(scene.id, canvas);

	//	Create a glow layer to add a bloom effect around meshes
	const glowLayer: GlowLayer = new GlowLayer("glow", scene.id, { mainTextureRatio: 0.6 });
	glowLayer.intensity = 0.7;
	glowLayer.blurKernelSize = 64;

	const map: Mesh = createMap(scene.id, Pong.MAP_HEIGHT, Pong.MAP_WIDTH, options.mapColor);

	// Exclude map from bloom effect
	// glowLayer.addExcludedMesh(map);

	//	Create the ball
	scene.ball = new Ball(scene.id, options.level, options.ballColor);

	//	Creates 2 paddles, one for each players and 2DText for visual scoring
	scene.leftPadd.paddle = new Paddle(scene.id, "left", Pong.MAP_WIDTH, options.level, options.paddColor);
	scene.rightPadd.paddle = new Paddle(scene.id, "right", Pong.MAP_WIDTH, options.level, options.paddColor);
	
	// const line = createText("|", "white", 38, "-150px", "0px", this.gui);
	// scene.leftPadd.scoreText = createText("0", "white", 38, "-150px", "-50px", gui);
	// scene.rightPadd.scoreText = createText("0", "white", 38, "-150px", "50px", gui);
	// scene.leftPadd.nameText = createText("", "white", 28, "-150px", "-200px", gui);
	// scene.rightPadd.nameText = createText("", "white", 28, "-150px", "200x", gui);

	console.log("GAME-STATE: loaded");
	return scene;
}