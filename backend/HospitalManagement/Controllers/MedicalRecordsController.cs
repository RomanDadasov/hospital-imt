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
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordService _service;
        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
        private string UserFullName => $"{User.FindFirstValue(ClaimTypes.GivenName)} {User.FindFirstValue(ClaimTypes.Surname)}".Trim();

        public MedicalRecordsController(IMedicalRecordService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatient(Guid patientId)
        {
            var result = await _service.GetByPatientIdAsync(patientId);
            return Ok(ApiResponse<IEnumerable<MedicalRecordResponseDto>>.SuccessResponse(result));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result is null) return NotFound(ApiResponse<MedicalRecordResponseDto>.FailureResponse("Record not found"));
            return Ok(ApiResponse<MedicalRecordResponseDto>.SuccessResponse(result));
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> Create([FromBody] CreateMedicalRecordDto dto)
        {
            var userId = UserId ?? "system";
            var result = await _service.CreateAsync(dto, userId, UserFullName);
            return CreatedAtAction(nameof(GetById), new { id = result.Id },
                ApiResponse<MedicalRecordResponseDto>.SuccessResponse(result, "Record created"));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMedicalRecordDto dto)
        {
            var userId = UserId ?? "system";
            var result = await _service.UpdateAsync(id, dto, userId, UserFullName);
            if (result is null) return NotFound(ApiResponse<MedicalRecordResponseDto>.FailureResponse("Record not found"));
            return Ok(ApiResponse<MedicalRecordResponseDto>.SuccessResponse(result, "Record updated"));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = UserId ?? "system";
            var result = await _service.DeleteAsync(id, userId, UserFullName);
            if (!result) return NotFound(ApiResponse<object>.FailureResponse("Record not found"));
            return NoContent();
        }

        [HttpGet("patient/{patientId}/pdf")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> DownloadPatientHistoryPdf(Guid patientId)
        {
            try
            {
                var bytes = await _service.GeneratePatientHistoryPdfAsync(patientId);
                return File(bytes, "application/pdf", $"tibbi-tarixce-{patientId.ToString()[..8]}.pdf");
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<object>.FailureResponse("Patient not found"));
            }
        }
    }
}
