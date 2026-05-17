using HospitalManagement.API.Hubs;
using HospitalManagement.Application.DTOs;
using HospitalManagement.Common;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Controllers
{
    [Route("api/appointment-requests")]
    [ApiController]
    public class AppointmentRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<AppointmentRequestHub> _hub;

        public AppointmentRequestsController(AppDbContext context, IHubContext<AppointmentRequestHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentRequestDto dto)
        {
            var request = new AppointmentRequest
            {
                PatientName = dto.PatientName,
                PatientPhone = dto.PatientPhone,
                Message = dto.Message,
                DoctorName = dto.DoctorName,
                DoctorSpecialization = dto.DoctorSpecialization,
                BodyRegion = dto.BodyRegion,
                Severity = dto.Severity,
            };

            _context.AppointmentRequests.Add(request);
            await _context.SaveChangesAsync();

            await _hub.Clients.Group("Receptionists").SendAsync("NewAppointmentRequest", new AppointmentRequestResponseDto
            {
                Id = request.Id,
                PatientName = request.PatientName,
                PatientPhone = request.PatientPhone,
                Message = request.Message,
                DoctorName = request.DoctorName,
                DoctorSpecialization = request.DoctorSpecialization,
                BodyRegion = request.BodyRegion,
                Severity = request.Severity,
                IsRead = request.IsRead,
                CreatedAt = request.CreatedAt,
            });

            return Ok(ApiResponse<object>.SuccessResponse(null, "Your application has been accepted"));
        }

        
        [HttpGet]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.AppointmentRequests
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new AppointmentRequestResponseDto
                {
                    Id = r.Id,
                    PatientName = r.PatientName,
                    PatientPhone = r.PatientPhone,
                    Message = r.Message,
                    DoctorName = r.DoctorName,
                    DoctorSpecialization = r.DoctorSpecialization,
                    BodyRegion = r.BodyRegion,
                    Severity = r.Severity,
                    IsRead = r.IsRead,
                    CreatedAt = r.CreatedAt,
                })
                .ToListAsync();

            return Ok(ApiResponse<List<AppointmentRequestResponseDto>>.SuccessResponse(list));
        }

        [HttpPatch("{id}/read")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var request = await _context.AppointmentRequests.FindAsync(id);
            if (request is null) return NotFound();
            request.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.SuccessResponse(null, "Read"));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var request = await _context.AppointmentRequests.FindAsync(id);
            if (request is null) return NotFound();
            _context.AppointmentRequests.Remove(request);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
