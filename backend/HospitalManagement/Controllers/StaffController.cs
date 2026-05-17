using HospitalManagement.Application.DTOs;
using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.Controllers
{
    /// <summary>
    /// Controller to manage hospital staff members.
    /// </summary>
    /// <remarks>
    /// All endpoints require Admin role.
    /// Provides endpoints to list, create, and delete staff members.
    /// Responses are wrapped in <see cref="ApiResponse{T}"/>.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    [Produces("application/json")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IUserService _userService;

        /// <summary>
        /// Initializes a new instance of the <see cref="StaffController"/> class.
        /// </summary>
        /// <param name="staffService">Service that handles staff business logic.</param>
        public StaffController(IStaffService staffService, IUserService userService)
        {
            _staffService = staffService;
            _userService = userService;
        }

        /// <summary>
        /// Retrieves all staff members.
        /// </summary>
        /// <returns>
        /// 200 OK with a list of <see cref="StaffResponseDto"/>.
        /// </returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<StaffResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _staffService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<StaffResponseDto>>.SuccessResponse(result, "Staff retrieved successfully"));
        }

        /// <summary>
        /// Creates a new staff member.
        /// </summary>
        /// <param name="dto">DTO containing staff creation data.</param>
        /// <returns>
        /// 201 Created with <see cref="StaffResponseDto"/> when successful;
        /// 400 BadRequest if request data is invalid or operation fails.
        /// </returns>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<StaffResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid request data", errors));
            }
            try
            {
                var result = await _staffService.CreateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, ApiResponse<StaffResponseDto>.SuccessResponse(result, "Staff created successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        /// <summary>
        /// Deletes a staff member by user ID.
        /// </summary>
        /// <param name="userId">Identifier of the staff member to delete.</param>
        /// <returns>
        /// 204 NoContent if deletion succeeds;
        /// 404 NotFound if staff member does not exist.
        /// </returns>
        [HttpDelete("{userId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(string userId)
        {
            var result = await _staffService.DeleteAsync(userId);
            if (!result) return NotFound(ApiResponse<object>.FailureResponse("Staff member not found"));
            return NoContent();
        }

        [HttpPatch("{userId}/reset-password")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword(string userId, [FromBody] ResetStaffPasswordDto dto)
        {
            try
            {
                await _userService.ResetStaffPasswordAsync(userId, dto.NewPassword);
                return Ok(ApiResponse<object>.SuccessResponse(null, "The password was successfully reset"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }
    }
}