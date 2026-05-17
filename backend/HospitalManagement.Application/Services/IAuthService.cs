using HospitalManagement.Application.DTOs;
using HospitalManagement.DTOs;
namespace HospitalManagement.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task SendTwoFactorCodeAsync(string email);
        Task<AuthResponseDto> VerifyTwoFactorCodeAsync(VerifyTwoFactorDto dto);
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequest request);
        Task RevokeRefreshTokenAsync(RefreshTokenRequest request);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(string token, string newPassword);
    }
}