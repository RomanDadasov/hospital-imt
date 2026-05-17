using HospitalManagement.Application.DTOs;
using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalManagement.Controllers
{
    /// <summary>
    /// Controller that manages appointment-related operations.
    /// </summary>
    /// <remarks>
    /// All endpoints require an authenticated user. Specific endpoints enforce
    /// additional authorization policies (see individual actions).
    /// Responses are wrapped in <see cref="ApiResponse{T}"/> for consistency.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _service;
        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
        private string UserFullName => $"{User.FindFirstValue(ClaimTypes.GivenName)} {User.FindFirstValue(ClaimTypes.Surname)}".Trim();

        /// <summary>
        /// Initializes a new instance of the <see cref="AppointmentsController"/> class.
        /// </summary>
        /// <param name="service">Service that encapsulates appointment business logic.</param>
        public AppointmentsController(IAppointmentService service)
        {
            _service = service;
        }

        [HttpGet("stats")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> GetStats()
        {
            var result = await _service.GetStatsAsync();
            return Ok(ApiResponse<AppointmentStatsDto>.SuccessResponse(result));
        }

        /// <summary>
        /// Retrieves a paged list of appointments.
        /// </summary>
        /// <remarks>
        /// Authorization: <c>AdminOrReceptionist</c> policy required.
        /// Returns paged appointment results filtered by query parameters.
        /// </remarks>
        /// <param name="parameters">Query parameters that control paging and filtering.</param>
        /// <returns>
        /// 200 OK with <see cref="ApiResponse{PagedResult}"/> containing a page of <see cref="AppointmentResponseDto"/>.
        /// Possible error responses: 401 Unauthorized, 403 Forbidden.
        /// </returns>
        [HttpGet]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> GetAll([FromQuery] AppointmentQueryParameters parameters)
        {
            var result = await _service.GetAllAsync(parameters);
            return Ok(ApiResponse<PagedResult<AppointmentResponseDto>>.SuccessResponse(result));
        }

        /// <summary>
        /// Retrieves a single appointment by its unique identifier.
        /// </summary>
        /// <param name="id">The appointment <see cref="Guid"/> identifier.</param>
        /// <returns>
        /// 200 OK with <see cref="ApiResponse{AppointmentResponseDto}"/> when found;
        /// 404 NotFound with failure response when the appointment does not exist;
        /// 401 Unauthorized when the caller is not authenticated.
        /// </returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result is null) return NotFound(ApiResponse<AppointmentResponseDto>.FailureResponse("Appointment not found"));
            return Ok(ApiResponse<AppointmentResponseDto>.SuccessResponse(result));
        }

        /// <summary>
        /// Creates a new appointment.
        /// </summary>
        /// <remarks>
        /// Authorization: <c>AdminOrReceptionist</c> policy required.
        /// The request body must contain a valid <see cref="CreateAppointmentDto"/>.
        /// </remarks>
        /// <param name="dto">DTO containing appointment creation data.</param>
        /// <returns>
        /// 201 Created with the created <see cref="AppointmentResponseDto"/> wrapped in <see cref="ApiResponse{T}"/>.
        /// 400 BadRequest when the request is invalid.
        /// 401 Unauthorized or 403 Forbidden where applicable.
        /// </returns>
        /// <exception cref="InvalidOperationException">Thrown when user identity is not present in the token.</exception>
        [HttpPost]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
        {
            var userId = UserId ?? throw new InvalidOperationException("User not found");
            var result = await _service.CreateAsync(dto, userId, UserFullName);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AppointmentResponseDto>.SuccessResponse(result, "Appointment created"));
        }

        /// <summary>
        /// Updates an existing appointment.
        /// </summary>
        /// <remarks>
        /// Authorization: <c>AdminOrReceptionist</c> policy required.
        /// Only appointments in allowed states can be updated (service-level validation).
        /// </remarks>
        /// <param name="id">Appointment identifier to update.</param>
        /// <param name="dto">DTO containing updatable fields.</param>
        /// <returns>
        /// 200 OK with updated <see cref="AppointmentResponseDto"/> when successful;
        /// 400 BadRequest when the update is not allowed;
        /// 401/403 for authorization issues;
        /// 404 NotFound if the appointment does not exist.
        /// </returns>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAppointmentDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result is null) return BadRequest(ApiResponse<AppointmentResponseDto>.FailureResponse("Cannot update appointment"));
            return Ok(ApiResponse<AppointmentResponseDto>.SuccessResponse(result, "Appointment updated"));
        }

        /// <summary>
        /// Changes the status of an appointment.
        /// </summary>
        /// <remarks>
        /// This endpoint accepts partial updates to the appointment's status.
        /// The caller must be authorized; service-level rules determine allowed transitions.
        /// </remarks>
        /// <param name="id">Identifier of the appointment to change status for.</param>
        /// <param name="dto">DTO carrying the new status value.</param>
        /// <returns>
        /// 200 OK with the updated <see cref="AppointmentResponseDto"/> when the status change succeeds;
        /// 404 NotFound when the appointment is not found.
        /// </returns>
        [HttpPatch("status/{id}")]
        public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeAppointmentStatusDto dto)
        {
            var userId = UserId ?? "system";
            var result = await _service.ChangeStatusAsync(id, dto, userId, UserFullName);
            if (result is null) return NotFound(ApiResponse<AppointmentResponseDto>.FailureResponse("Appointment not found"));
            return Ok(ApiResponse<AppointmentResponseDto>.SuccessResponse(result, "Status changed"));
        }

        /// <summary>
        /// Archives an appointment (soft-delete).
        /// </summary>
        /// <remarks>
        /// Authorization: <c>AdminOnly</c> policy required.
        /// This performs a soft-delete (sets deleted timestamp) so records remain for audit/history.
        /// </remarks>
        /// <param name="id">Identifier of the appointment to archive.</param>
        /// <returns>
        /// 204 NoContent when the archive operation succeeds;
        /// 404 NotFound when the appointment does not exist;
        /// 401/403 for authorization failures.
        /// </returns>
        [HttpPatch("archive/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Archive(Guid id)
        {
            var result = await _service.ArchiveAsync(id);
            if (!result) return NotFound(ApiResponse<object>.FailureResponse("Appointment not found"));
            return NoContent();
        }

        /// <summary>
        /// Permanently deletes an appointment.
        /// </summary>
        /// <remarks>
        /// Authorization: <c>AdminOnly</c> policy required.
        /// Use with caution — this operation removes the record from storage.
        /// </remarks>
        /// <param name="id">Identifier of the appointment to delete.</param>
        /// <returns>
        /// 204 NoContent when deletion succeeds;
        /// 404 NotFound when the appointment does not exist;
        /// 401/403 for authorization issues.
        /// </returns>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = UserId ?? "system";
            var result = await _service.DeleteAsync(id, userId, UserFullName);
            if (!result) return NotFound(ApiResponse<object>.FailureResponse("Appointment not found"));
            return NoContent();
        }

        /// <summary>
        /// Retrieves appointments belonging to the currently authenticated doctor.
        /// </summary>
        /// <remarks>
        /// Authorization: <c>AllRoles</c> policy required (doctor, admin, receptionist as appropriate).
        /// Caller must present a valid JWT containing the user's identifier claim.
        /// </remarks>
        /// <param name="cancellationToken">Cancellation token provided by the framework.</param>
        /// <returns>
        /// 200 OK with <see cref="ApiResponse{IEnumerable}"/> containing the doctor's appointments;
        /// 401 Unauthorized when the call lacks a valid authentication token.
        /// </returns>
        /// <exception cref="InvalidOperationException">Thrown when the current user id cannot be resolved from the token.</exception>
        [HttpGet("my")]
        [Authorize(Policy = "AllRoles")]
        public async Task<IActionResult> GetMyAppointments(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = UserId ?? throw new InvalidOperationException("User not found");
            var result = await _service.GetByDoctorUserIdAsync(userId, status, page, pageSize);
            return Ok(ApiResponse<IEnumerable<AppointmentResponseDto>>.SuccessResponse(result));
        }

        /// <summary>
        /// Downloads a PDF representation of the appointment.
        /// </summary>
        /// <param name="id">Identifier of the appointment whose PDF is requested.</param>
        /// <returns>
        /// 200 OK with binary PDF file content and appropriate content type when appointment exists;
        /// 404 NotFound when the appointment is not found.
        /// </returns>
        [HttpGet("{id}/download/pdf")]
        public async Task<IActionResult> DownloadPdf(Guid id)
        {
            try
            {
                var bytes = await _service.GeneratePdfAsync(id);
                return File(bytes, "application/pdf", $"appointment-{id.ToString()[..8]}.pdf");
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<object>.FailureResponse("Appointment not found"));
            }
        }

        /// <summary>
        /// Downloads a DOCX representation of the appointment.
        /// </summary>
        /// <param name="id">Identifier of the appointment whose DOCX is requested.</param>
        /// <returns>
        /// 200 OK with binary DOCX file content and appropriate content type when appointment exists;
        /// 404 NotFound when the appointment is not found.
        /// </returns>
        [HttpGet("{id}/download/docx")]
        public async Task<IActionResult> DownloadDocx(Guid id)
        {
            try
            {
                var bytes = await _service.GenerateDocxAsync(id);
                return File(bytes,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    $"appointment-{id.ToString()[..8]}.docx");
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<object>.FailureResponse("Appointment not found"));
            }
        }
    }
}