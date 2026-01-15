#!/bin/bash
set -e

echo "📦 Starting route renaming..."

# -------- Auth --------
echo "🔑 Renaming auth routes..."
mv routes/auth/login.js routes/auth/login.route.js
mv routes/auth/logout.js routes/auth/logout.route.js
mv routes/auth/refresh.js routes/auth/refresh.route.js
mv routes/auth/signup.js routes/auth/signup.route.js
mv routes/auth/2faLogin.js routes/auth/two-factor.route.js
mv routes/auth/sendEmailVerificationRoute.js routes/auth/email-verification.send.route.js
mv routes/auth/verifyEmail.js routes/auth/email-verification.route.js
mkdir -p routes/auth/oauth
mv routes/auth/ft_oauth.js routes/auth/oauth/start.route.js
mv routes/auth/ft_oauthCallbackRoute.js routes/auth/oauth/callback.route.js

# -------- Users --------
echo "👤 Renaming user routes..."
mv routes/users/getUsers.js routes/users/list.route.js
mv routes/users/deleteUser.js routes/users/delete-me.route.js
mv routes/users/putUserPassword.js routes/users/password.route.js
mv routes/users/postPassword.js routes/users/password.post.tmp.js
mv routes/users/putUserAvatar.js routes/users/avatar.route.js
mv routes/users/deleteUserAvatar.js routes/users/avatar.delete.tmp.js
mv routes/users/updateUsername.js routes/users/username.route.js
mv routes/users/get2fa.js routes/users/two-factor.route.js
mv routes/users/toggle2fa.js routes/users/two-factor.toggle.tmp.js

# Friends
echo "👥 Renaming friends routes..."
mkdir -p routes/users/friends
mv routes/users/friends/getFriends.js routes/users/friends/friends.route.js
mv routes/users/friends/postFriend.js routes/users/friends/friends.post.tmp.js
mv routes/users/friends/deleteFriend.js routes/users/friends/friends.delete.tmp.js

# Guests
echo "🛎 Renaming guest routes..."
mkdir -p routes/users/guests
mv routes/users/guests/postGuest.js routes/users/guests/create.route.js

# -------- Matches --------
echo "🏓 Renaming matches routes..."
mv routes/matches/getMatches.js routes/matches/list-create.route.js
mv routes/matches/postMatch.js routes/matches/list-create.post.tmp.js
mv routes/matches/getUserMatches.js routes/matches/by-user.route.js

echo "✅ Renaming complete!"
echo "⚠️ Manual steps remaining:"
echo "- Merge any *.tmp.js files into their target route files (list-create, password, avatar, two-factor, friends)"
echo "- Update imports in index.js files"
echo "- Check all Fastify registrations"

