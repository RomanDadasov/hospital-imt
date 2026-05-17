using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.API.Controllers
{
    [Route("api/queue")]
    [ApiController]
    [Authorize]
    public class QueueController : ControllerBase
    {
        private readonly IQueueService _service;

        public QueueController(IQueueService service)
        {
            _service = service;
        }

        [HttpGet("today")]
        [AllowAnonymous]
        public async Task<IActionResult> GetToday()
        {
            var result = await _service.GetTodayQueueAsync();
            return Ok(ApiResponse<QueueStateDto>.SuccessResponse(result));
        }

        [HttpPost("{appointmentId}/enqueue")]
        public async Task<IActionResult> AddToQueue(Guid appointmentId)
        {
            try
            {
                var result = await _service.AddToQueueAsync(appointmentId);
                return Ok(ApiResponse<AppointmentQueueDto>.SuccessResponse(result));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AppointmentQueueDto>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("{appointmentId}/call")]
        public async Task<IActionResult> CallNext(Guid appointmentId)
        {
            try
            {
                var result = await _service.CallNextAsync(appointmentId);
                return Ok(ApiResponse<AppointmentQueueDto>.SuccessResponse(result));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AppointmentQueueDto>.FailureResponse(ex.Message));
            }
        }

        [HttpPost("{appointmentId}/complete")]
        public async Task<IActionResult> Complete(Guid appointmentId)
        {
            try
            {
                var result = await _service.CompleteCurrentAsync(appointmentId);
                return Ok(ApiResponse<AppointmentQueueDto>.SuccessResponse(result));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AppointmentQueueDto>.FailureResponse(ex.Message));
            }
        }
    }
}
