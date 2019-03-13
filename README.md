# larapiauth
An authentication API boilerplate built from Laravel that can be used for starting any new app.

# Package versions
- Laravel 5.8.3
- L5-Swagger 5.8.x
- Passport 7.2

# Features
- Register
- Activate user (after registration)
- Login
- Logout
- Get user
- Reset password (forgot password)
- Change password

# Installing
- Run "composer install"
- Run "npm install"
- Create a new database
- Clone the .env.example file and rename it to .env
- Config database information and mail server information in .env
- Run "php artisan migrate" to generate DB schema
- Run "php artisan passport:install" to generate encryption key and oauth_clients table data
- Run "php artisan key:generate" to generate application key
- Run "sudo chmod -R 777 storage" (on mac or linux) or "chmod -R 777 storage" (on windows) to grant permission for the app to access/modify storage folder

# Testing
- Run "php artisan l5-swagger:generate" to generate API documentations
- Run "php artisan serve" to start the serve
- Go to localhost:8000/api/documentation to access the api list
