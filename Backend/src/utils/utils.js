export function modifyUserAvatarKeyName(user) {
	user.avatar_url = user.avatar_path;
	delete user.avatar_path;

	if (user.avatar_url) {
		user.avatar_url = user.avatar_url.replace(process.env.AVATARS_UPLOAD_PATH, `${process.env.DOMAIN_NAME}avatars/`);
	}
}

export async function getUserbyId(id, db) {
	return await db.prepare(`SELECT id, username, avatar_path FROM users WHERE id = ?`).get(id);
}

