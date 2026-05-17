using DocumentFormat.OpenXml.Spreadsheet;
using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _service;
        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        public PrescriptionsController(IPrescriptionService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Policy = "AllRoles")]
        public async Task<IActionResult> Create([FromBody] CreatePrescriptionDto dto)
        {
            var userId = UserId ?? throw new InvalidOperationException("User not found");
            var result = await _service.CreateAsync(dto, userId);
            return Ok(ApiResponse<PrescriptionResponseDto>.SuccessResponse(result, "The prescription has been created"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result is null) return NotFound(ApiResponse<object>.FailureResponse("Recipe not found"));
            return Ok(ApiResponse<PrescriptionResponseDto>.SuccessResponse(result));
        }

        [HttpGet("qr/{qrCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByQrCode(string qrCode)
        {
            var result = await _service.GetByQrCodeAsync(qrCode);
            if (result is null) return NotFound(ApiResponse<object>.FailureResponse("Recipe not found"));
            return Ok(ApiResponse<PrescriptionResponseDto>.SuccessResponse(result));
        }

        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointment(Guid appointmentId)
        {
            var result = await _service.GetByAppointmentIdAsync(appointmentId);
            return Ok(ApiResponse<IEnumerable<PrescriptionResponseDto>>.SuccessResponse(result));
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatient(Guid patientId)
        {
            var result = await _service.GetByPatientIdAsync(patientId);
            return Ok(ApiResponse<IEnumerable<PrescriptionResponseDto>>.SuccessResponse(result));
        }

        [HttpPost("dispense/{qrCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> Dispense(string qrCode)
        {
            var result = await _service.DispenseAsync(qrCode);
            if (!result) return BadRequest(ApiResponse<object>.FailureResponse("Prescription not found or already given"));
            return Ok(ApiResponse<object>.SuccessResponse(null, "A prescription was given"));
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadPdf(Guid id)
        {
            try
            {
                var bytes = await _service.GeneratePdfAsync(id);
                return File(bytes, "application/pdf", $"resept-{id.ToString()[..8]}.pdf");
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<object>.FailureResponse("Recipe not found"));
            }
        }
    }
}
