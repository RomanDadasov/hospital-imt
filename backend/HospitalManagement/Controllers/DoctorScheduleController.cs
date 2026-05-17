using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DoctorScheduleController : ControllerBase
    {
        private readonly IDoctorScheduleService _service;

        public DoctorScheduleController(IDoctorScheduleService service)
        {
            _service = service;
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetByDoctor(Guid doctorId)
        {
            var result = await _service.GetByDoctorIdAsync(doctorId);
            return Ok(ApiResponse<IEnumerable<DoctorScheduleDto>>.SuccessResponse(result));
        }

        [HttpGet("doctor/{doctorId}/weekly")]
        [AllowAnonymous]
        public async Task<IActionResult> GetWeekly(Guid doctorId, [FromQuery] DateTime? weekStart)
        {
            var start = weekStart?.Date ?? DateTime.Today;
            
            var diff = (7 + (int)start.DayOfWeek - (int)DayOfWeek.Monday) % 7;
            start = start.AddDays(-diff);

            var result = await _service.GetWeeklyScheduleAsync(doctorId, start);
            if (result is null) return NotFound(ApiResponse<object>.FailureResponse("Doctor not found"));
            return Ok(ApiResponse<DoctorWeeklyScheduleDto>.SuccessResponse(result));
        }

        [HttpGet("all/weekly")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllWeekly([FromQuery] DateTime? weekStart)
        {
            var start = weekStart?.Date ?? DateTime.Today;
            var diff = (7 + (int)start.DayOfWeek - (int)DayOfWeek.Monday) % 7;
            start = start.AddDays(-diff);

            var result = await _service.GetAllDoctorsScheduleAsync(start);
            return Ok(ApiResponse<IEnumerable<DoctorWeeklyScheduleDto>>.SuccessResponse(result));
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateDoctorScheduleDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(ApiResponse<DoctorScheduleDto>.SuccessResponse(result, "Table added"));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDoctorScheduleDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result is null) return NotFound(ApiResponse<object>.FailureResponse("Table not found"));
            return Ok(ApiResponse<DoctorScheduleDto>.SuccessResponse(result, "The table has been updated"));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(ApiResponse<object>.FailureResponse("Table not found"));
            return NoContent();
        }
    }
}
