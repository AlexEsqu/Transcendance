import { Scene, Mesh, MeshBuilder, Vector3, Color3, StandardMaterial, ArcRotateCamera, DirectionalLight, GroundMesh, Animation, IAnimationKey } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

export { createBall, createPaddle, createCamera, createText, createMap, createAnimation, createLight }

function createMaterial(scene: Scene, color: Color3): StandardMaterial {
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
function createBall(scene: Scene, radius: number, colorHex: string): Mesh {
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

function createLight(scene: Scene, colorHex: string): DirectionalLight {
	if (!scene || scene === undefined) return null;

	const light = new DirectionalLight("light", new Vector3(0, -10, 0), scene);
	light.diffuse = new Color3().fromHexString(colorHex);
	light.specular = light.diffuse.scale(0.9);
	return light;
}

function createPaddle(scene: Scene, height: number, width: number, depth: number, colorHex: string): Mesh {
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

function createCamera(scene: Scene, canvas): ArcRotateCamera {
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

function createMap(scene: Scene, height: number, width: number, colorHex: string): Mesh {
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

function createAnimation(name: string, target: string, keys: IAnimationKey[]): Animation {
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

