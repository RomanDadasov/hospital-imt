using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Services;
using HospitalManagement.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.Controllers
{
    /// <summary>
    /// Controller to manage hospital departments.
    /// </summary>
    /// <remarks>
    /// Provides endpoints to create, read, update, and delete departments.
    /// Admin role is required for creating, updating, or deleting departments.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _service;
        private readonly IFileStorage _fileStorage;


        /// <summary>
        /// Initializes a new instance of the <see cref="DepartmentsController"/> class.
        /// </summary>
        /// <param name="service">Service that handles department business logic.</param>
        public DepartmentsController(IDepartmentService service, IFileStorage fileStorage)
        {
            _service = service;
            _fileStorage = fileStorage;
        }

        /// <summary>
        /// Retrieves all departments.
        /// </summary>
        /// <returns>
        /// 200 OK with a list of <see cref="DepartmentResponseDto"/>.
        /// </returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<DepartmentResponseDto>>.SuccessResponse(result));
        }

        /// <summary>
        /// Retrieves a department by its unique identifier.
        /// </summary>
        /// <param name="id">The department's GUID identifier.</param>
        /// <returns>
        /// 200 OK with the <see cref="DepartmentResponseDto"/> if found; 
        /// 404 NotFound if the department does not exist.
        /// </returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result is null) return NotFound(ApiResponse<DepartmentResponseDto>.FailureResponse("Department not found"));
            return Ok(ApiResponse<DepartmentResponseDto>.SuccessResponse(result));
        }

        /// <summary>
        /// Creates a new department.
        /// </summary>
        /// <param name="dto">DTO containing the new department data.</param>
        /// <returns>
        /// 201 Created with the created <see cref="DepartmentResponseDto"/>; 
        /// Requires Admin role.
        /// </returns>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateDepartmentDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<DepartmentResponseDto>.SuccessResponse(result, "Department created"));
        }

        /// <summary>
        /// Updates an existing department.
        /// </summary>
        /// <param name="id">Identifier of the department to update.</param>
        /// <param name="dto">DTO containing updated fields.</param>
        /// <returns>
        /// 200 OK with updated <see cref="DepartmentResponseDto"/> if successful;
        /// 404 NotFound if the department does not exist; 
        /// Requires Admin role.
        /// </returns>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result is null) return NotFound(ApiResponse<DepartmentResponseDto>.FailureResponse("Department not found"));
            return Ok(ApiResponse<DepartmentResponseDto>.SuccessResponse(result, "Department updated"));
        }

        /// <summary>
        /// Deletes a department.
        /// </summary>
        /// <param name="id">Identifier of the department to delete.</param>
        /// <returns>
        /// 204 NoContent if deletion is successful;
        /// 400 BadRequest if department has associated doctors and cannot be deleted;
        /// Requires Admin role.
        /// </returns>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return BadRequest(ApiResponse<object>.FailureResponse("Cannot delete department with doctors"));
            return NoContent();
        }

        [HttpPost("{id}/image")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
        {
            var department = await _service.GetByIdAsync(id);
            if (department is null) return NotFound();

            using var stream = file.OpenReadStream();
            var stored = await _fileStorage.UploadAsync(
                stream, file.FileName, file.ContentType, "departments");

            var dto = new UpdateDepartmentDto
            {
                Name = department.Name,
                Description = department.Description,
                ImageUrl = stored.StorageKey
            };

            var result = await _service.UpdateAsync(id, dto);
            return Ok(ApiResponse<DepartmentResponseDto>.SuccessResponse(result));
        }
    }
}