import { Engine, Scene, Mesh, MeshBuilder, Vector3, Color3, GlowLayer, Color4, StandardMaterial, ArcRotateCamera, GroundMesh, Animation, IAnimationKey } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { Pong } from './Pong_old';
import { IOptions, IScene } from './Data';

export { createBall, createPaddle, createCamera, createText, createMap, createAnimation, loadGame, createMaterial }

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
function createBall(scene: Scene, radius: number, colorHex: string): Mesh | null
{
	if (!scene || scene === undefined) return null;

	const mesh: Mesh = MeshBuilder.CreateSphere(
		'ball',
		{ diameter: radius * 2 },
		scene
	);
	const color : Color3 = new Color3().fromHexString(colorHex);
	mesh.material = createMaterial(scene, color);
	return mesh;
}

function createPaddle(scene: Scene, height: number, width: number, depth: number, colorHex: string): Mesh | null
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

function createText(text: string, color: string, fontSize: number, topPx: string, leftPx: string, gui: AdvancedDynamicTexture): TextBlock
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
function loadGame(engine: Engine, canvas: HTMLCanvasElement, options: IOptions): IScene | null
{
	if (!engine || !canvas || !options) return null;

	const id = new Scene(engine) as Scene;
	if (!id) {
		console.error("failed to create 'Scene', can't load game");
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

	const map: Mesh | null = createMap(id, Pong.MAP_HEIGHT, Pong.MAP_WIDTH, options.mapColor);

	// Exclude map from bloom effect
	// glowLayer.addExcludedMesh(map);

	//	Create the ball
	const ball = new Ball(id, options.level, options.ballColor);
	if (!ball) {
		console.error("GAME-ERROR: failed to create 'Ball', can't load game");
		return null;
	}

	//	Creates 2 paddles, one for each players
	console.log(options.paddColors[0]);
	const leftPadd = new Paddle(id, "left", Pong.MAP_WIDTH, options.level, options.paddColors[0]);
	const rightPadd = new Paddle(id, "right", Pong.MAP_WIDTH, options.level, options.paddColors[1] ?? "#a2c2e8");
	if (!leftPadd || !rightPadd) {
		console.error("GAME-ERROR: failed to create 'Paddle', can't load game");
		return null;
	}
	
	const scene: IScene = { id: id, camera: camera, ball: ball, 
		leftPadd: { paddle: leftPadd, player: null }, 
		rightPadd: { paddle: rightPadd, player: null },
		options: options,
		players: null,
		state: 0
	};

	console.log("GAME-STATE: loaded");
	return scene;
}