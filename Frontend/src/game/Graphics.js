import { MeshBuilder, Vector3, Color3, StandardMaterial, ArcRotateCamera } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { Ball } from "./Ball"
import { Paddle } from './Paddle';
import { Pong } from './Pong';

function createMaterial(scene) {
	if (!scene || scene === undefined) return null;

	const meshMaterial = new StandardMaterial("ballMaterial", scene);
	//	Color/texture of the material as if it were illuminated from within
	meshMaterial.emissiveColor = new Color3(0.78, 0.78, 0.78);
	meshMaterial.disableLighting = true;
	//	Set transparency between 0 & 1
	meshMaterial.alpha = 0.7;

	return meshMaterial;
}

function createBall(scene) {
	if (!scene || scene === undefined) return null;

	const mesh = MeshBuilder.CreateSphere(
		'ball',
		{ diameter: Ball.RADIUS * 2, segments: 2, updatable: true },
		scene
	);
	mesh.material = createMaterial(scene);
	return mesh;
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
	mesh.material = createMaterial(scene);
	return mesh;
}

function createCamera(scene, canvas) {
	if (!scene || scene === undefined) return null;
	
	const camera = new ArcRotateCamera(
		'arCamera',
		-(Math.PI / 2), // alpha
		Math.PI / 4, // beta
		12, // radius
		Vector3.Zero(), // target
		scene
	);
	//	Allow to move the camera -> uncomment for debug
	// camera.attachControl(canwvas, true);
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
	mapMaterial.emissiveColor = new Color3(0.01, 0.01, 0.01);
	mapMaterial.disableLight = true;
	map.material = mapMaterial;
	return map;
}

export { createBall, createPaddle, createCamera, createVisualScoring, createMap };