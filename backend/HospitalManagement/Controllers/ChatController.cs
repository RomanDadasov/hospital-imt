using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using HospitalManagement.Data;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using HospitalManagement.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HospitalManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IFileStorage _fileStorage;
        private readonly AppDbContext _context;

        private static readonly string[] AllowedExtensions =
            { ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".zip" };
        private static readonly string[] AllowedContentTypes =
            { "image/jpeg", "image/png", "application/pdf", "application/zip",
              "application/x-zip-compressed", "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
        private const long MaxFileSize = 10 * 1024 * 1024;

        public ChatController(IChatService chatService, IFileStorage fileStorage, AppDbContext context)
        {
            _chatService = chatService;
            _fileStorage = fileStorage;
            _context = context;
        }

        [HttpGet("{roomId}/history")]
        public async Task<IActionResult> GetHistory(string roomId)
        {
            var result = await _chatService.GetRoomHistoryAsync(roomId);
            return Ok(ApiResponse<IEnumerable<ChatMessageResponseDto>>.SuccessResponse(result));
        }

        [HttpDelete("history/{roomId}")]
        public async Task<IActionResult> ClearHistory(string roomId)
        {
            var role = User.FindFirstValue(ClaimTypes.Role) ??
                       User.FindAll(ClaimTypes.Role).FirstOrDefault()?.Value;

            var allowedRooms = role switch
            {
                "Admin" => new[] { "general", "doctors", "admin" },
                "Doctor" => new[] { "general", "doctors" },
                "Receptionist" => new[] { "general", "admin" },
                _ => Array.Empty<string>()
            };

            if (!allowedRooms.Contains(roomId))
                return StatusCode(403, ApiResponse<object>.FailureResponse("You do not have permission to delete this room"));

            var messages = await _context.ChatMessages
                .Where(m => m.RoomId == roomId)
                .ToListAsync();

            _context.ChatMessages.RemoveRange(messages);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse(null, $"{messages.Count} message deleted"));
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFile(IFormFile file, CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
                return BadRequest(ApiResponse<object>.FailureResponse("No file selected"));

            if (file.Length > MaxFileSize)
                return BadRequest(ApiResponse<object>.FailureResponse("The file cannot be larger than 10MB"));

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                return BadRequest(ApiResponse<object>.FailureResponse("This file format is not supported"));

            if (!AllowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
                return BadRequest(ApiResponse<object>.FailureResponse("This file type is not supported"));

            await using var stream = file.OpenReadStream();
            var info = await _fileStorage.UploadAsync(stream, file.FileName, file.ContentType, "chat", cancellationToken);

            var url = info.StorageKey.StartsWith("http")
                ? info.StorageKey
                : $"/api/chat/files/{info.StoredFileName}";

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                url,
                fileName = file.FileName,
                contentType = file.ContentType
            }));
        }

        [HttpGet("files/{fileName}")]
        [AllowAnonymous]
        public IActionResult GetFile(string fileName, [FromServices] IWebHostEnvironment env)
        {
            var path = Path.Combine(env.ContentRootPath, "FileStorage", "chat", fileName);
            if (!System.IO.File.Exists(path)) return NotFound();

            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            var contentType = ext switch
            {
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".pdf" => "application/pdf",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".zip" => "application/zip",
                _ => "application/octet-stream"
            };

            return PhysicalFile(path, contentType, enableRangeProcessing: true);
        }
    }
}