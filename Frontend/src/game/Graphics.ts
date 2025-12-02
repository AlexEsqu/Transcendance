import { Scene, Mesh, MeshBuilder, Vector3, Color3, StandardMaterial, ArcRotateCamera, DirectionalLight } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { Ball } from "./Ball"
import { Paddle } from './Paddle';
import { Pong } from './Pong';

function createMaterial(scene: Scene, color: Color3): StandardMaterial {
	if (!scene || scene === undefined) return null;
	if (color === undefined) color = new Color3(0.031, 0.031, 0.141);

	const meshMaterial = new StandardMaterial("ballMaterial", scene);
	//	Color/texture of the material as if it were illuminated from within
	meshMaterial.emissiveColor = color;
	meshMaterial.disableLighting = true;
	//	Set transparency between 0 & 1
	meshMaterial.alpha = 0.8;

	return meshMaterial;
}

// { diameter: Ball.RADIUS * 2, segments: 2, updatable: true },
function createBall(scene: Scene): Mesh {
	if (!scene || scene === undefined) return null;

	const mesh = MeshBuilder.CreateSphere(
		'ball',
		{ diameter: Ball.RADIUS * 2 },
		scene
	);
	// const mesh = MeshBuilder.CreateBox(
	// 	'ball',
	// 	{ size: Ball.RADIUS * 2 },
	// 	scene
	// );
	mesh.material = createMaterial(scene, new Color3(0.694, 0.824, 0.98));
	return mesh;
}

function createLight(scene: Scene): void {
	if (!scene || scene === undefined) return ;

	const light = new DirectionalLight("light", new Vector3(0, -100, 0), scene);
	light.diffuse = new Color3(0.004, 0.004, 0.102);
	light.specular = new Color3(0.059, 0.059, 0.09);
}

function createPaddle(scene: Scene): Mesh {
	if (!scene || scene === undefined) return null;

	const mesh = MeshBuilder.CreateBox(
		'paddle',
		{
			width: Paddle.WIDTH,
			height: Paddle.HEIGHT,
			depth: Paddle.DEPTH
		},
		scene
	);
	mesh.material = createMaterial(scene, new Color3(0.635, 0.761, 0.91));
	return mesh;
}

function createCamera(scene: Scene, canvas) {
	if (!scene || scene === undefined) return null;
	
	const camera = new ArcRotateCamera(
		'arCamera',
		-(Math.PI / 2), // alpha
		-(Math.PI / 2), // beta
		10, // radius
		Vector3.Zero(), // target
		scene
	);
	//	Allow to move the camera -> uncomment for debug
	// camera.attachControl(canvas, true);
}

function createVisualScoring(text: string, color: string, fontSize: number, topPx: string, leftPx: string): TextBlock {
	//	Create a fullscreen UI
	const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
	const block = new TextBlock();

	block.text = text;
	block.color = color;
	block.fontSize = fontSize;
	block.top = topPx;
	block.left = leftPx;
	advancedTexture.addControl(block);
	return block;
}

function createMap(scene: Scene): Mesh {
	if (!scene || scene === undefined) return null;

	const map = MeshBuilder.CreateGround(
		'ground',
		{ width: Pong.MAP_WIDTH, height: Pong.MAP_HEIGHT},
		scene
	);
	return map;
}

export { createBall, createPaddle, createCamera, createVisualScoring, createMap, createLight };