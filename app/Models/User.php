<?php

namespace App\Models;

use App\Core\Database;

class User {
    public static function findByUsername(string $username): ?array {
        $statement = Database::getConnection()->prepare(
            'SELECT * FROM users WHERE username = ? LIMIT 1'
        );
        $statement->execute([$username]);
        $user = $statement->fetch();

        return $user ?: null;
    }
}
