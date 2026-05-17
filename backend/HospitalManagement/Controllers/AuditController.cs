using HospitalManagement.Application.DTOs;
using HospitalManagement.Common;
using HospitalManagement.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AuditController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? userId = null,
            [FromQuery] string? action = null,
            [FromQuery] string? entityType = null,
            [FromQuery] DateTimeOffset? dateFrom = null,
            [FromQuery] DateTimeOffset? dateTo = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(a => a.UserId == userId);
            if (!string.IsNullOrEmpty(action))
                query = query.Where(a => a.Action == action);
            if (!string.IsNullOrEmpty(entityType))
                query = query.Where(a => a.EntityType == entityType);
            if (dateFrom.HasValue)
                query = query.Where(a => a.CreatedAt >= dateFrom.Value);
            if (dateTo.HasValue)
                query = query.Where(a => a.CreatedAt <= dateTo.Value);

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserFullName = a.UserFullName,
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    Details = a.Details,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<PagedResult<AuditLogDto>>.SuccessResponse(
                PagedResult<AuditLogDto>.Create(items, page, pageSize, total)
                ));
        }
    }
}
