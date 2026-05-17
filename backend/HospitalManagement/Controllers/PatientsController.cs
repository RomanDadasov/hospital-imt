using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalManagement.Controllers
{
    /// <summary>
    /// Controller to manage hospital patients.
    /// </summary>
    /// <remarks>
    /// Provides endpoints to list, create, update, delete, and archive patients.
    /// Admin or Receptionist role is required for most operations; AdminOnly for delete.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOrReceptionist")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _service;
        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
        private string UserFullName => $"{User.FindFirstValue(ClaimTypes.GivenName)} {User.FindFirstValue(ClaimTypes.Surname)}".Trim();

        /// <summary>
        /// Initializes a new instance of the <see cref="PatientsController"/> class.
        /// </summary>
        /// <param name="service">Service that handles patient business logic.</param>
        public PatientsController(IPatientService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retrieves all patients with optional query parameters for filtering and paging.
        /// </summary>
        /// <param name="parameters">Query parameters for filtering and paging.</param>
        /// <returns>200 OK with a paged list of <see cref="PatientResponseDto"/>.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters)
        {
            var result = await _service.GetAllAsync(parameters);
            return Ok(ApiResponse<PagedResult<PatientResponseDto>>.SuccessResponse(result));
        }

        /// <summary>
        /// Retrieves a patient by their unique identifier.
        /// </summary>
        /// <param name="id">The patient's GUID identifier.</param>
        /// <returns>
        /// 200 OK with <see cref="PatientResponseDto"/> if found;
        /// 404 NotFound if patient does not exist.
        /// </returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result is null) return NotFound(ApiResponse<PatientResponseDto>.FailureResponse("Patient not found"));
            return Ok(ApiResponse<PatientResponseDto>.SuccessResponse(result));
        }

        /// <summary>
        /// Creates a new patient.
        /// </summary>
        /// <param name="dto">DTO containing patient creation data.</param>
        /// <returns>
        /// 201 Created with created <see cref="PatientResponseDto"/>; 
        /// Requires Admin or Receptionist role.
        /// </returns>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePatientDto dto)
        {
            var userId = UserId ?? "system";
            var result = await _service.CreateAsync(dto, userId, UserFullName);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<PatientResponseDto>.SuccessResponse(result, "Patient created"));
        }

        /// <summary>
        /// Updates an existing patient.
        /// </summary>
        /// <param name="id">Identifier of the patient to update.</param>
        /// <param name="dto">DTO containing updated fields.</param>
        /// <returns>
        /// 200 OK with updated <see cref="PatientResponseDto"/> if successful;
        /// 404 NotFound if patient does not exist.
        /// </returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientDto dto)
        {
            var userId = UserId ?? "system";
            var result = await _service.UpdateAsync(id, dto, userId, UserFullName);
            if (result is null) return NotFound(ApiResponse<PatientResponseDto>.FailureResponse("Patient not found"));
            return Ok(ApiResponse<PatientResponseDto>.SuccessResponse(result, "Patient updated"));
        }

        /// <summary>
        /// Deletes a patient.
        /// </summary>
        /// <param name="id">Identifier of the patient to delete.</param>
        /// <returns>
        /// 204 NoContent if deletion succeeds;
        /// 400 BadRequest if patient has appointments and cannot be deleted;
        /// Requires Admin role.
        /// </returns>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = UserId ?? "system";
            var result = await _service.DeleteAsync(id, userId, UserFullName);
            if (!result) return BadRequest(ApiResponse<object>.FailureResponse("Cannot delete patient with appointments"));
            return NoContent();
        }

        /// <summary>
        /// Archives (soft-deletes) a patient.
        /// </summary>
        /// <param name="id">Identifier of the patient to archive.</param>
        /// <returns>
        /// 204 NoContent if successful;
        /// 404 NotFound if patient does not exist.
        /// </returns>
        [HttpPatch("archive/{id}")]
        public async Task<IActionResult> Archive(Guid id)
        {
            var result = await _service.ArchiveAsync(id);
            if (!result) return NotFound(ApiResponse<object>.FailureResponse("Patient not found"));
            return NoContent();
        }
    }
}