<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\User;
use App\Notifications\RegisterActivate;
use App\Notifications\PasswordResetRequest;
use App\Notifications\PasswordResetSuccess;
use App\Notifications\PasswordChangeSuccess;
use App\PasswordReset;
use App\Http\AppResponse;
use Validator;

class AuthController extends Controller
{
    /**
     * Register
     * @bodyParam  name string required Name
     * @bodyParam  email string required Email
     * @bodyParam  password string required Password
     * @bodyParam password_confirmation string required Confirmation password
     */
    public function register(Request $request)
    {
        // Validate input data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|confirmed'
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'errors'=>$validator->errors()], AppResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Create user
        $user = new User([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'activation_token' => str_random(60)
        ]);
        $user->save();

        // Send email with activation link
        $user->notify(new RegisterActivate($user));

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'data' => $user], AppResponse::HTTP_OK);
    }

    /**
     * Login
     * @bodyParam email string required Email
     * @bodyParam password string required Password
     * @bodyParam remember_me boolean Remember me
     */
    public function login(Request $request)
    {
        // Validate input data
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember_me' => 'boolean'
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'errors'=>$validator->errors()], AppResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $credentials = request(['email', 'password']);
        $credentials['active'] = 1;
        $credentials['deleted_at'] = null;

        // Check the combination of email and password, also check for activation status
        if(!Auth::attempt($credentials)) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => 'Wrong combination of email and password or email has not been verified'], AppResponse::HTTP_UNAUTHORIZED);
        }

        $user = $request->user();
        // Get access token
        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->token;
        // Add 1 week duration if user choose remember_me
        if ($request->remember_me)
            $token->expires_at = Carbon::now()->addWeeks(1);
        $token->save();

        // Prepare response data
        $data = [
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
            'expires_at' => Carbon::parse(
                $tokenResult->token->expires_at
            )->toDateTimeString()
        ];

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'data' => $data], AppResponse::HTTP_OK);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'message' => 'Successfully logged out'], AppResponse::HTTP_OK);
    }

    /**
     * Get user
     */
    public function getUser(Request $request)
    {
        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'data' => $request->user()], AppResponse::HTTP_OK);
    }

    /**
     * Activate user
     */
    public function activate($token)
    {
        $user = User::where('activation_token', $token)->first();
        // If the token is not existing, throw error
        if (!$user) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => 'This activation token is invalid'], AppResponse::HTTP_BAD_REQUEST);
        }
        // Update activation info
        $user->active = true;
        $user->activation_token = '';
        $user->email_verified_at = Carbon::now();
        $user->save();

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'data' => $user], AppResponse::HTTP_OK);
    }

    /**
     * Create password reset token
     * @bodyParam email string required Email
     */
    public function createPasswordResetToken(Request $request)
    {
        // Validate input data
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'errors'=>$validator->errors()], AppResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = User::where('email', $request->email)->first();
        // If the email is not existing, throw error
        if (!$user) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => "We can't find a user with that e-mail address"], AppResponse::HTTP_BAD_REQUEST);
        }
        // Create or update token
        $passwordReset = PasswordReset::updateOrCreate(
            ['email' => $user->email],
            [
                'email' => $user->email,
                'token' => str_random(60)
             ]
        );
        if ($user && $passwordReset) {
            $user->notify(new PasswordResetRequest($passwordReset->token));
        }

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'message' => "We have e-mailed your password reset link"], AppResponse::HTTP_OK);
    }

    /**
     * Find password reset token
     */
    public function findPasswordResetToken($token)
    {
        // Make sure the password reset token is findable, otherwise throw error
        $passwordReset = PasswordReset::where('token', $token)->first();
        if (!$passwordReset) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => "This password reset token is invalid"], AppResponse::HTTP_BAD_REQUEST);
        }

        if (Carbon::parse($passwordReset->updated_at)->addMinutes(720)->isPast()) {
            $passwordReset->delete();
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => "This password reset token is invalid"], AppResponse::HTTP_BAD_REQUEST);
        }

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'data' => $passwordReset], AppResponse::HTTP_OK);
    }

     /**
     * Reset password
     * @bodyParam email string required Email
     * @bodyParam password string required Password
     * @bodyParam password_confirmation string required Confirmation password
     * @bodyParam token string required Token
     */
    public function resetPassword(Request $request)
    {
        // Validate input data
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string|confirmed',
            'token' => 'required|string'
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'errors'=>$validator->errors()], AppResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $passwordReset = PasswordReset::where([
            ['token', $request->token],
            ['email', $request->email]
        ])->first();
        if (!$passwordReset) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => "This password reset token is invalid"], AppResponse::HTTP_BAD_REQUEST);
        }

        $user = User::where('email', $passwordReset->email)->first();
        if (!$user) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => "We can't find a user with that e-mail address"], AppResponse::HTTP_BAD_REQUEST);
        }

        // Save new password
        $user->password = bcrypt($request->password);
        $user->save();
        // Delete password reset token
        $passwordReset->delete();
        // Send notification email
        $user->notify(new PasswordResetSuccess($passwordReset));

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'data' => $user], AppResponse::HTTP_OK);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $email = $user->email;
        // Validate input data
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'new_password' => 'required|string|confirmed'
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'errors'=>$validator->errors()], AppResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check if the combination of email and password is correct, if it is then proceed, if no, throw error
        $credentials = request(['password']);
        $credentials['email'] = $email;
        $credentials['active'] = 1;
        $credentials['deleted_at'] = null;

        // Check the combination of email and password, also check for activation status
        if(!Auth::guard('web')->attempt($credentials)) {
            return response()->json(['success' => AppResponse::STATUS_FAILURE, 'message' => 'Wrong combination of email and password or email has not been verified'], AppResponse::HTTP_UNAUTHORIZED);
        }

        // Save new password
        $user->password = bcrypt($request->new_password);
        $user->save();

        // Send notification email
        $user->notify(new PasswordChangeSuccess());

        return response()->json(['success' => AppResponse::STATUS_SUCCESS, 'data' => $user], AppResponse::HTTP_OK);
    }
}
