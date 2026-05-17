using HospitalManagement.DTOs;

namespace HospitalManagement.Services
{
    public interface IUserService
    {
        Task<UserResponseDto?> GetProfileAsync(string userId);
        Task<UserResponseDto?> UpdateProfileAsync(string userId, UpdateProfileDto dto);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto);
        Task<bool> ResetStaffPasswordAsync(string staffUserId, string newPassword);
    }
}
