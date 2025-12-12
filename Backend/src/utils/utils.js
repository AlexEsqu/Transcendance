export function formatUserObject(user) {
	if (user.avatar) {
		user.avatar = user.avatar.replace(
			process.env.AVATARS_UPLOAD_PATH,
			`${process.env.DOMAIN_NAME}avatars/`
		);
	}
	user.is_active = computeActive(user.last_activity);
	delete user.last_activity;
}

export async function getUserbyId(id, db) {
	return db
		.prepare(
			`SELECT id, username, avatar, last_activity FROM users WHERE id = ?`
		)
		.get(id);
}

export function computeActive(last_active_at) {
	if (!last_active_at) {
		return false;
	}
	const last = new Date(last_active_at);
	const diff = (Date.now() - last.getTime()) / 60000; // in minutes
	return diff < 5;
}
