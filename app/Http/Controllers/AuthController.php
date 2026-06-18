<?php

namespace App\Http\Controllers;

use App\Models\User;

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

        if (login_user($username, $password)) { // using legacy function for now
            return $this->redirect('/dashboard');
        }

        return $this->view('auth.login', ['error' => 'Invalid username or password']);
    }

    public function logout() {
        logout_user(); // using legacy function
    }
}
