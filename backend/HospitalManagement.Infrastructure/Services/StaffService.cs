using HospitalManagement.Data;
using HospitalManagement.DTOs;
using HospitalManagement.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Services
{
    public class StaffService : IStaffService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;
        private static readonly string[] AllowedRoles = { "Receptionist", "Admin", "Pharmacist" };

        public StaffService(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<IEnumerable<StaffResponseDto>> GetAllAsync()
        {
            var users = _userManager.Users.ToList();
            var result = new List<StaffResponseDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                
                if (roles.Contains("Doctor"))
                {
                    var doctor = await _context.Doctors
                        .FirstOrDefaultAsync(d => d.UserId == user.Id);

                    
                    if (doctor != null && doctor.DeletedAt != null)
                        continue;
                }

                result.Add(new StaffResponseDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? string.Empty,
                    Role = roles.FirstOrDefault() ?? string.Empty,
                    CreatedAt = user.CreatedAt,
                    ProfileImageUrl = user.ProfileImagePath
                });
            }

            return result;
        }

        public async Task<StaffResponseDto> CreateAsync(CreateStaffDto dto)
        {
            if (!AllowedRoles.Contains(dto.Role))
                throw new InvalidOperationException($"Invalid role. Allowed: {string.Join(", ", AllowedRoles)}");

            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser is not null)
                throw new InvalidOperationException("User with this email already exists.");

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(user, dto.Role);

            return new StaffResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                Role = dto.Role,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> DeleteAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null) return false;


            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor is not null)
            {
                _context.Doctors.Remove(doctor);
                await _context.SaveChangesAsync();
            }

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }
    }
}