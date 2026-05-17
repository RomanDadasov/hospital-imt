using HospitalManagement.Application.DTOs;
using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Login successful"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest dto)
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(dto);
                return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Token refreshed"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequest dto)
        {
            await _authService.RevokeRefreshTokenAsync(dto);
            return Ok(ApiResponse<object>.SuccessResponse(new { }, "Token revoked"));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest dto)
        {
            await _authService.ForgotPasswordAsync(dto.Email);
            return Ok(ApiResponse<object>.SuccessResponse(new { }, "The password reset link has been sent to your email."));
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest dto)
        {
            try
            {
                await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Password changed successfully."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorDto dto)
        {
            try
            {
                var result = await _authService.VerifyTwoFactorCodeAsync(dto);
                return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Login successful"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("resend-2fa")]
        public async Task<IActionResult> ResendTwoFactor([FromBody] ResendTwoFactorDto dto)
        {
            try
            {
                await _authService.SendTwoFactorCodeAsync(dto.Email);
                return Ok(ApiResponse<object>.SuccessResponse(null, "The code has been resent"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }
    }
}