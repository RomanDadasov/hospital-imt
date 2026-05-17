using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.API.Controllers
{
    [Route("api/patient-portal")]
    [ApiController]
    [AllowAnonymous]
    public class PatientPortalController : ControllerBase
    {
        private readonly IPatientPortalService _service;

        public PatientPortalController(IPatientPortalService service)
        {
            _service = service;
        }

        [HttpGet("{token}")]
        public async Task<IActionResult> GetPortalData(string token)
        {
            var result = await _service.GetPortalDataAsync(token);
            if (result is null)
                return NotFound(ApiResponse<PatientPortalDto>.FailureResponse("The token is invalid or has expired"));
            return Ok(ApiResponse<PatientPortalDto>.SuccessResponse(result));
        }

        [HttpPost("{token}/pay/{appointmentId}")]
        public async Task<IActionResult> Pay(string token, Guid appointmentId)
        {
            var result = await _service.PayAsync(token, appointmentId);
            if (!result)
                return BadRequest(ApiResponse<object>.FailureResponse("The payment failed"));
            return Ok(ApiResponse<object>.SuccessResponse(null, "Payment completed successfully"));
        }
    }
}