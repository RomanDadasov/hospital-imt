using HospitalManagement.DTOs;
using HospitalManagement.Models;
using Microsoft.AspNetCore.Identity;

namespace HospitalManagement.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserResponseDto?> GetProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null) return null;
            var roles = await _userManager.GetRolesAsync(user);
            return new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roles,
                ProfileImageUrl = ResolveImageUrl(user.ProfileImagePath)
            };
        }

        public async Task<UserResponseDto?> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null) return null;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            var roles = await _userManager.GetRolesAsync(user);
            return new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roles,
                ProfileImageUrl = ResolveImageUrl(user.ProfileImagePath) 
            };
        }

        
        private static string? ResolveImageUrl(string? profileImagePath)
        {
            if (string.IsNullOrEmpty(profileImagePath)) return null;
            if (profileImagePath.StartsWith("http")) return profileImagePath;
            return $"/api/users/profiles/{profileImagePath}";
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                throw new InvalidOperationException("User not found.");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new InvalidOperationException("New passwords do not match.");

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _userManager.UpdateAsync(user);

            return true;
        }

        public async Task<bool> ResetStaffPasswordAsync(string staffUserId, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(staffUserId);
            if (user is null) throw new InvalidOperationException("User not found");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            await _userManager.UpdateSecurityStampAsync(user);
            return true;
        }
    }
}
