import { MeshBuilder, Vector3, Color3, StandardMaterial, ArcRotateCamera, DirectionalLight } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { Ball } from "./Ball"
import { Paddle } from './Paddle';
import { Pong } from './Pong';

function createMaterial(scene, color) {
	if (!scene || scene === undefined) return null;
	if (color === undefined) color = new Color3(0.031, 0.031, 0.141);

	const meshMaterial = new StandardMaterial("ballMaterial", scene);
	//	Color/texture of the material as if it were illuminated from within
	// meshMaterial.diffuseColor = new Color3(0, 0, 0);
	meshMaterial.emissiveColor = color;
	meshMaterial.disableLighting = true;
	//	Set transparency between 0 & 1
	meshMaterial.alpha = 0.9;

	return meshMaterial;
}

// { diameter: Ball.RADIUS * 2, segments: 2, updatable: true },
function createBall(scene) {
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
	mesh.material = createMaterial(scene, new Color3(0.749, 0.749, 0.749));
	return mesh;
}

function createLight(scene) {
	if (!scene || scene === undefined) return ;

	const light = new DirectionalLight("light", new Vector3(0, -1, 0), scene);
	light.diffuse = new Color3(0.004, 0.004, 0.012);
	light.specular = new Color3(0.059, 0.059, 0.09);
	// light.specular = new Color3(0.016, 0.02, 0.271);
}

function createPaddle(scene) {
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
	mesh.material = createMaterial(scene, new Color3(0.749, 0.749, 0.749));
	return mesh;
}

function createCamera(scene, canvas) {
	if (!scene || scene === undefined) return null;
	
	const camera = new ArcRotateCamera(
		'arCamera',
		-(Math.PI / 2), // alpha
		0, // beta
		10, // radius
		Vector3.Zero(), // target
		scene
	);
	//	Allow to move the camera -> uncomment for debug
	// camera.attachControl(canvas, true);
}

function create2DText() {
	const block = new TextBlock();

	block.text = text;
	block.color = color;
	block.fontSize = fontSize;
	block.top = topPx;
	block.left = leftPx;
	return block;
}

function createVisualScoring(text, color, fontSize, topPx, leftPx) {
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

function createMap(scene) {
	if (!scene || scene === undefined) return null;

	const map = MeshBuilder.CreateGround(
		'ground',
		{ width: Pong.MAP_WIDTH, height: Pong.MAP_HEIGHT},
		scene
	);
	const mapMaterial = new StandardMaterial("mapMaterial", scene);
	mapMaterial.diffuseColor = new Color3(0.031, 0.031, 0.141);
	mapMaterial.disableLight = true;
	map.material = mapMaterial;
	return map;
}

export { createBall, createPaddle, createCamera, createVisualScoring, createMap, createLight };