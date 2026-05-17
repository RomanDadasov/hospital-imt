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
    /// Controller to manage attachments for appointments.
    /// </summary>
    /// <remarks>
    /// All endpoints require authentication. Admins and Receptionists can upload and delete attachments.
    /// Attachments are linked to specific appointments via the appointmentId route parameter.
    /// </remarks>
    [Route("api/appointments/{appointmentId}/attachments")]
    [ApiController]
    [Authorize]
    [Produces("application/json")]
    public class AttachmentsController : ControllerBase
    {
        private readonly IAttachmentService _attachmentService;
        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        /// <summary>
        /// Initializes a new instance of the <see cref="AttachmentsController"/> class.
        /// </summary>
        /// <param name="attachmentService">Service responsible for attachment operations.</param>
        public AttachmentsController(IAttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
        }

        /// <summary>
        /// Upload a file and attach it to a specific appointment.
        /// </summary>
        /// <param name="appointmentId">The identifier of the appointment to attach the file to.</param>
        /// <param name="file">The file to upload.</param>
        /// <param name="cancellationToken">Cancellation token for the request.</param>
        /// <returns>
        /// 201 Created with the uploaded <see cref="AttachmentResponseDto"/> on success.
        /// 400 BadRequest if no file is provided or file is invalid.
        /// 404 NotFound if the appointment or user is not found.
        /// </returns>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize(Policy = "AdminOrReceptionist")]
        [ProducesResponseType(typeof(ApiResponse<AttachmentResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Upload(
            Guid appointmentId,
            IFormFile file,
            CancellationToken cancellationToken)
        {
            var userId = UserId ?? throw new InvalidOperationException("User ID claim is missing");

            if (file is null || file.Length == 0)
                return BadRequest(ApiResponse<object>.FailureResponse(
                    "No file provided",
                    new List<string> { "File is required." }));

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await _attachmentService.UploadAsync(
                    appointmentId, stream, file.FileName,
                    file.ContentType, file.Length, userId, cancellationToken);

                return StatusCode(StatusCodes.Status201Created,
                    ApiResponse<AttachmentResponseDto>.SuccessResponse(result!, "File uploaded successfully"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        /// <summary>
        /// Download a specific attachment linked to an appointment.
        /// </summary>
        /// <param name="appointmentId">The identifier of the appointment.</param>
        /// <param name="attachmentId">The identifier of the attachment to download.</param>
        /// <param name="cancellationToken">Cancellation token for the request.</param>
        /// <returns>
        /// 200 OK with the file content if found.
        /// 404 NotFound if the attachment does not exist.
        /// </returns>
        [HttpGet("{attachmentId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Download(
            Guid appointmentId,
            int attachmentId,
            CancellationToken cancellationToken)
        {
            var result = await _attachmentService.GetDownloadAsync(attachmentId, cancellationToken);
            if (result is null)
                return NotFound(ApiResponse<object>.FailureResponse("Attachment not found"));

            var (stream, fileName, contentType) = result.Value;
            return File(stream, contentType, fileName);
        }

        /// <summary>
        /// Delete a specific attachment from an appointment.
        /// </summary>
        /// <param name="appointmentId">The identifier of the appointment.</param>
        /// <param name="attachmentId">The identifier of the attachment to delete.</param>
        /// <param name="cancellationToken">Cancellation token for the request.</param>
        /// <returns>
        /// 204 NoContent on successful deletion.
        /// 404 NotFound if the attachment does not exist.
        /// </returns>
        [HttpDelete("{attachmentId}")]
        [Authorize(Policy = "AdminOrReceptionist")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(
            Guid appointmentId,
            int attachmentId,
            CancellationToken cancellationToken)
        {
            var result = await _attachmentService.DeleteAsync(attachmentId, cancellationToken);
            if (!result)
                return NotFound(ApiResponse<object>.FailureResponse("Attachment not found"));

            return NoContent();
        }
    }
}