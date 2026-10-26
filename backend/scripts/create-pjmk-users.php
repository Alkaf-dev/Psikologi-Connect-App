<?php

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = app(UserRepository::class);
$prodiId = '01M5C0V9EWP828SVQ4W8CRKD1T';

$accounts = [
    'eka',
    'yusa',
    'rusdian',
    'ahya',
    'miqdad',
    'lora',
    'firsta',
    'ica',
    'alkaf',
    'wahyu',
    'rara',
    'bayu',
];

foreach ($accounts as $index => $username) {
    $email = $username.'@psikologi.test';
    $existing = $users->findBy('email', $email);

    if ($existing === null && $username === 'yusa') {
        $existing = $users->findBy('email', 'yusa@psikologi.com');
    }

    $payload = [
        'name' => ucfirst($username),
        'email' => $email,
        'npm' => 'STF'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
        'password_hash' => Hash::make('password'),
        'role' => 'pjmk',
        'class_name' => '',
        'cohort' => '',
        'phone' => '',
        'active' => '1',
        'prodi_id' => $prodiId,
    ];

    if ($existing !== null) {
        $users->update((string) $existing['id'], $payload);
        echo "updated {$username}\n";

        continue;
    }

    $users->create($payload);
    echo "created {$username}\n";
}
