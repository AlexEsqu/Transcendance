export function replaceAvatarPathByUrl(user) {
	if (user.avatar) {
		user.avatar = user.avatar.replace(process.env.AVATARS_UPLOAD_PATH, `${process.env.DOMAIN_NAME}avatars/`);
	}
}

export async function getUserbyId(id, db) {
	return await db.prepare(`SELECT id, username, avatar FROM users WHERE id = ?`).get(id);
}

