using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalManagement.Controllers
{
    /// <summary>
    /// Controller to manage hospital doctors.
    /// </summary>
    /// <remarks>
    /// Provides endpoints to list, create, update, and delete doctors.
    /// Admin role is required for creating, updating, or deleting doctors.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _service;
        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
        private string UserFullName => $"{User.FindFirstValue(ClaimTypes.GivenName)} {User.FindFirstValue(ClaimTypes.Surname)}".Trim();

        /// <summary>
        /// Initializes a new instance of the <see cref="DoctorsController"/> class.
        /// </summary>
        /// <param name="service">Service that handles doctor business logic.</param>
        public DoctorsController(IDoctorService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retrieves all doctors with optional query parameters for filtering and paging.
        /// </summary>
        /// <param name="parameters">Filtering and paging parameters.</param>
        /// <returns>200 OK with a paged list of <see cref="DoctorResponseDto"/>.</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] DoctorQueryParameters parameters)
        {
            var result = await _service.GetAllAsync(parameters);
            return Ok(ApiResponse<PagedResult<DoctorResponseDto>>.SuccessResponse(result));
        }

        /// <summary>
        /// Retrieves a doctor by their unique identifier.
        /// </summary>
        /// <param name="id">The doctor's GUID identifier.</param>
        /// <returns>
        /// 200 OK with the <see cref="DoctorResponseDto"/> if found;
        /// 404 NotFound if the doctor does not exist.
        /// </returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result is null) return NotFound(ApiResponse<DoctorResponseDto>.FailureResponse("Doctor not found"));
            return Ok(ApiResponse<DoctorResponseDto>.SuccessResponse(result));
        }

        /// <summary>
        /// Creates a new doctor.
        /// </summary>
        /// <param name="dto">DTO containing the new doctor's data.</param>
        /// <returns>
        /// 201 Created with the created <see cref="DoctorResponseDto"/>;
        /// Requires Admin role.
        /// </returns>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateDoctorDto dto)
        {
            var userId = UserId ?? "system";
            var result = await _service.CreateAsync(dto, userId, UserFullName);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<DoctorResponseDto>.SuccessResponse(result, "Doctor created"));
        }

        /// <summary>
        /// Updates an existing doctor.
        /// </summary>
        /// <param name="id">Identifier of the doctor to update.</param>
        /// <param name="dto">DTO containing updated fields.</param>
        /// <returns>
        /// 200 OK with updated <see cref="DoctorResponseDto"/> if successful;
        /// 404 NotFound if the doctor does not exist;
        /// Requires Admin role.
        /// </returns>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDoctorDto dto)
        {
            var userId = UserId ?? "system";
            var result = await _service.UpdateAsync(id, dto, userId, UserFullName);
            if (result is null) return NotFound(ApiResponse<DoctorResponseDto>.FailureResponse("Doctor not found"));
            return Ok(ApiResponse<DoctorResponseDto>.SuccessResponse(result, "Doctor updated"));
        }

        /// <summary>
        /// Deletes a doctor.
        /// </summary>
        /// <param name="id">Identifier of the doctor to delete.</param>
        /// <returns>
        /// 204 NoContent if deletion is successful;
        /// 404 NotFound if the doctor does not exist;
        /// Requires Admin role.
        /// </returns>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = UserId ?? "system";
            var result = await _service.DeleteAsync(id, userId, UserFullName);
            if (!result) return NotFound(ApiResponse<object>.FailureResponse("Doctor not found"));
            return NoContent();
        }
    }
}