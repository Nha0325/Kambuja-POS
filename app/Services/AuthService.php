<?php

namespace App\Services;

use App\Models\User;

class AuthService {
    public static function attempt(string $username, string $password): bool {
        $user = User::findByUsername(trim($username));

        if ($user === null) {
            return false;
        }

        if (array_key_exists('is_active', $user) && (int) $user['is_active'] !== 1) {
            return false;
        }

        $storedHash = (string) ($user['password_hash'] ?? '');
        $passwordInfo = password_get_info($storedHash);
        $usesPasswordHash = $passwordInfo['algo'] !== null && $passwordInfo['algo'] !== 0;
        $validPassword = $usesPasswordHash
            ? password_verify($password, $storedHash)
            : hash_equals($storedHash, hash('sha256', $password));

        if (!$validPassword) {
            return false;
        }

        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
            'role' => (string) $user['role'],
            'is_active' => array_key_exists('is_active', $user)
                ? (int) $user['is_active']
                : 1,
        ];

        return true;
    }

    public static function user(): ?array {
        return $_SESSION['user'] ?? null;
    }

    public static function logout(): void {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }
}
