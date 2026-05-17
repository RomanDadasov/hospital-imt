using Microsoft.AspNetCore.Identity;
namespace HospitalManagement.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}".Trim();
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public string? ProfileImagePath { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTimeOffset? PasswordResetTokenExpiry { get; set; }
        public string? TwoFactorCode { get; set; }
        public DateTimeOffset? TwoFactorCodeExpiry { get; set; }
    }
}