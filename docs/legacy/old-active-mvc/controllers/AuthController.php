<?php

namespace App\Http\Controllers;

use App\Services\AuthService;

class AuthController extends Controller {
    public function showLoginForm() {
        if (isset($_SESSION['user'])) {
            return $this->redirect('/dashboard');
        }
        return $this->view('auth.login');
    }

    public function login() {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (AuthService::attempt($username, $password)) {
            return $this->redirect('/dashboard');
        }

        return $this->view('auth.login', ['error' => 'Invalid username or password']);
    }

    public function logout() {
        AuthService::logout();
        return $this->redirect('/login');
    }
}
