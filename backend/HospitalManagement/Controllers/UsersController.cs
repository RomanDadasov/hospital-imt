using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using HospitalManagement.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using HospitalManagement.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Hosting;

namespace HospitalManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [Produces("application/json")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _env;
        private readonly IFileStorage _fileStorage; 

        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        public UsersController(
            IUserService userService,
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment env,
            IFileStorage fileStorage) 
        {
            _userService = userService;
            _userManager = userManager;
            _env = env;
            _fileStorage = fileStorage; 
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = UserId ?? throw new InvalidOperationException("User not found");
            var result = await _userService.GetProfileAsync(userId);
            if (result is null)
                return NotFound(ApiResponse<object>.FailureResponse("User not found"));
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result, "Profile retrieved successfully"));
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = UserId ?? throw new InvalidOperationException("User not found");
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid request data", errors));
            }
            try
            {
                var result = await _userService.UpdateProfileAsync(userId, dto);
                if (result is null)
                    return NotFound(ApiResponse<object>.FailureResponse("User not found"));
                return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result, "Profile updated successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = UserId ?? throw new InvalidOperationException("User not found");
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid request data", errors));
            }
            try
            {
                await _userService.ChangePasswordAsync(userId, dto);
                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Password changed successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("me/upload-image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfileImage(
            IFormFile file,
            CancellationToken cancellationToken)
        {
            var userId = UserId ?? throw new InvalidOperationException("User not found");

            if (file is null || file.Length == 0)
                return BadRequest(ApiResponse<object>.FailureResponse("File is required"));

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(ApiResponse<object>.FailureResponse("Only jpg, jpeg, png allowed"));

            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return NotFound(ApiResponse<object>.FailureResponse("User not found"));

            if (!string.IsNullOrEmpty(user.ProfileImagePath))
            {
                try { await _fileStorage.DeleteAsync(user.ProfileImagePath, cancellationToken); }
                catch {  }
            }

          
            await using var stream = file.OpenReadStream();
            var info = await _fileStorage.UploadAsync(
                stream, file.FileName, file.ContentType, "profiles", cancellationToken);

            user.ProfileImagePath = info.StorageKey;
            await _userManager.UpdateAsync(user);

            return Ok(ApiResponse<object>.SuccessResponse(
                new { imageUrl = info.StorageKey },
                "Image uploaded successfully"));
        }

       
        [HttpGet("profiles/{fileName}")]
        [AllowAnonymous]
        public IActionResult GetProfileImage(string fileName)
        {
            var path = Path.Combine(_env.ContentRootPath, "FileStorage", "profiles", fileName);
            if (!System.IO.File.Exists(path))
                return NotFound();
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            var contentType = ext == ".png" ? "image/png" : "image/jpeg";
            return PhysicalFile(path, contentType);
        }
    }
}